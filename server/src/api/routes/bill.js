const app = require("express").Router();
const Validate = require("express-validation");
const BillController = require("../controller/bill");
const model = require("../models/bill");
const { Authorize } = require("../../middleware/auth");
const { list, add, get, update } = require("../validations/product");
const { ADMIN, LOGGED_IN } = require("../../utils/constants");

const controller = new BillController(model);

app.route("/add").post(Authorize(ADMIN), controller.addBill);

app.route("/list").get(Authorize(LOGGED_IN), controller.list);

app
  .route("/:id")
  .get(Authorize(LOGGED_IN), controller.get)
  .post(Authorize(ADMIN), controller.update)
  .delete(Authorize(ADMIN), controller.delete);

module.exports = app;
