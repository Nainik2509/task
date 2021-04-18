const { USER_ROLES, STATUSES, USER_TYPES } = require("../../utils/constants");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = {
  // POST /v1/auth/register
  Register: {
    body: {
      first_name: Joi.string().required().min(2).max(126),
      last_name: Joi.string().required().min(2).max(126),
      email: Joi.string().allow("").email(),
      password: Joi.string().required().min(6).max(128),
      ccode: Joi.string().required(),
      mobile: Joi.number().required(),
      status: Joi.string().valid(STATUSES),
      role: Joi.string().valid(USER_ROLES),
      type: Joi.string().valid(USER_TYPES),
      subType: Joi.objectId(),
      higherAuthorityId: Joi.objectId(),
      ctc: Joi.number().positive().allow(0),
      isVerified: Joi.boolean(),
      regAddress: Joi.object().required().keys({
        line1: Joi.string().disallow("").min(1).required(),
        line2: Joi.string().allow(""),
        pincode: Joi.string().required().min(6),
        cityId: Joi.objectId().required(),
        stateId: Joi.objectId().required(),
        countryId: Joi.objectId().required()
      })
    }
  },

  // POST /v1/auth/login
  Login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required().min(6).max(128)
    }
  },

  // POST /v1/auth/otp-verify
  OTP: {
    body: {
      code: Joi.number().min(3).required(),
      sentTo: Joi.string().required()
    }
  },


  // POST /v1/auth/forgot-password
  // POST /v1/auth/resend-otp
  ForgetPassword: {
    body: {
      username: Joi.string().required()
    }
  },

  // POST /v1/auth/set-password
  SetPassword: {
    body: {
      username: Joi.string().required(),
      newPassword: Joi.string().required().min(6).max(128)
    }
  },

  // POST /v1/auth/change-password
  ChangePassword: {
    body: {
      currentPassword: Joi.string().required().min(6).max(128),
      newPassword: Joi.string().required().min(6).max(128)
    }
  },
};
