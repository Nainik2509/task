const app = require("express").Router();
const Validate = require("express-validation");
const SubMasterController = require("../controller/subMaster");
const model = require("../models/submaster");
const { Authorize } = require("../../middleware/auth");
const { list, add, get, update } = require("../validations/submaster");
const { ADMIN, LOGGED_IN } = require("../../utils/constants");

const controller = new SubMasterController(model);

app.route("/add").post(Authorize(ADMIN), Validate(add), controller.add);

app.route("/list").get(Authorize(LOGGED_IN), Validate(list), controller.list);

app
  .route("/productBrandList")
  .get(Authorize(LOGGED_IN), controller.ProductbrandList);

app
  .route("/productTypeList")
  .get(Authorize(LOGGED_IN), controller.ProductTypeList);

  app
  .route("/monthSpanList")
  .get(Authorize(LOGGED_IN), controller.monthSpanList);

app
  .route("/:id")
  .get(Authorize(LOGGED_IN), Validate(get), controller.get)
  .post(Authorize(ADMIN), Validate(update), controller.update)
  .delete(Authorize(ADMIN), Validate(get), controller.delete);

module.exports = app;
