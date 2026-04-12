const { PERMISSIONS } = require('../config/permissions');
const { errorResponse } = require('../utils/response');

/**
 * Permission-based authorization middleware.
 * Uses centralized permission constants from config/permissions.js.
 * 
 * Usage:
 *   const { requirePermission } = require('../middlewares/rbac.middleware');
 *   router.get('/users', authenticate, requirePermission('USER_LIST'), controller.list);
 * 
 * @param {string} permissionKey - Key from PERMISSIONS constant (e.g., 'USER_CREATE')
 */
const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    const allowedRoles = PERMISSIONS[permissionKey];

    if (!allowedRoles) {
      console.error(`[RBAC] Unknown permission key: ${permissionKey}`);
      return errorResponse(res, 'Internal server error: unknown permission', 500);
    }

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied: permission '${permissionKey}' requires role [${allowedRoles.join(', ')}]`,
        403
      );
    }

    next();
  };
};

/**
 * Middleware to check if user has ANY of the specified permissions.
 * Useful when an endpoint serves multiple distinct permission scopes.
 * 
 * Usage:
 *   router.get('/data', authenticate, requireAnyPermission('AUDIT_LOG_FULL', 'AUDIT_LOG_LIMITED'), handler);
 * 
 * @param  {...string} permissionKeys - Multiple permission keys
 */
const requireAnyPermission = (...permissionKeys) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const hasPermission = permissionKeys.some((key) => {
      const allowedRoles = PERMISSIONS[key];
      return allowedRoles && allowedRoles.includes(req.user.role);
    });

    if (!hasPermission) {
      return errorResponse(
        res,
        `Access denied: requires one of [${permissionKeys.join(', ')}]`,
        403
      );
    }

    next();
  };
};

module.exports = {
  requirePermission,
  requireAnyPermission,
};
