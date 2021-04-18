const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const Utilities = require("../../utils/util");
const { ORDER_STATUS } = require("../../utils/constants");

const autoIncrement = require("mongoose-auto-increment");
const { boolean } = require("joi");

const OrderModel = new Schema(
  {
    srNo: {
      type: Number,
      unique: true
    },
    orderId: {
      type: String,
      unique: true
    },
    bussinessEntityId: {
      type: Schema.Types.ObjectId,
      ref: "bussinessEntity",
      required: [true, 'Please provide bussiness entity'],
    },
    dealerId: {
      type: Schema.Types.ObjectId,
      ref: "channelpartner",
      required: true
    },
    salePersonId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    product: [{
      productId: { type: Schema.Types.ObjectId, ref: "product" },
      price: { type: Number },
      quantity: { type: Number },
      pending: { type: Number },
      amount: { type: Number },
      discount: { type: Number },
      payableAmount: { type: Number }
    }],
    finalPrice: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    payableAmount: {
      type: Number,
      required: true
    },
    shippingLimit: {
      type: Number,
      required: true
    },
    shippingCharge: {
      type: Number,
      required: true
    },
    GSTCharge: {
      type: Number,
      required: true
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    deliveryAddress: {
      line1: {
        type: String,
        trim: true,
        required: true
      },
      line2: {
        type: String,
        trim: true
      },
      pincode: {
        type: Number,
        trim: true,
        required: true
      },
      cityId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "city"
      },
      stateId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "state"
      },
      countryId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "country"
      }
    },
    paymentStatus: [{
      image: String,
      isVerified: {
        type: Boolean,
        default: false
      }
    }],
    status: {
      type: String,
      enum: ORDER_STATUS,
      lowercase: true,
      required: true,
      default: "pending"
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

autoIncrement.initialize(mongoose.connection);
OrderModel.plugin(autoIncrement.plugin, {
  model: "order", // collection or table name in which you want to apply auto increment
  field: "srNo", // field of model which you want to auto increment
  startAt: 1, // start your auto increment value from 1
  incrementBy: 1 // incremented by 1
});

const utils = new Utilities();

OrderModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["dealerId", "salePersonId", "status"];
  }
};

OrderModel.pre("save", async function save(next) {
  this.orderId = `WLORDER_${this.srNo}`;
  return next();
});

OrderModel.method({
  transform() {
    var res = utils.omitter(OrderModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("order", OrderModel);
