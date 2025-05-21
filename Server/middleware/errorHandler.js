const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  // ----------------------- Extract request information -----------------------
  const { method, originalUrl, ip } = req;
  const requestId = req.headers["x-request-id"] || "unknown";

  // ----------------------- Set default error status and message -----------------------
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || "Internal Server Error";

  // ----------------------- Handle specific error types -----------------------
  if (err.name === "ValidationError") {
    // Mongoose validation error
    statusCode = 400;
    errorMessage = "Validation Error";
    logger.warn({
      message: `Validation Error: ${err.message}`,
      method,
      path: originalUrl,
      requestId,
      ip,
      validationErrors: err.errors,
    });
  } else if (err.name === "CastError") {
    // MongoDB invalid ID error
    statusCode = 400;
    errorMessage = "Invalid ID format";
    logger.warn({
      message: `Cast Error: ${err.message}`,
      method,
      path: originalUrl,
      requestId,
      ip,
    });
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    errorMessage = "Duplicate entry";
    logger.warn({
      message: `Duplicate Key Error: ${JSON.stringify(err.keyValue)}`,
      method,
      path: originalUrl,
      requestId,
      ip,
    });
  } else {
    // Generic or unknown errors
    logger.error({
      message: `Unhandled Error: ${errorMessage}`,
      method,
      path: originalUrl,
      requestId,
      ip,
      stack: err.stack,
    });
  }

  // ----------------------- Create response based on environment -----------------------
  const isDev = process.env.NODE_ENV === "development";
  const errorResponse = {
    status: "error",
    message: errorMessage,
    ...(isDev && {
      error: err.message,
      stack: err.stack,
      requestId,
      ...(err.name === "ValidationError" && { validationErrors: err.errors }),
    }),
  };

  // ----------------------- Send error response -----------------------
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
