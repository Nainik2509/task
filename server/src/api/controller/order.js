const {
  CREATED,
  RECORD_CREATED,
  OK,
  RECORDS_FOUND,
  NO_RECORD_FOUND
} = require("../../utils/constants");
const AppController = require("./base");
const FindByIdModelUtilities = require("../../utils/FindByIdModelUtils");
const CreateModelUtilities = require("../../utils/createModelUtils");

const product = require("../models/product");
const order = require("../models/order");
const userModel = require("../models/user");
const cityModel = require("../models/city");
const stateModel = require("../models/state");
const countryModel = require("../models/country");
const channelPartnerModel = require("../models/channelPartner");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

class OrderController extends AppController {
  constructor(model) {
    super(model);
    this._model = model;
    this.byIdUtils = new FindByIdModelUtilities();
    this.createUtils = new CreateModelUtilities();
    this.addOrder = this.addOrder.bind(this);
    this.orderList = this.orderList.bind(this);
  }

  async addOrder(req, res, next) {
    try {
      const newOrderObject = await this.createUtils.orderCalculation(req.body.dealerId, req.body.salePersonId, req.body);
      var objModel = new this._model(newOrderObject);
      await objModel.save().then(
        savedObject => {
          this._model
            .findOne({ _id: savedObject._id })
            .populate([
              {
                path: "salePersonId deliveryAddress.cityId deliveryAddress.stateId deliveryAddress.countryId"
              },
              {
                path: "dealerId",
                model: "channelpartner",
                populate: [{
                  path: "deliveryAddress.cityId regAddress.cityId",
                  model: "city"
                },
                {
                  path: "deliveryAddress.stateId regAddress.stateId",
                  model: "state"
                },
                {
                  path: "deliveryAddress.countryId regAddress.countryId",
                  model: "country"
                }]
              }
            ])
            .then(async savedObject => {
              // savedObject = savedObject.transform();
              return res.status(CREATED).json({
                data: savedObject,
                code: OK,
                message: RECORD_CREATED
              });
            },
              async err => {
                throw err;
              }
            );
        },
        async err => {
          throw await this.utils.checkDuplication(err);
        }
      );
    } catch (error) {
      return next(error);
    }
  }

  async monthOrder(req, res, next) {
    try {
      const userId = req.user._id;

      if (req.user.role) {
        var matchCondition = { $match: { salePersonId: userId } };
      } else {
        var matchCondition = { $match: { dealerId: userId } };
      }
      order.aggregate([
        matchCondition,
        {
          $group: {
            _id: {
              // dealerId: "$dealerId",
              // salePersonId: "$salePersonId",
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" }
            },
            total: { $sum: "$finalPrice" },
            count: { $sum: 1 }
          }
        }],
        (err, data) => {
          return res.status(OK).json({
            data: data,
            code: OK,
            message: data.length > 0 ? RECORDS_FOUND : NO_RECORD_FOUND
          });
        }
      );
    } catch (error) {
      return next(error);
    }
  }
  async monthOrderList(req, res, next) {
    try {
      const userId = req.user._id;
      // const userId =Joi.objectId("5fd9d32b5940db01d974c054");
      let currentYear = req.body.year;
      // let currentYear = new Date().getFullYear();
      let getMonth = req.body.month;
      if (req.user.role) {
        var matchCondition = {
          $match: { salePersonId: userId, year: currentYear, month: getMonth }
        };
      } else {
        var matchCondition = {
          $match: { dealerId: userId, year: currentYear, month: getMonth }
        };
      }
      order.aggregate(
        [
          {
            $addFields: {
              year: { $year: "$orderDate" },
              month: { $month: "$orderDate" }
            }
          },
          matchCondition,
          { $unset: ["year", "month"] },
          {
            $group: {
              _id: {
                month: { $month: "$orderDate" }
              },
              data: {
                $push: "$$ROOT"
              }
            }
          }
        ],
        (err, data) => {
          userModel.populate(
            data,
            { path: "data.salePersonId", select: "-__v -password" },
            async (err, data1) => {
              channelPartnerModel.populate(
                data1,
                { path: "data.dealerId", select: "-__v -password" },
                async (err, data2) => {
                  stateModel.populate(
                    data2,
                    {
                      path:
                        "data.deliveryAddress.stateId data.dealerId.deliveryAddress.stateId data.dealerId.regAddress.stateId data.salePersonId.regAddress.stateId",
                      select: "-__v"
                    },
                    async (err, data3) => {
                      countryModel.populate(
                        data3,
                        {
                          path:
                            "data.deliveryAddress.countryId data.dealerId.deliveryAddress.countryId data.dealerId.regAddress.countryId data.salePersonId.regAddress.countryId",
                          select: "-__v"
                        },
                        async (err, d) => {
                          cityModel.populate(
                            d,
                            {
                              path:
                                "data.deliveryAddress.cityId data.dealerId.deliveryAddress.cityId data.dealerId.regAddress.cityId data.salePersonId.regAddress.cityId",
                              select: "-__v"
                            },
                            async (err, final) => {
                              if (final.length === 0) {
                                return res.status(OK).json({
                                  data: final,
                                  code: OK,
                                  message:
                                    data.length > 0
                                      ? RECORDS_FOUND
                                      : NO_RECORD_FOUND
                                });
                              }
                              return res.status(OK).json({
                                data: final[0].data,
                                code: OK,
                                message:
                                  data.length > 0
                                    ? RECORDS_FOUND
                                    : NO_RECORD_FOUND
                              });
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    } catch (error) {
      return next(error);
    }
  }
  async orderList(req, res, next) {
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
        .sort(assort)
        .skip(page * limit)
        .limit(limit)
        .populate({
          path: "dealerId",
          model: "channelpartner",
          populate: { path: "deliveryAddress.cityId", model: "city" }
        })
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

  async changeBrandProduct(req, res, next) {
    try {
      var brandId = req.body.brandId;

      var productArr = req.body.product;

      let newProduct = [];

      for (let i = 0; i < productArr.length; i++) {
        let b = await product.findOne({ _id: productArr[i].productId });

        var c = await product
          .findOne({
            productBrand: brandId,
            productType: b.productType
          })
          .populate("productBrand productType");
        if (c === null) {
          c = await product
            .findOne({
              _id: productArr[i].productId
            })
            .populate("productBrand productType");
        }
        const newObj = {
          ...c._doc
        };
        newObj.addedQuantity = productArr[i].addedQuantity;
        newProduct.push(newObj);
      }

      return res
        .status(OK)
        .json({ data: newProduct, code: OK, message: RECORDS_FOUND });
    } catch (error) {
      return next(error);
    }
  }
}
module.exports = OrderController;
