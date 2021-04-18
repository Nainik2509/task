const Joi = require("joi");

module.exports = {
  // POST /v1/attachment/upload
  weather: {
    body: {
      city: Joi.string()
        .max(128)
        .required()
    }
  }
};
