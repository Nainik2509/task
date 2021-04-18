const app = require("express").Router();
const Validate = require("express-validation");
const OrderController = require("../controller/order");
const model = require("../models/order");
const { Authorize } = require("../../middleware/auth");
const { list, add, get, update } = require("../validations/order");
const { ADMIN, LOGGED_IN } = require("../../utils/constants");

const controller = new OrderController(model);

app
  .route("/add")
  .post(Authorize(LOGGED_IN), Validate(add), controller.addOrder);

app.route("/list").get(Authorize(LOGGED_IN), Validate(list), controller.list);

app
  .route("/map/list")
  .post(Authorize(LOGGED_IN), Validate(list), controller.mapList);

app.route("/month/order").post(Authorize(LOGGED_IN), controller.monthOrder);

app.route("/month/list").post(Authorize(LOGGED_IN), controller.monthOrderList);

app.route("/changeBrand/product").post(controller.changeBrandProduct);

app
  .route("/:id")
  .get(Authorize(LOGGED_IN), Validate(get), controller.get)
  .post(Authorize(LOGGED_IN), Validate(update), controller.update)
  .delete(Authorize(LOGGED_IN), Validate(get), controller.delete);

module.exports = app;
