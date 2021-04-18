const { Schema, model } = require("mongoose");
const Utilities = require("../../utils/util");
const { STATUSES, DEFAULT_IMAGE } = require("../../utils/constants");

const MasterModel = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
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

MasterModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["name", "description", "status"];
  }
};

MasterModel.pre("save", async function save(next) {
  const name = await utils.capital_letter(this.name);
  this.name = name;

  return next();
});

MasterModel.method({
  transform() {
    var res = utils.omitter(MasterModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("master", MasterModel);
