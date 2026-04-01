const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

/**
 * Middleware to verify JWT token
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authorization token missing or invalid format', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, ... }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    return errorResponse(res, 'Invalid token', 401);
  }
};

/**
 * Middleware for role-based access control
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'relawan')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 'Access denied: insufficient permissions', 403);
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};