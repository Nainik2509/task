const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { STATUSES } = require("../../utils/constants");

module.exports = {
  // POST /v1/salePersonMaster/add
  add: {
    body: {
      name: Joi.string()
        .max(128)
        .required(),
      status: Joi.string().valid(STATUSES),
      code: Joi.string()
        .max(128)
        .required(),
      parentId: Joi.objectId()
    }
  },

  // GET /v1/salePersonMaster/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50)
    }
  },

  // GET /v1/salePersonMaster/:id
  get: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/salePersonMaster/:id
  update: {
    params: {
      id: Joi.objectId().required()
    },
    body: {
      name: Joi.string()
        .max(128)
        .required(),
      status: Joi.string().valid(STATUSES),
      code: Joi.string()
        .max(128)
        .required(),
      parentId: Joi.objectId()
    }
  }
};
