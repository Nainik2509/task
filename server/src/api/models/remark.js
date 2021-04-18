const { Schema, model } = require("mongoose");
const Utilities = require("../../utils/util");
const { STATUSES, REMARK_TYPE } = require("../../utils/constants");

const logMasterModel = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product"
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user"
    },
    prevQuantity: {
      type: Number,
      required: true,
      default: 0
    },
    addedQuantity: {
      type: Number,
      required: true,
      default: 0
    },
    remark: {
      type: String,
      required: true,
      trim: true
    },
    purpose: {
      type: String,
      trim: true
    },
    key: {
      type: String,
      enum: REMARK_TYPE,
      lowercase: true
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

logMasterModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["status"];
  }
};

logMasterModel.pre("save", async function save(next) {
  const remark = await utils.capital_letter(this.remark);
  this.remark = remark;

  return next();
});

logMasterModel.method({
  transform() {
    var res = utils.omitter(logMasterModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("remarks", logMasterModel);
