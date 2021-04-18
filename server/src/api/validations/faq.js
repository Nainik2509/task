const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { STATUSES } = require("../../utils/constants");

module.exports = {
  // GET /v1/faq/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50),
      status: Joi.string().valid(STATUSES)
    }
  },

  // GET /v1/faq/:id
  get: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/faq/add
  add: {
    body: {
      question: Joi.string()
        .max(128)
        .required(),
      answer: Joi.string()
        .max(500)
        .required()
    }
  },

  // POST /v1/faq/:id
  update: {
    body: {
      question: Joi.string().max(128),
      answer: Joi.string().max(500)
    },
    params: {
      id: Joi.objectId().required()
    }
  }
};
