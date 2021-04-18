const { CREATED, RECORD_CREATED, RECORD_UPDATED, UNPROCESSABLE_ENTITY, PRODUCT_ALREADY_EXIST, OK, RECORDS_FOUND, NO_RECORD_FOUND } = require("../../utils/constants");
const AppController = require("./base");
const FindByIdModelUtilities = require("../../utils/FindByIdModelUtils");
const CreateModelUtilities = require("../../utils/createModelUtils");

class ProductController extends AppController {
  constructor(model) {
    super(model);
    this._model = model;
    this.byIdUtils = new FindByIdModelUtilities();
    this.createUtils = new CreateModelUtilities();
    this.addProduct = this.addProduct.bind(this);
    this.productList = this.productList.bind(this);
    this.updateProduct = this.updateProduct.bind(this);
  }

  async addProduct(req, res, next) {
    try {
      var condition = {
        $and: [
          { productBrand: req.body.productBrand },
          { productType: req.body.productType }
        ]
      };
      await this._model.find(condition).then(async (data) => {
        if (data.length > 0) {
          return res.status(OK).json({
            code: UNPROCESSABLE_ENTITY,
            message: PRODUCT_ALREADY_EXIST
          });
        } else {
          const data = await this.createUtils.productCreate(req.body, req.user._id);
          return res
            .status(CREATED)
            .json({ data, code: OK, message: RECORD_CREATED });
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async productList(req, res, next) {
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
            const data = [];
            for (let index = 0; index < savedObject.length; index++) {
              const quantity = await this.byIdUtils.productQuantity(
                savedObject[index]._id
              );
              data[index] = {
                ...savedObject[index]._doc,
                quantity: quantity
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
  }

  async updateProduct(req, res, next) {
    var _id = req.params.id;
    let include = req.body.populate;
    try {
      var condition = {
        $and: [
          { productBrand: req.body.productBrand },
          { productType: req.body.productType }
        ]
      };
      await this._model.find(condition).then(async data => {
        if (data.length > 0) {
          data.map(async element => {
            if (element._id !== _id) {
              return res.status(OK).json({
                code: UNPROCESSABLE_ENTITY,
                message: PRODUCT_ALREADY_EXIST
              });
            }
          });
        }
        else {
          await this._model
            .findOneAndUpdate({ _id }, req.body, { new: true })
            .populate(include)
            .then(
              updated => {
                updated = updated.transform();
                return res
                  .status(CREATED)
                  .json({ data: updated, code: OK, message: RECORD_UPDATED });
              },
              async err => {
                throw await this.utils.checkDuplication(err);
              }
            );
        }
      });
    } catch (error) {
      console.log(error)
      return next(error);
    }
  }
}
module.exports = ProductController;
