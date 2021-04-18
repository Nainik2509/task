const app = require("express").Router();
const Validate = require("express-validation");
const AppController = require("../controller/base");
const model = require("../models/state");
const { Authorize } = require("../../middleware/auth");
const { list, add, get, update } = require("../validations/state");
const { ADMIN, LOGGED_IN } = require("../../utils/constants");

const controller = new AppController(model);

app.route("/add").post(Authorize(ADMIN), Validate(add), controller.add);

app.route("/list").get(Validate(list), controller.list);

app
  .route("/:id")
  .get(Authorize(LOGGED_IN), Validate(get), controller.get)
  .post(Authorize(ADMIN), Validate(update), controller.update)
  .delete(Authorize(ADMIN), Validate(get), controller.delete);

module.exports = app;
