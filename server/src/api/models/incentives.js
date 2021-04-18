const { Schema, model } = require("mongoose");
const { STATUSES } = require("../../utils/constants");
const Utilities = require("../../utils/util");

const IncentivesModel = new Schema(
  {
    monthSpan: {
      type: Schema.Types.ObjectId,
      ref: "submaster",
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    incentives: {
      type: Number,
      required: true
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

IncentivesModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["percentage", "incentives","status"];
  }
};

IncentivesModel.pre("save", async function save(next) {
  return next();
});

IncentivesModel.method({
  transform() {
    var res = utils.omitter(IncentivesModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("incentives", IncentivesModel);
