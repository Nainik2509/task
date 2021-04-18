const app = require("express").Router();
const Validate = require("express-validation");
const AppController = require("../controller/base");
const { Authorize } = require("../../middleware/auth");
const { weather } = require("../validations/weather");
const { ADMIN, LOGGED_IN } = require("../../utils/constants");

const controller = new AppController();

app
  .route("/")
  .post(Authorize(LOGGED_IN), Validate(weather), controller.weatherInfo);

module.exports = app;
