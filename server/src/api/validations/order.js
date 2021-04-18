const Joi = require("joi");
const { STATUSES } = require("../../utils/constants");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = {
  // POST /v1/order/add
  add: {
    body: {
      dealerId: Joi.objectId().required(),
      salePersonId: Joi.objectId().required(),
      product: Joi.required(),
      totalAmount: Joi.number().positive(),
      payableAmount: Joi.number().positive(),
      shippingCharge: Joi.number().min(0),
      GSTCharge: Joi.number().positive()
    }
  },

  // GET /v1/order/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50),
      status: Joi.string().valid(STATUSES)
    }
  },

  // GET /v1/order/:id
  get: {
    params: {
      id: Joi.string().required()
    }
  },

  // POST /v1/order/:id
  update: {
    body: {
      // dealerId: Joi.objectId(),
      // salePersonId: Joi.objectId(),
      totalAmount: Joi.number().positive(),
      payableAmount: Joi.number().positive(),
      shippingCharge: Joi.number().positive(),
      GSTCharge: Joi.number().positive()
    },
    params: {
      id: Joi.objectId().required()
    }
  }
};
