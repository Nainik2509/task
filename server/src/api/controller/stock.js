const { CREATED, RECORD_UPDATED, OK } = require("../../utils/constants");
const APIError = require("../../utils/APIError");
const AppController = require("./base");
const FindByIdModelUtilities = require("../../utils/FindByIdModelUtils");
const CreateModelUtilities = require("../../utils/createModelUtils");
const userModal = require("../models/user");

class StockController extends AppController {
  constructor(model) {
    super(model);
    this._model = model;
    this.byIdUtils = new FindByIdModelUtilities();
    this.createUtils = new CreateModelUtilities();
    this.updateStock = this.updateStock.bind(this);
  }

  async updateStock(req, res, next) {
    var _id = req.params.id;
    let include = this.getFieldAsArray(req.body.populate);

    try {
      await this._model
        .findOneAndUpdate({ _id }, req.body, { new: true })
        .populate(include)
        .then(
          async updated => {
            updated = updated.transform();
            const userData = await userModal.findById(req.user._id);
            const userName = userData.first_name + " " + userData.last_name;
            //Log Entry
            var logObj = {};
            logObj.productId = updated.productId;
            logObj.userId = req.user._id;
            logObj.prevQuantity = req.body.prevQuantity;
            logObj.addedQuantity = req.body.addedQuantity;
            logObj.purpose = req.body.purpose;
            logObj.remark =
              req.body.key === "Add"
                ? `${userName} has added ${req.body.addedQuantity} quantity in product: ${req.body.data.productBrand.code}_${req.body.data.productType.code}. Updated Quantity is ${updated.quantity}`
                : `${userName} has removed ${req.body.addedQuantity} quantity in product: ${req.body.data.productBrand.code}_${req.body.data.productType.code}. Updated Quantity is ${updated.quantity}`;
            logObj.key = req.body.key === "Add" ? "add" : "remove";

            this.createUtils.logCreate(logObj);

            return res
              .status(CREATED)
              .json({ data: updated, code: OK, message: RECORD_UPDATED });
          },
          async err => {
            throw await this.utils.checkDuplication(err);
          }
        );
    } catch (error) {
      return next(error);
    }
  }
}
module.exports = StockController;
