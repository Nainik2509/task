const { Schema, model } = require("mongoose");
const { STATUSES, DEFAULT_IMAGE } = require("../../utils/constants");
const Utilities = require("../../utils/util");

const ProductModel = new Schema(
  {
    productBrand: {
      type: Schema.Types.ObjectId,
      required: [true, "Please select brand of product!"],
      ref: "submaster",
    },
    productType: {
      type: Schema.Types.ObjectId,
      required: [true, "Please select type of product!"],
      ref: "submaster",
    },
    description: {
      type: String,
      trim: true
    },
    icon: {
      type: String,
      default: DEFAULT_IMAGE
    },
    price: {
      type: Number,
      required: [true, "Please provide price for the product"],
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: "User status is either: active, deactive, or blocked"
      },
      lowercase: true,
      default: "active"
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

ProductModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["code", "description", "status"];
  }
};

ProductModel.pre("save", async function save(next) {
  return next();
});

ProductModel.method({
  transform() {
    var res = utils.omitter(ProductModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("product", ProductModel);
