const Joi = require("joi");
const { STATUSES } = require("../../utils/constants");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = {
  // POST /v1/master/add
  add: {
    body: {
      name: Joi.string()
        .min(3)
        .max(128)
        .required(),
      code: Joi.string()
        .max(128)
        .required(),
      description: Joi.string()
        .max(250)
        .min(10),
      status: Joi.string().valid(STATUSES)
    }
  },

  // GET /v1/master/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50),
      status: Joi.string().valid(STATUSES)
    }
  },

  // GET /v1/master/:id
  get: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/master/:id
  update: {
    body: {
      name: Joi.string().max(128),
      code: Joi.string().max(128),
      description: Joi.string()
        .max(250)
        .min(10),
      status: Joi.string().valid(STATUSES)
    },
    params: {
      id: Joi.objectId().required()
    }
  }
};
