const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { STATUSES } = require("../../utils/constants");

module.exports = {
  // POST /v1/appVersioning/add
  add: {
    body: {
      description: Joi.string().required(),
      forceUpdate: Joi.boolean().required(),
      currentVersion: Joi.number().required()
    }
  },

  // GET /v1/appVersioning/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50)
    }
  },

  // GET /v1/appVersioning/:id
  get: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/appVersioning/:id
  update: {
    params: {
      id: Joi.objectId().required()
    },
    body: {
      description: Joi.string(),
      forceUpdate: Joi.boolean(),
      currentVersion: Joi.number()
    }
  }
};
