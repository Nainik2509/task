const app = require("express").Router();
const Validate = require("express-validation");
const UserController = require("../controller/user");
const model = require("../models/user");
const { Authorize } = require("../../middleware/auth");
const {
  list,
  get,
  update,
  block,
  higherAuthority
} = require("../validations/user");
const { ADMIN, LOGGED_IN, USER } = require("../../utils/constants");

const controller = new UserController(model);

app
  .route("/list")
  .get(Authorize(LOGGED_IN), Validate(list), controller.userList);

app
  .route("/map/list")
  .post(Authorize(LOGGED_IN), Validate(list), controller.mapList);

app.route("/salePersonIncentives/:id").get(controller.salePersonIncentives);

app
  .route("/blockUser/:id")
  .delete(Authorize(ADMIN), Validate(block), controller.userBlock);

app
  .route("/higherAuthority")
  .post(
    Authorize(LOGGED_IN),
    Validate(higherAuthority),
    controller.HigherAuthorityList
  );

app.route("/dealer/:id").get(Authorize(LOGGED_IN), controller.dealerList);

app
  .route("/salesPersonDealer/list")
  .get(Authorize(LOGGED_IN), controller.salesPersonDealer);

app
  .route("/:id")
  .get(Authorize(LOGGED_IN), Validate(get), controller.userById)
  .post(Authorize(LOGGED_IN), Validate(update), controller.update);
// .delete(Authorize(ADMIN), Validate(get), controller.delete);

module.exports = app;
