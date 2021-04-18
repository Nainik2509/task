const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = {
  // POST /v1/aboutUs/add
  add: {
    body: {
      key: Joi.string()
        .max(128)
        .min(2)
        .required(),
      value: Joi.string()
        .min(2)
        .required()
    }
  },

  // GET /v1/aboutUs/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50)
    }
  },

  // GET /v1/aboutUs/:id
  get: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/aboutUs/:id
  update: {
    params: {
      id: Joi.objectId().required()
    },
    body: {
      key: Joi.string()
        .max(128)
        .min(2),
      value: Joi.string().min(2)
    }
  }
};
