const {
  CREATED,
  RECORD_CREATED,
  RECORD_UPDATED,
  UNPROCESSABLE_ENTITY,
  PRODUCT_ALREADY_EXIST,
  RECORD_DELETED,
  OK,
  NOT_FOUND,
  ROOM_NOT_FOUND,
  VALIDATION_ERROR,
  RECORDS_FOUND,
  NO_RECORD_FOUND,
  BAD_REQUEST
} = require("../../utils/constants");
const APIError = require("../../utils/APIError");
const AppController = require("./base");
const FindByIdModelUtilities = require("../../utils/FindByIdModelUtils");
const CreateModelUtilities = require("../../utils/createModelUtils");

class RemarkController extends AppController {
  constructor(model) {
    super(model);
    this._model = model;
    this.byIdUtils = new FindByIdModelUtilities();
    this.createUtils = new CreateModelUtilities();
    this.remarkList = this.remarkList.bind(this);
  }

  async remarkList(req, res, next) {
    try {
      let whereIsMyData = this.removeReservedVars(req.query, this.reservedVars);
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
        .sort({ updatedAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .populate(include)
        .then(
          async savedObject => {
            if (req.query.counter)
              var count = await this._model.countDocuments(whereIsMyData);
            const data = [];
            for (let index = 0; index < savedObject.length; index++) {
              const userData = await this.byIdUtils.userById(
                savedObject[index].userId
              );
              var userFullName = `${userData.first_name} ${userData.last_name}`;
              data[index] = {
                ...savedObject[index]._doc,
                userName: userFullName
              };
            }
            return await res.status(CREATED).json({
              data,
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

    // try {
    //   const savedObject = await this.byIdUtils.userById(req.user._id)
    //   if (!savedObject) {
    //     return res
    //       .status(NOT_FOUND)
    //       .json({ code: NOT_FOUND, message: NO_RECORD_FOUND });
    //   }
    //   return res
    //     .status(OK)
    //     .json({ data: savedObject, code: OK, message: RECORDS_FOUND });
    // } catch (error) {
    //   return next(error);
    // }
  }
}
module.exports = RemarkController;
