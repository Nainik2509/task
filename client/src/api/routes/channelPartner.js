const app = require("express").Router();
const Validate = require("express-validation");
const channelPartnerController = require("../controller/channelPartner");
const model = require("../models/channelPartner");
const {
  Login,
  Register,
  OTP,
  ForgetPassword,
  SetPassword,
  ChangePassword,
  get,
  update
} = require("../validations/channelPartner");
const { Authorize } = require("../../middleware/auth");
const { LOGGED_IN, ADMIN } = require("../../utils/constants");

const controller = new channelPartnerController(model);

app.route("/register").post(Validate(Register), controller.addChannelPartner);

app.route("/login").post(Validate(Login), controller.loginChannelPartner);

app.route("/otp-verify").post(Validate(OTP), controller.otpverify);

app
  .route("/forgot-password")
  .post(Validate(ForgetPassword), controller.forgotpassword);

app
  .route("/resend-otp")
  .post(Validate(ForgetPassword), controller.forgotpassword);

app.route("/set-password").post(Validate(SetPassword), controller.setPassword);

app
  .route("/change-password")
  .post(
    Authorize(LOGGED_IN),
    Validate(ChangePassword),
    controller.changePassword
  );

app.route("/list").get(Authorize(LOGGED_IN), controller.list);

app.route("/logout").post(Authorize(LOGGED_IN), controller.logout);

app
  .route("/:id")
  .get(Authorize(LOGGED_IN), Validate(get), controller.get)
  .post(Authorize(ADMIN), Validate(update), controller.update)
  .delete(Authorize(ADMIN), Validate(get), controller.delete);

module.exports = app;
