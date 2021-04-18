const { Schema, model } = require("mongoose");
const Utilities = require("../../utils/util");
const { STATUSES } = require("../../utils/constants");

const StateMasterModel = new Schema(
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
    countryId: {
      type: Schema.Types.ObjectId,
      ref: "country",
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

StateMasterModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["name", "code", "status"];
  }
};

StateMasterModel.pre("save", async function save(next) {
  try {
    const name = utils.capital_letter(this.name);
    this.name = name;
    return next();
  } catch (err) {
    return next(err);
  }
});

StateMasterModel.method({
  transform() {
    var res = utils.omitter(StateMasterModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("state", StateMasterModel);
