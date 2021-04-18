const {
  CREATED,
  RECORD_UPDATED,
  OK,
  NOT_FOUND,
  USER_BLOCK,
  RECORDS_FOUND,
  NO_RECORD_FOUND
} = require("../../utils/constants");
const APIError = require("../../utils/APIError");
const AppController = require("./base");
const FindByIdModelUtilities = require("../../utils/FindByIdModelUtils");
const user = require("../models/user");
const channelpartner = require("../models/channelPartner");
const salepersonmaster = require("../models/salePersonMaster");
class UserController extends AppController {
  constructor(model) {
    super(model);
    this._model = model;
    this.reservedVars = [
      "populate",
      "fields",
      "page",
      "perPage",
      "counter",
      "asc",
      "dsc",
      "query"
    ];
    this.byIdUtils = new FindByIdModelUtilities();
    this.userById = this.userById.bind(this);
    this.userList = this.userList.bind(this);
    this.userUpdate = this.userUpdate.bind(this);
    this.userBlock = this.userBlock.bind(this);
    this.dealerList = this.dealerList.bind(this);
    this.salePersonIncentives = this.salePersonIncentives.bind(this);
  }

  async userById(req, res, next) {
    try {
      const savedObject = await this.byIdUtils.userById(
        req.params.id,
        req.query.populate
      );
      if (!savedObject) {
        return res
          .status(NOT_FOUND)
          .json({ code: NOT_FOUND, message: NO_RECORD_FOUND });
      }
      return res
        .status(OK)
        .json({ data: savedObject, code: OK, message: RECORDS_FOUND });
    } catch (error) {
      return next(error);
    }
  }

  async userList(req, res, next) {
    try {
      let whereIsMyData = req.body.where
        ? JSON.parse(req.body.where)
        : this.removeReservedVars(req.query, this.reservedVars);
      let page = parseInt(req.query.page) || 0;
      let limit = parseInt(req.query.perPage) || 10;
      let include = req.query.populate;
      let attributes = this.getFieldAsArray(req.query.fields);
      let asc = this.getFieldAsArray(req.query.asc) || [];
      let dsc = this.getFieldAsArray(req.query.dsc) || [];
      var assort = {};
      asc.forEach(elem => {
        assort[elem] = 1;
      });
      dsc.forEach(elem => {
        assort[elem] = -1;
      });

      if (!req.query.perPage) {
        page = undefined;
        limit = undefined;
      }
      if (req.query.query) {
        this._model.searchables().forEach(element => {
          req.query[`$${element}`] = req.query.query;
        });
      }

      var dissolvedVars = Object.keys(req.query)
        .filter(obj => obj.startsWith("$"))
        .reduce((obj, key) => {
          obj[key.replace("$", "")] = {
            $regex: `${req.query[key]}`,
            $options: "i"
          };
          return obj;
        }, {});

      if (Object.keys(dissolvedVars).length > 0) {
        whereIsMyData.$or = [];
        Object.keys(dissolvedVars).forEach(element => {
          const obj = {};
          obj[element] = dissolvedVars[element];
          whereIsMyData.$or.push(obj);
        });
      }

      if (Object.keys(whereIsMyData).length === 0) {
        whereIsMyData = undefined;
      }

      if (!attributes) {
        attributes = [];
        this._model.elevated().forEach(element => {
          attributes.push(`-${element}`);
        });
      } else {
        attributes = this.utils.arrayOmitter(
          attributes,
          this._model.elevated()
        );
      }

      await this._model
        .find(whereIsMyData)
        .select(attributes)
        .sort(assort)
        .skip(page * limit)
        .limit(limit)
        .populate(include)
        .then(
          async savedObject => {
            if (req.query.counter)
              var count = await this._model.countDocuments(whereIsMyData);

            return res.status(CREATED).json({
              data: savedObject,
              code: OK,
              count,
              message: savedObject.length > 0 ? RECORDS_FOUND : NO_RECORD_FOUND
            });
          },
          async err => {
            throw err;
          }
        );
    } catch (error) {
      return next(error);
    }
  }

  async userUpdate(req, res, next) {
    var _id = req.params.id;

    var condition = { $set: req.body };
    try {
      await user.findByIdAndUpdate(_id, condition, { new: true }).then(
        async updated => {
          updated = updated.transform();
          return res
            .status(CREATED)
            .json({ data: updated, code: OK, message: RECORD_UPDATED });
        },
        async err => {
          throw await this.utils.checkDuplication(err);
        }
      );
    } catch (error) {
      return next(error);
    }
  }

  async userBlock(req, res, next) {
    try {
      user
        .findByIdAndUpdate(
          req.params.id,
          { $set: { status: "blocked" } },
          { new: true }
        )
        .then(savedObject => {
          return res
            .status(CREATED)
            .json({ data: savedObject, code: OK, message: USER_BLOCK });
        });
    } catch (error) {
      return next(error);
    }
  }

  async HigherAuthorityList(req, res, next) {
    try {
      salepersonmaster.findOne({ code: req.body.code }).then(async data => {
        if (!data) {
          return res.status(OK).json({
            data: [],
            code: OK,
            message: NO_RECORD_FOUND
          });
        }
        if (data.parentId) {
          user.find({ subType: data.parentId, bussinessEntityId: req.body.bussinessEntityId }).then(userData => {
            return res.status(OK).json({
              data: userData,
              code: OK,
              message: RECORDS_FOUND
            });
          });
        } else {
          return res.status(OK).json({
            data: [],
            code: OK,
            message: RECORDS_FOUND
          });
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async salePersonIncentives(req, res, next) {
    try {
      const incentives = await this.byIdUtils.salePersonIncentive(req.params.id)
      return res
        .status(OK)
        .json({ data: incentives, code: OK, message: RECORDS_FOUND });
    } catch (error) {
      return next(error);
    }
  }

  async dealerList(req, res, next) {
    try {
      let id = req.params.id;

      let salesperson = await user.findById(id);

      let dealerArr = await channelpartner.find({
        "regAddress.cityId": salesperson.city
      });

      return res
        .status(OK)
        .json({ data: dealerArr, code: OK, message: RECORDS_FOUND });
    } catch (error) {
      return next(error);
    }
  }

  async salesPersonDealer(req, res, next) {
    try {
      let id = req.user._id;

      let salesperson = await user
        .findById(id)
        .populate({
          path: "assignedParties ",
          select: "-target -assignedDiscount -otp -__v -password",
          populate: {
            path:
              "regAddress.cityId regAddress.stateId regAddress.countryId deliveryAddress.cityId deliveryAddress.stateId deliveryAddress.countryId"
          }
        })
        .select("assignedParties");

      return res
        .status(OK)
        .json({ data: salesperson, code: OK, message: RECORDS_FOUND });
    } catch (error) {
      return next(error);
    }
  }

}
module.exports = UserController;
