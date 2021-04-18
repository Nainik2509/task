const { Schema, model } = require("mongoose");
const Utilities = require("../../utils/util");
const { STATUSES } = require("../../utils/constants");

const CountryMasterModel = new Schema(
  {
    country: {
      type: String,
      required: true,
      trim: true
    },
    abbreviation: {
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
    }
  },
  {
    timestamps: true
  }
);

const utils = new Utilities();

CountryMasterModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["country", "code", "status"];
  }
};

CountryMasterModel.pre("save", async function save(next) {
  try {
    const country = utils.capital_letter(this.country);
    this.country = country;
    return next();
  } catch (err) {
    return next(err);
  }
});

CountryMasterModel.method({
  transform() {
    var res = utils.omitter(CountryMasterModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("country", CountryMasterModel);
