const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { PAYMENT_MODE, CHANNEL_PARTNER, STATUSES } = require("../../utils/constants");

module.exports = {
  // POST /v1/channelPartner/register
  Register: {
    body: {
      first_name: Joi.string().min(2).max(256).required(),
      last_name: Joi.string().min(2).max(256).required(),
      firm_name: Joi.string().min(2).max(256).required(),
      email: Joi.object({
        emailId: Joi.string().email().allow(""),
      }),
      phone_no: Joi.object({
        ccode: Joi.string().required().min(2),
        mobile: Joi.number(),
      }),
      password: Joi.string().min(6).required(),
      regAddress: Joi.object().keys({
        line1: Joi.string().disallow("").min(1).required(),
        line2: Joi.string().allow(""),
        pincode: Joi.number().min(99999).required(),
        cityId: Joi.objectId().required(),
        stateId: Joi.objectId().required(),
        countryId: Joi.objectId().required()
      }),
      deliveryAddress: Joi.object().keys({
        line1: Joi.string().disallow("").min(1).required(),
        line2: Joi.string().allow(""),
        pincode: Joi.number().min(99999).required(),
        cityId: Joi.objectId().required(),
        stateId: Joi.objectId().required(),
        countryId: Joi.objectId().required()
      }),
      paymentMode: Joi.string().valid(PAYMENT_MODE),
      creditLimit: Joi.number(),
      creditDays: Joi.number(),
      gstNumber: Joi.string().required().regex(/^([0][1-9]|[1-2][0-9]|[3][0-7])([A-Z]{5})([0-9]{4})([A-Z]{1}[1-9A-Z]{1})([Z]{1})([0-9A-Z]{1})+$/),
      shippingCharge: Joi.number(),
      shippingLimit: Joi.number(),
      assignedSalesPerson: Joi.objectId(),
      assignedDiscount: Joi.array().items(
        Joi.object({
          productId: Joi.objectId().required(),
          discount: Joi.number().required()
        })
      ),
      role: Joi.string().valid(CHANNEL_PARTNER),
      status: Joi.string().valid(STATUSES),
      isVerified: Joi.boolean()
    }
  },

  // POST /v1/channelPartner/login
  Login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string()
        .min(6)
        .required()
    }
  },

  // POST /v1/channelPartner/otp-verify
  OTP: {
    body: {
      code: Joi.number()
        .positive()
        .min(4)
        .required(),
      sentTo: Joi.string().required()
    }
  },

  // POST /v1/channelPartner/:id
  update: {
    body: {
      first_name: Joi.string()
        .min(2)
        .max(256),
      last_name: Joi.string()
        .min(2)
        .max(256),
      firm_name: Joi.string()
        .min(2)
        .max(256),
      email: Joi.object({
        emailId: Joi.string().allow("").email(),
      }),
      phone_no: Joi.object({
        ccode: Joi.string().required()
          .min(2),
        mobile: Joi.number(),
      }),
      mobile: Joi.number(),
      // password: Joi.string().min(6),
      regAddress: Joi.object().keys({
        line1: Joi.string()
          .disallow("")
          .min(1),
        line2: Joi.string().allow("", null),
        pincode: Joi.number().min(99999),
        cityId: Joi.objectId(),
        stateId: Joi.objectId(),
        countryId: Joi.objectId()
      }),
      deliveryAddress: Joi.object().keys({
        line1: Joi.string()
          .disallow("")
          .min(1),
        line2: Joi.string().allow("", null),
        pincode: Joi.number().min(99999),
        cityId: Joi.objectId(),
        stateId: Joi.objectId(),
        countryId: Joi.objectId()
      }),
      paymentMode: Joi.string().valid(PAYMENT_MODE),
      creditLimit: Joi.number(),
      creditDays: Joi.number(),
      gstNumber: Joi.string().regex(
        /^([0][1-9]|[1-2][0-9]|[3][0-7])([A-Z]{5})([0-9]{4})([A-Z]{1}[1-9A-Z]{1})([Z]{1})([0-9A-Z]{1})+$/
      ),
      shippingCharge: Joi.number(),
      shippingLimit: Joi.number(),
      assignedSalesPerson: Joi.objectId(),
      assignedDiscount: Joi.array().items(
        Joi.object({
          productId: Joi.objectId(),
          discount: Joi.number()
        })
      ),
      // role: Joi.string().valid(CHANNEL_PARTNER),
      status: Joi.string().valid(STATUSES),
      isVerified: Joi.boolean()
    },
    params: {
      id: Joi.objectId().required()
    }
  },

  // GET /v1/channelPartner/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50)
    }
  },

  // GET /v1/channelPartner/:id
  get: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/channelPartner/forgot-password
  // POST /v1/channelPartner/resend-otp
  ForgetPassword: {
    body: {
      username: Joi.string().required()
    }
  },

  // POST /v1/channelPartner/set-password
  SetPassword: {
    body: {
      username: Joi.string().required(),
      newPassword: Joi.string()
        .required()
        .min(6)
        .max(128)
    }
  },

  // POST /v1/channelPartner/change-password
  ChangePassword: {
    body: {
      currentPassword: Joi.string()
        .required()
        .min(6)
        .max(128),
      newPassword: Joi.string()
        .required()
        .min(6)
        .max(128)
    }
  }
};
