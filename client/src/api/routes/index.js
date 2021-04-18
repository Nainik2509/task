const express = require("express");
const fs = require("fs");
const app = express.Router();

app.use("/auth", require("./auth"));
app.use("/weather", require("./weather"));

module.exports = fs
  .readdirSync(__dirname + "/../models")
  .forEach(function(file) {
    if (file.substr(-3) == ".js") {
      const modelName = file.replace(".js", "");
      app.use("/" + modelName, require("./" + modelName));
    }
  });

module.exports = app;
