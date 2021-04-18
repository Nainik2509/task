const Joi = require("joi");
const { STATUSES } = require("../../utils/constants");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = {
  // POST /v1/submaster/add
  add: {
    body: {
      name: Joi.string()
        .max(128)
        .required(),
      status: Joi.string().valid(STATUSES),
      code: Joi.string()
        .max(128)
        .required(),
      description: Joi.string()
        .max(250)
        .min(10),
      masterId: Joi.objectId().required()
    }
  },

  // GET /v1/submaster/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50),
      status: Joi.string().valid(STATUSES)
    }
  },

  // GET /v1/submaster/:id
  get: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/submaster/:id
  update: {
    body: {
      name: Joi.string().max(128),
      status: Joi.string().valid(STATUSES),
      code: Joi.string().max(128),
      description: Joi.string()
        .max(250)
        .min(10),
      masterId: Joi.objectId()
    },
    params: {
      id: Joi.objectId().required()
    }
  }
};
