const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { USER_ROLES } = require("../../utils/constants");

module.exports = {
  // GET /v1/user/list
  list: {
    query: {
      page: Joi.number().min(0),
      perPage: Joi.number()
        .min(1)
        .max(50),
      email: Joi.string().email(),
      role: Joi.string().valid(USER_ROLES)
    }
  },

  // GET /v1/blockUser/:id
  block: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // GET /v1/blockUser/:id
  higherAuthority: {
    body: {
      code: Joi.string().required()
    }
  },

  // GET /v1/user/deviceToken
  deviceToken: {
    body: {
      deviceToken: Joi.string().required()
    }
  },

  // GET /v1/user/muteNotification
  Notification: {
    headers: {
      workspaceid: Joi.objectId().required()
    },
    body: {
      roomId: Joi.objectId().required()
    }
  },

  // GET /v1/user/:id
  get: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/user/:id
  update: {
    params: {
      id: Joi.objectId().required()
    }
  },

  // POST /v1/user/masterSync
  masterSync: {
    body: {
      date: Joi.date().required()
      // userId: Joi.objectId().required(),
    }
  },

  // POST /v1/user/deleteWorkspaceUser/:id
  deleteWorkspaceUser: {
    params: {
      id: Joi.objectId().required()
    },
    body: {
      workspaceid: Joi.objectId().required()
    }
  }
};
