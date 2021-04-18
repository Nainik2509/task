const { Schema, model } = require("mongoose");
const { DEFAULT_IMAGE } = require("../../utils/constants");
const Utilities = require("../../utils/util");

const AttachmentModel = new Schema(
  {
    absolutePath: {
      type: String,
      trim: true
    },
    mimetype: {
      type: String,
      trim: true
    },
    path: {
      type: String,
      trim: true,
      default: DEFAULT_IMAGE
    },
    securePath: {
      type: String,
      trim: true,
      default: DEFAULT_IMAGE
    }
  },
  {
    timestamps: true
  }
);

const utils = new Utilities();

AttachmentModel.statics = {
  elevated() {
    return ["__v"];
  }
};

AttachmentModel.pre("save", async function save(next) {
  return next();
});

AttachmentModel.method({
  transform() {
    var res = utils.omitter(AttachmentModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("attachment", AttachmentModel);
