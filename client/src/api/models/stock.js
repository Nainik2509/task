const { Schema, model } = require("mongoose");
const Utilities = require("../../utils/util");
const { STATUSES } = require("../../utils/constants");

const StockMasterModel = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product"
    },
    quantity: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: STATUSES,
      lowercase: true,
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

const utils = new Utilities();

StockMasterModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["status"];
  }
};

StockMasterModel.pre("save", async function save(next) {
  return next();
});

StockMasterModel.method({
  transform() {
    var res = utils.omitter(StockMasterModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("stock", StockMasterModel);
