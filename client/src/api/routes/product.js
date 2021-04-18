const app = require("express").Router();
const Validate = require("express-validation");
const ProductController = require("../controller/product");
const model = require("../models/product");
const { Authorize } = require("../../middleware/auth");
const { list, add, get, update } = require("../validations/product");
const { ADMIN, LOGGED_IN } = require("../../utils/constants");

const controller = new ProductController(model);

app.route("/add").post(Authorize(ADMIN), Validate(add), controller.addProduct);

app
  .route("/list")
  .get(Authorize(LOGGED_IN), Validate(list), controller.productList);

app
  .route("/:id")
  .get(Authorize(LOGGED_IN), Validate(get), controller.get)
  .post(Authorize(ADMIN), Validate(update), controller.updateProduct)
  .delete(Authorize(ADMIN), Validate(get), controller.delete);

module.exports = app;
