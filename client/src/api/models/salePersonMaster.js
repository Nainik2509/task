const { Schema, model } = require("mongoose");
const { STATUSES } = require("../../utils/constants");
const Utilities = require("../../utils/util");

const SalePersonMasterModel = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "salepersonmaster"
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true
    },
    status: {
      type: String,
      enum: STATUSES,
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

SalePersonMasterModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["name", "code", "status"];
  }
};

SalePersonMasterModel.pre("save", async function save(next) {
  const name = await utils.capital_letter(this.name);
  this.name = name;
  return next();
});

SalePersonMasterModel.method({
  transform() {
    var res = utils.omitter(
      SalePersonMasterModel.statics.elevated(),
      this._doc
    );
    return res;
  }
});
module.exports = model("salepersonmaster", SalePersonMasterModel);
