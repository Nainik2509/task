const { Schema, model } = require("mongoose");
const Utilities = require("../../utils/util");
const { STATUSES } = require("../../utils/constants");

const CityMasterModel = new Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    stateId: {
      type: Schema.Types.ObjectId,
      ref: "state",
      required: true
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

CityMasterModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["city", "status"];
  }
};

CityMasterModel.pre("save", async function save(next) {
  try {
    const name = utils.capital_letter(this.city);
    this.city = name;
    return next();
  } catch (err) {
    return next(err);
  }
});

CityMasterModel.method({
  transform() {
    var res = utils.omitter(CityMasterModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("city", CityMasterModel);
