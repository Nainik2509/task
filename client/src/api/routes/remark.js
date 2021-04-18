const app = require("express").Router();
const Validate = require("express-validation");
const RemarkController = require("../controller/remark");
const model = require("../models/remark");
const { Authorize } = require("../../middleware/auth");
const { list, add, get, update } = require("../validations/faq");
const { ADMIN, LOGGED_IN } = require("../../utils/constants");

const controller = new RemarkController(model);

app
  .route("/list")
  .get(Authorize(LOGGED_IN), Validate(list), controller.remarkList);

module.exports = app;
