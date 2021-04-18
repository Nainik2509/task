const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { STATUSES } = require("../../utils/constants");

module.exports = {
  // POST /v1/city/add
  add: {
    body: {
      city: Joi.string().required(),
      state: Joi.string().required(),
      stateId: Joi.objectId(),
      status: Joi.string().valid(STATUSES)
    }
  },

  // GET /v1/city/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50)
    }
  },

  // GET /v1/city/:id
  get: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/city/:id
  update: {
    params: {
      id: Joi.objectId().required()
    },
    body: {
      city: Joi.string().required(),
      state: Joi.string().required(),
      stateId: Joi.objectId(),
      status: Joi.string().valid(STATUSES)
    }
  }
};
