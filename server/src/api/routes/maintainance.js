const app = require("express").Router();
const Validate = require("express-validation");
const AppController = require("../controller/base");
const model = require("../models/maintainance");
const { Authorize } = require("../../middleware/auth");
const { list, add, get, update } = require("../validations/maintainance");
const { ADMIN, LOGGED_IN } = require("../../utils/constants");

const controller = new AppController(model);

app.route("/add").post(controller.add);

app.route("/list").get(Authorize(LOGGED_IN), Validate(list), controller.list);

app
  .route("/:id")
  .get(Authorize(LOGGED_IN), Validate(get), controller.get)
  .post(Authorize(LOGGED_IN), Validate(update), controller.update);
// .delete(Authorize(LOGGED_IN), Validate(get), controller.delete);

module.exports = app;
