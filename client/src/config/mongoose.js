const mongoose = require("mongoose");
const logger = require("./logger");
const {
  env,
  mongo: { uri, options }
} = require("./env-vars");

mongoose.Promise = global.Promise;

mongoose.set("debug", env === "development");

mongoose.connection.on("error", err => {
  logger.error(`Mongo Engine is down : ${err}`);
});

mongoose.connection.on("connected", () => {
  logger.info(`Main Engine is up on ${env}`);
});

exports.Connect = () => {
  mongoose.connect(uri, options);
  return mongoose.connection;
};
