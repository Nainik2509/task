const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { STATUSES } = require("../../utils/constants");

module.exports = {
  // POST /v1/country/add
  add: {
    body: {
      name: Joi.string().required(),
      status: Joi.string().valid(STATUSES)
    }
  },

  // GET /v1/country/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50)
    }
  },

  // GET /v1/country/:id
  get: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/country/:id
  update: {
    params: {
      id: Joi.objectId().required()
    },
    body: {
      name: Joi.string().required(),
      status: Joi.string().valid(STATUSES)
    }
  }
};
