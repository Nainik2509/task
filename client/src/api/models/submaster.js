const { Schema, model } = require("mongoose");
const Utilities = require("../../utils/util");
const { STATUSES, DEFAULT_IMAGE } = require("../../utils/constants");

const SubMasterModel = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    masterId: {
      type: Schema.Types.ObjectId,
      ref: "master"
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

SubMasterModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["name", "code", "description"];
  }
};

SubMasterModel.pre("save", async function save(next) {
  const name = utils.capital_letter(this.name);
  this.name = name;
  return next();
});

SubMasterModel.method({
  transform() {
    var res = utils.omitter(SubMasterModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("submaster", SubMasterModel);
