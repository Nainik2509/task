const Utilities = require("./util");
const FindByIdModelUtilities = require("./FindByIdModelUtils");
const product = require("../api/models/product");

class CreateModelUtilities {
  constructor() {
    this.utils = new Utilities();
    this.byIdUtils = new FindByIdModelUtilities();
    this._channelPartnerModel = require("../api/models/channelPartner");
    this._bussinessEntityModel = require("../api/models/bussinessEntity");
    this._subMasterModel = require("../api/models/submaster");
    this._productModel = require("../api/models/product");
    this._masterModel = require("../api/models/master");
    this._remarkModel = require("../api/models/remark");
    this._stockModel = require("../api/models/stock");
    this._userModel = require("../api/models/user");
  }

  async findDisscount(item, discountData) {
    let dis = await discountData.filter(ele => ele.productId.toString() === item.toString());
    return parseFloat(dis[0].discount).toFixed(2);
  }

  async orderCalculation(dealerId, salePersonId, obj) {
    try {
      const dealerData = await this.byIdUtils.channelPartnerById(dealerId);
      // const salePersonData = await this.byIdUtils.userById(salePersonId);
      let totalAmount = 0;
      let payableAmount = 0;
      let GSTCharge = 0;
      let shippingLimit = dealerData.shippingLimit;
      let shippingCharge = 0;
      let finalPrice = 0;
      const productArray = [];

      for (let index = 0; index < obj.product.length; index++) {
        const elementProduct = obj.product[index];
        //Product wise Calculation
        await product.findById(elementProduct.productId).then(async element => {
          const elementPrice = parseFloat(element.price);
          const discount = await this.findDisscount(element._id, dealerData.assignedDiscount);

          const productObject = {
            productId: element._id,
            price: element.price,
            quantity: elementProduct.quantity,
            pending: elementProduct.quantity,
            amount: parseFloat(elementProduct.quantity * element.price).toFixed(2),
            discount: discount,
            payableAmount: (elementPrice - (elementPrice * discount) / 100).toFixed(2) * elementProduct.quantity
          };

          totalAmount += parseFloat(elementProduct.quantity * element.price);
          payableAmount += parseFloat((elementPrice - (elementPrice * discount) / 100).toFixed(2) * elementProduct.quantity);
          productArray.push(productObject);
        });
      }

      //Calulate GST Charge
      GSTCharge = payableAmount.toFixed(2) * 0.18;

      //Calulate Shipping Charge
      {
        (payableAmount > dealerData.shippingLimit) ? (shippingCharge = 0) : (shippingCharge = parseFloat(dealerData.shippingCharge).toFixed(2));
      }
      //Calulate Final Price  Charge
      finalPrice = parseFloat(payableAmount) + parseFloat(GSTCharge) + parseFloat(shippingCharge);

      const objToCreate = {
        bussinessEntityId: obj.bussinessEntityId,
        dealerId,
        salePersonId,
        product: productArray,
        finalPrice: parseFloat(finalPrice).toFixed(2),
        totalAmount: parseFloat(totalAmount).toFixed(2),
        payableAmount: parseFloat(payableAmount).toFixed(2),
        shippingLimit: parseFloat(shippingLimit).toFixed(2),
        shippingCharge: parseFloat(shippingCharge).toFixed(2),
        GSTCharge: parseFloat(GSTCharge).toFixed(2),
        deliveryAddress: obj.deliveryAddress,
        paymentStatus: obj.paymentStatus
      };

      return objToCreate;
    } catch (error) {
      throw error;
    }
  }

  async productCreate(obj, userId) {
    try {
      var productCreated = new this._productModel(obj);
      return await productCreated.save().then(async (savedObject) => {
        savedObject = await savedObject.transform();

        //upsert Discount to Channel Partners & bussiness entity
        this.initialDiscountAssign(obj, savedObject).then(() => {
          // Stock Entry
          var stockObj = {};
          stockObj.productId = savedObject._id;
          stockObj.quantity = obj.quantity;

          this.stockCreate(stockObj).then(async (stockCreated) => {
            const userData = await this._userModel.findById(userId).select('first_name last_name');
            const userName = userData.first_name + " " + userData.last_name;
            //Log Entry
            this.productDetail(savedObject._id).then(obj => {
              var logObj = {};
              logObj.productId = savedObject._id;
              logObj.userId = userId;
              logObj.prevQuantity = 0;
              logObj.addedQuantity = stockCreated.quantity;
              logObj.key = "create";
              logObj.remark = `${userName} has created product:- ${obj} with intial quantity ${stockCreated.quantity}`;
              this.logCreate(logObj)
            });
          });
        });
        return savedObject;
      },
        async err => {
          throw await this.utils.checkDuplication(err);
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async stockCreate(obj) {
    try {
      var stockCreated = new this._stockModel(obj);

      return await stockCreated.save().then(async (savedObject) => {
        savedObject = await savedObject.transform();
        return savedObject;
      },
        async err => {
          throw await this.utils.checkDuplication(err);
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async logCreate(obj) {
    try {
      var logCreated = new this._remarkModel(obj);

      return await logCreated.save().then(async savedObject => {
        savedObject = await savedObject.transform();
        return savedObject;
      },
        async err => {
          throw await this.utils.checkDuplication(err);
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async productDetail(ID) {
    try {
      return await this._productModel.findById(ID).select('productBrand productType').then(async (productFound) => {
        return await this._subMasterModel
          .findOne({ _id: productFound.productBrand }).select('code')
          .then(async productBrand => {
            return await this._subMasterModel
              .findOne({ _id: productFound.productType }).select('code')
              .then(productType => {
                const obj = `${productBrand.code}_${productType.code}`;
                return obj;
              });
          });
      });
    } catch (error) {
      throw error;
    }
  }

  async initialDiscountAssign(obj, savedObject) {
    try {
      for (let index = 0; index < obj.distributorProduct.length; index++) {
        const element = obj.distributorProduct[index];
        const discountObj = {
          productId: savedObject._id,
          discount: element.discount
        };
        await this._channelPartnerModel.findByIdAndUpdate(element.userId, { $addToSet: { assignedDiscount: discountObj } }, { new: true });
      }
      for (let index = 0; index < obj.dealerProduct.length; index++) {
        const element = obj.dealerProduct[index];
        const discountObj = {
          productId: savedObject._id,
          discount: element.discount
        };
        await this._channelPartnerModel.findByIdAndUpdate(element.userId, { $addToSet: { assignedDiscount: discountObj } }, { new: true });
      }
      for (let index = 0; index < obj.bussinessEntityProduct.length; index++) {
        const element = obj.bussinessEntityProduct[index];
        const discountObj = {
          productId: savedObject._id,
          discount: element.discount
        };
        await this._bussinessEntityModel.findByIdAndUpdate(element.userId, { $addToSet: { assignedDiscount: discountObj } }, { new: true });
      }
    } catch (error) {
      throw error;
    }
  }
}
module.exports = CreateModelUtilities;
