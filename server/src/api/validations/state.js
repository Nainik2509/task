const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { STATUSES } = require("../../utils/constants");

module.exports = {
  // POST /v1/state/add
  add: {
    body: {
      name: Joi.string().required(),
      status: Joi.string().valid(STATUSES)
    }
  },

  // GET /v1/state/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50)
    }
  },

  // GET /v1/state/:id
  get: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/state/:id
  update: {
    params: {
      id: Joi.objectId().required()
    },
    body: {
      stateName: Joi.string().required(),
      status: Joi.string().valid(STATUSES)
    }
  }
};
