const {
  CREATED,
  RECORD_CREATED,
  RECORD_UPDATED,
  RECORD_DELETED,
  OK,
  NOT_FOUND,
  ROOM_NOT_FOUND,
  RECORDS_FOUND,
  NO_RECORD_FOUND,
  BAD_REQUEST
} = require("../../utils/constants");
const APIError = require("../../utils/APIError");
const AppController = require("./base");
const master = require("../models/master");
const submaster = require("../models/submaster");

class SubMasterController extends AppController {
  constructor(model) {
    super(model);
    this._model = model;
    this.ProductbrandList = this.ProductbrandList.bind(this);
    this.ProductTypeList = this.ProductTypeList.bind(this);
  }

  async ProductbrandList(req, res, next) {
    try {
      master.find({ code: "PRODUCT_BRAND" }).then(async data => {
        submaster
          .find({ masterId: data[0]._id })
          .select("name code")
          .then(brandData => {
            return res
              .status(OK)
              .json({ data: brandData, code: OK, message: RECORDS_FOUND });
          });
      });
    } catch (error) {
      return next(error);
    }
  }

  async ProductTypeList(req, res, next) {
    try {
      master.find({ code: "PRODUCT_TYPE" }).then(async data => {
        submaster
          .find({ masterId: data[0]._id })
          .select("name code")
          .then(typeData => {
            return res.status(OK).json({
              data: typeData,
              code: OK,
              message: RECORDS_FOUND
            });
          });
      });
    } catch (error) {
      return next(error);
    }
  }

  async monthSpanList(req, res, next) {
    try {
      master.find({ code: "INCENTIVE_MONTH" }).then(async data => {
        submaster
          .find({ masterId: data[0]._id })
          // .select("name")
          .then(typeData => {
            return res.status(OK).json({
              data: typeData,
              code: OK,
              message: RECORDS_FOUND
            });
          });
      });
    } catch (error) {
      return next(error);
    }
  }
}
module.exports = SubMasterController;
