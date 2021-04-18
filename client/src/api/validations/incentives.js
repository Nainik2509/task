const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const {STATUSES } = require("../../utils/constants");

module.exports = {
  // POST /v1/incentives/add
  add: {
    body: {
      monthSpan: Joi.objectId().required(),
      percentage: Joi.number().required(),
      incentives: Joi.number().required(),
      status: Joi.string().valid(STATUSES),
    }
  },

  // GET /v1/incentives/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50)
    }
  },

  // GET /v1/incentives/:id
  get: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/incentives/:id
  update: {
    params: {
      id: Joi.objectId().required()
    },
    body: {
      monthSpan: Joi.objectId(),
      percentage: Joi.number(),
      incentives: Joi.number(),
      status: Joi.string().valid(STATUSES),
    }
  }
};
