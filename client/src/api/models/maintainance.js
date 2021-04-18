const { Schema, model } = require("mongoose");
const Utilities = require("../../utils/util");

const MaintainanceModel = new Schema(
  {
    mqtt: {
      type: Boolean,
      required: true
    },
    app: {
      type: Boolean,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const utils = new Utilities();

MaintainanceModel.statics = {
  elevated() {
    return ["__v"];
  }
};

MaintainanceModel.pre("save", async function save(next) {
  return next();
});

MaintainanceModel.method({
  transform() {
    var res = utils.omitter(MaintainanceModel.statics.elevated(), this._doc);
    return res;
  }
});
module.exports = model("maintainance", MaintainanceModel);
