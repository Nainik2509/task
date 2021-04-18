const { ValidationError } = require("express-validation");
const APIError = require("../utils/APIError");
const { env } = require("../config/env-vars");
const {
  BAD_REQUEST,
  VALIDATION_ERROR,
  NO_RECORD_FOUND,
  TOO_MANY_REQUESTS,
  REQUEST_OVERFLOW,
  NOT_FOUND,
  OK
} = require("../utils/constants");

const Handler = (err, req, res, next) => {
  const response = {
    code: err.status,
    message: err.message,
    errors: err.errors,
    stack: err.stack
  };
  if (env === "production") delete response.stack;
  res.status(OK).json(response);
  res.end();
};

exports.ErrorHandler = Handler;
exports.Handler = Handler;

exports.ConvertError = (err, req, res, next) => {
  let ConvertedError = err;
  if (err instanceof ValidationError) {
    const errors = err.errors.map(e => ({
      location: e.location,
      messages: e.messages[0].replace(/[^\w\s]/gi, ""),
      field: e.field[0]
    }));
    ConvertedError = new APIError({
      message: VALIDATION_ERROR,
      status: err.status || BAD_REQUEST,
      errors
    });
  } else if (!(err instanceof APIError)) {
    ConvertedError = new APIError({
      message: err.message,
      status: err.status,
      stack: err.stack
    });
  }
  return Handler(ConvertedError, req, res, next);
};

exports.NotFound = (req, res, next) => {
  const err = new APIError({
    message: NO_RECORD_FOUND,
    status: NOT_FOUND
  });
  return Handler(err, req, res, next);
};

exports.RateLimitHandler = (req, res, next) => {
  const err = new APIError({
    message: REQUEST_OVERFLOW,
    status: TOO_MANY_REQUESTS
  });
  return Handler(err, req, res, next);
};
