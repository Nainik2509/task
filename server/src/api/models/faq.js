const { Schema, model } = require("mongoose");
const Utilities = require("../../utils/util");

const FAQModel = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const utils = new Utilities();

FAQModel.statics = {
  elevated() {
    return ["__v"];
  },
  searchables() {
    return ["question", "answer"];
  }
};

FAQModel.pre("save", async function save(next) {
  return next();
});

FAQModel.method({
  transform() {
    var res = utils.omitter(FAQModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("faq", FAQModel);
