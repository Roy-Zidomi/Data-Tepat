const prisma = require('../config/database');

/**
 * Log audit trail for critical actions
 * @param {string|number|BigInt} userId - User performing the action
 * @param {string} action - 'create', 'update', 'delete', 'verify', 'approve', 'reject', 'distribute', 'login'
 * @param {string} entityType - e.g., 'AidApplication', 'Household'
 * @param {string|number|BigInt} entityId - The ID of the affected record
 * @param {Object} [oldValue] - Previous state
 * @param {Object} [newValue] - New state
 * @param {string} [reason] - Reason for change
 * @param {string} [ipAddress] - IP Address
 */
const logAudit = async ({
  userId,
  action,
  entityType,
  entityId,
  oldValue = null,
  newValue = null,
  reason = null,
  ipAddress = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId ? BigInt(userId) : null,
        action,
        entity_type: entityType,
        entity_id: BigInt(entityId),
        old_value: oldValue || null,
        new_value: newValue || null,
        reason,
        ip_address: ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Don't throw - audit logging shouldn't break the main flow usually
  }
};

module.exports = {
  logAudit,
};
