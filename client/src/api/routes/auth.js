const Validate = require("express-validation");

const { Login, Register, OTP, ForgetPassword, SetPassword, ChangePassword } = require("../validations/auth");
const { LOGGED_IN, ADMIN } = require("../../utils/constants");
const { Authorize } = require("../../middleware/auth");
const controller = require("../controller/auth");
const app = require("express").Router();

app.route("/register").post(Validate(Register), controller.registerUser);

app.route("/login").post(Validate(Login), controller.loginUser);

app.route("/otp-verify").post(Validate(OTP), controller.otpverify);

app.route("/forgot-password").post(Validate(ForgetPassword), controller.forgotpassword);

app.route("/resend-otp").post(Validate(ForgetPassword), controller.forgotpassword);

app.route("/set-password").post(Validate(SetPassword), controller.setPassword);

app.route("/change-password").post(Authorize(LOGGED_IN), Validate(ChangePassword), controller.changePassword);

app.route("/logout").post(Authorize(LOGGED_IN), controller.logout);

app.route("/getCount").get(controller.getCount);

// app.route("/countModelDocument").get(Authorize(LOGGED_IN), controller.countModelDocument)

module.exports = app;
