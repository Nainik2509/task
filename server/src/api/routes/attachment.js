const app = require("express").Router();
const AppController = require("../controller/base");
const model = require("../models/user");
const { Authorize } = require("../../middleware/auth");
const { LOGGED_IN } = require("../../utils/constants");
const upload = require("../../../src/utils/upload");
const cloudinaryUpload = require("../../../src/utils/cloudinaryMulter");

const controller = new AppController(model);

app
  .route("/upload")
  .post(
    Authorize(LOGGED_IN),
    cloudinaryUpload.single("file"),
    controller.upload
  );

module.exports = app;
