const { Schema, model } = require("mongoose");
const Utilities = require("../../utils/util");
const { BILL_STATUS } = require("../../utils/constants");

const BillModel = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "order",
      required: true
    },
    product: [{
      productId: { type: Schema.Types.ObjectId, ref: "product" },
      dispatched: { type: Number }
    }],
    billAttachment: {
      type: String
    },
    billDate: {
      type: Date,
      default: Date.now
    },
    dispatchId: {
      type: String
    },
    GSTCharge: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: BILL_STATUS,
      lowercase: true,
      required: true,
      default: "paid"
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

const utils = new Utilities();

BillModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["dispatchId", "billDate", "status"];
  }
};

BillModel.pre("save", async function save(next) {
  return next();
});

BillModel.method({
  transform() {
    var res = utils.omitter(BillModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("bill", BillModel);
