const { INTERNAL_SERVER_ERROR } = require("./constants");

class APIError extends Error {
  constructor({ message, stack, errors = [], status = INTERNAL_SERVER_ERROR }) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.isPublic = process.env.NODE_ENV === "development" ? true : false;
    this.stack = stack;
  }
}

module.exports = APIError;
