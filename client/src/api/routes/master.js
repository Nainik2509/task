const app = require("express").Router();
const Validate = require("express-validation");
const MasterController = require("../controller/master");
const model = require("../models/master");
const { Authorize } = require("../../middleware/auth");
const { list, add, get, update } = require("../validations/master");
const { ADMIN, LOGGED_IN } = require("../../utils/constants");

const controller = new MasterController(model);

app.route("/add").post(Authorize(ADMIN), Validate(add), controller.addMaster);

app.route("/list").get(Authorize(LOGGED_IN), Validate(list), controller.list);

app
  .route("/:id")
  .get(Authorize(LOGGED_IN), Validate(get), controller.get)
  .post(Authorize(ADMIN), Validate(update), controller.update)
  .delete(Authorize(ADMIN), Validate(get), controller.delete);

module.exports = app;
