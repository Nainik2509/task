const { STATUSES } = require("../../utils/constants");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = {
  // POST /v1/product/add
  add: {
    body: {
      productBrand: Joi.objectId().required(),
      productType: Joi.objectId().required(),
      description: Joi.string().required().max(250).min(10),
      price: Joi.number().positive().required(),
      status: Joi.string().valid(STATUSES)
    }
  },

  // GET /v1/product/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50),
      status: Joi.string().valid(STATUSES)
    }
  },

  // GET /v1/product/:id
  get: {
    params: {
      id: Joi.string().required()
    }
  },

  // POST /v1/product/:id
  update: {
    body: {
      productBrand: Joi.objectId(),
      productType: Joi.objectId(),
      description: Joi.string()
        .max(250)
        .min(10),
      price: Joi.number().positive(),
      taxable: Joi.boolean(),
      status: Joi.string().valid(STATUSES)
    },
    params: {
      id: Joi.objectId().required()
    }
  }
};
