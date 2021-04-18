const app = require("express").Router();
const Validate = require("express-validation");
const BussinessEntityController = require("../controller/bussinessEntity");
const model = require("../models/bussinessEntity");
const { Authorize } = require("../../middleware/auth");
const { Register, Login, ForgetPassword, OTP, SetPassword, ChangePassword, get, list, update } = require("../validations/bussinessEntity");
const { LOGGED_IN } = require("../../utils/constants");

const controller = new BussinessEntityController(model);

app.route("/register").post(Validate(Register), controller.addBussinessEntity);

app.route("/login").post(Validate(Login), controller.loginBussinesEntity);

app.route("/forgot-password").post(Validate(ForgetPassword), controller.forgotpassword);

app.route("/otp-verify").post(Validate(OTP), controller.otpverify);

app.route("/resend-otp").post(Validate(ForgetPassword), controller.forgotpassword);

app.route("/set-password").post(Authorize(LOGGED_IN), Validate(SetPassword), controller.setPassword);

app.route("/change-password").post(Authorize(LOGGED_IN), Validate(ChangePassword), controller.changePassword);

app.route("/list").get(Authorize(LOGGED_IN), Validate(list), controller.list);

app.route("/map/list").post(Authorize(LOGGED_IN), Validate(list), controller.mapList);

app
  .route("/:id")
  .get(Validate(get), controller.get)
  .post(Authorize(LOGGED_IN), Validate(update), controller.update)
  .delete(Authorize(LOGGED_IN), Validate(get), controller.delete);

module.exports = app;
