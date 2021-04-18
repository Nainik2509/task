const {
  CREATED,
  RECORD_CREATED,
  OK,
} = require("../../utils/constants");
const AppController = require("./base");

class BillController extends AppController {
  constructor(model) {
    super(model);
    this._model = model;
    this.addBill = this.addBill.bind(this);
  }

  async addBill(req, res, next) {
    try {
      var totalAmount = 0;
      await req.body.product.forEach(element => {
        if (element.dispatched) {
          totalAmount += element.amount * element.dispatched;
        }
      });
      var GSTCharge = (totalAmount * 18) / 100;
      totalAmount += GSTCharge;
      req.body.GSTCharge = GSTCharge;
      req.body.totalAmount = totalAmount;
      var objModel = new this._model(req.body);
      await objModel.save().then(
        savedObject => {
          savedObject = savedObject.transform();
          return res
            .status(CREATED)
            .json({ data: savedObject, code: OK, message: RECORD_CREATED });
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
module.exports = BillController;
