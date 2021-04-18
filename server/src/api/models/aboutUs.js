const { Schema, model } = require("mongoose");
const Utilities = require("../../utils/util");

const AboutUsModel = new Schema(
  {
    key: {
      type: String,
      uppercase: true,
      trim: true,
      minlength: 2,
      required: true
    },
    value: {
      type: String,
      minlength: 2,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const utils = new Utilities();

AboutUsModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["key", "value"];
  }
};

AboutUsModel.pre("save", async function save(next) {
  return next();
});

AboutUsModel.method({
  transform() {
    var res = utils.omitter(AboutUsModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("aboutus", AboutUsModel);
