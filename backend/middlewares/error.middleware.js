const ErrorResponse = require("../utils/errorResponse");

exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(err.stack);

  // Prisma error for duplicate field value
  if (err.code === "P2002") {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Prisma validation error
  if (err.code === "P2000") {
    const message = "Invalid input data";
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

// Utility function for consistent error handling
exports.ErrorResponse = ErrorResponse;
