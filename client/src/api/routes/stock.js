const app = require("express").Router();
const Validate = require("express-validation");
const StockController = require("../controller/stock");
const model = require("../models/stock");
const { Authorize } = require("../../middleware/auth");
const { list, add, get, update } = require("../validations/faq");
const { ADMIN, LOGGED_IN } = require("../../utils/constants");

const controller = new StockController(model);

app.route("/add").post(Authorize(ADMIN), Validate(add), controller.add);

app.route("/list").get(Authorize(LOGGED_IN), Validate(list), controller.list);

app
  .route("/:id")
  .get(Authorize(LOGGED_IN), Validate(get), controller.get)
  .post(Authorize(ADMIN), Validate(update), controller.updateStock)
  .delete(Authorize(ADMIN), Validate(get), controller.delete);

module.exports = app;
