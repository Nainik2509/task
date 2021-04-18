const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { STATUSES } = require("../../utils/constants");

module.exports = {
  // POST /v1/bussinessEntity/add
  Register: {
    body: {
      first_name: Joi.string().required().min(2).max(126),
      last_name: Joi.string().required().min(2).max(126),
      companyName: Joi.string().required().min(2).max(126),
      email: Joi.string().email().required(),
      password: Joi.string().required().min(6).max(128),
      status: Joi.string().valid(STATUSES),
      phoneNo: Joi.object().keys({
        ccode: Joi.string().required(),
        mobile: Joi.string().min(6).required(),
      }),
      assignedProduct: Joi.array().items(
        Joi.object({
          productId: Joi.objectId(),
          discount: Joi.number(),
        })
      ),
      address: Joi.object().keys({
        line1: Joi.string().disallow("").min(1).required(),
        line2: Joi.string().allow(""),
        pincode: Joi.string().required().min(6),
        cityId: Joi.objectId().required(),
        stateId: Joi.objectId().required(),
        countryId: Joi.objectId().required()
      }),
      isVerified: Joi.boolean(),
    }
  },

  Login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required().min(6).max(128)
    }
  },

  ForgetPassword: {
    body: {
      username: Joi.string().required()
    }
  },

  // POST /v1/bussinessEntity/set-password
  SetPassword: {
    body: {
      username: Joi.string().required(),
      newPassword: Joi.string().required().min(6).max(128)
    }
  },

  // POST /v1/bussinessEntity/change-password
  ChangePassword: {
    body: {
      currentPassword: Joi.string().required().min(6).max(128),
      newPassword: Joi.string().required().min(6).max(128)
    }
  },
  OTP: {
    body: {
      code: Joi.number().min(3).required(),
      sentTo: Joi.string().required()
    }
  },

  // GET /v1/bussinessEntity/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50)
    }
  },

  // GET /v1/bussinessEntity/:id
  get: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/bussinessEntity/:id
  update: {
    params: {
      id: Joi.objectId().required()
    },
    body: {
      first_name: Joi.string().min(2).max(126),
      last_name: Joi.string().min(2).max(126),
      companyName: Joi.string().min(2).max(126),
      email: Joi.string().email(),
      password: Joi.string().min(6).max(128),
      status: Joi.string().valid(STATUSES),
      phoneNo: Joi.object().keys({
        ccode: Joi.string(),
        mobile: Joi.string().min(6),
      }),
      assignedProduct: Joi.array().items(
        Joi.object({
          productId: Joi.objectId(),
          discount: Joi.number(),
        })
      ),
      address: Joi.object().keys({
        line1: Joi.string().disallow("").min(1),
        line2: Joi.string().allow(""),
        pincode: Joi.string().min(6),
        cityId: Joi.objectId(),
        stateId: Joi.objectId(),
        countryId: Joi.objectId()
      }),
      isVerified: Joi.boolean(),
    }
  }
};
