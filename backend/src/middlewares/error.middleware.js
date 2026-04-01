const { errorResponse } = require('../utils/response');
const { ZodError } = require('zod');

/**
 * Catch 404 Not Found
 */
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Not Found - ${req.originalUrl}`, 404);
};

/**
 * Global Error Handler
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error('[Error Handler]:', err);

  // Zod Validation Errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 'Validation Error', 400, errors);
  }

  // Prisma Errors
  if (err.code) {
    // Prisma Unique Constraint Violation
    if (err.code === 'P2002') {
      const target = err.meta?.target || 'Field';
      return errorResponse(res, `Duplicate entry. ${target} already exists.`, 409);
    }
    // Record Not Found
    if (err.code === 'P2025') {
      return errorResponse(res, 'Record not found', 404);
    }
  }

  // Default Server Error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};