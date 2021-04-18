const { Schema, model } = require("mongoose");
const Utilities = require("../../utils/util");

const AppVersoningModel = new Schema(
  {
    currentVersion: {
      type: Number,
      required: true,
      trim: true
    },
    forceUpdate: {
      type: Boolean,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const utils = new Utilities();

AppVersoningModel.statics = {
  elevated() {
    return ["__v"];
  }
};

AppVersoningModel.pre("save", async function save(next) {
  return next();
});

AppVersoningModel.method({
  transform() {
    var res = utils.omitter(AppVersoningModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("appVersioning", AppVersoningModel);
