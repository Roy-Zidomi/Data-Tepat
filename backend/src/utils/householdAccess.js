const prisma = require('../config/database');

const DEFAULT_WIDE_HOUSEHOLD_ACCESS_ROLES = [
  'admin_main',
  'admin_staff',
  'pengawas',
  'relawan',
];

const toBigIntId = (value, label = 'ID') => {
  if (value === null || value === undefined || value === '') {
    throw { statusCode: 400, message: `${label} is required` };
  }

  try {
    return BigInt(value);
  } catch {
    throw { statusCode: 400, message: `${label} must be numeric` };
  }
};

const hasWideHouseholdAccess = (user, allowedWideRoles = DEFAULT_WIDE_HOUSEHOLD_ACCESS_ROLES) =>
  Boolean(user?.role && allowedWideRoles.includes(user.role));

const assertHouseholdAccess = async (user, householdId, options = {}) => {
  const {
    client = prisma,
    allowedWideRoles = DEFAULT_WIDE_HOUSEHOLD_ACCESS_ROLES,
    notFoundMessage = 'Household not found',
    forbiddenMessage = 'Forbidden: You can only access your own household',
  } = options;

  if (!user?.id || !user?.role) {
    throw { statusCode: 401, message: 'Authentication required' };
  }

  const id = toBigIntId(householdId, 'Household ID');
  const household = await client.household.findUnique({
    where: { id },
    select: {
      id: true,
      created_by_user_id: true,
    },
  });

  if (!household) {
    throw { statusCode: 404, message: notFoundMessage };
  }

  if (hasWideHouseholdAccess(user, allowedWideRoles)) {
    return household;
  }

  if (household.created_by_user_id?.toString() === user.id.toString()) {
    return household;
  }

  throw { statusCode: 403, message: forbiddenMessage };
};

const scopeHouseholdRelationWhere = (where, user, options = {}) => {
  const { allowedWideRoles = DEFAULT_WIDE_HOUSEHOLD_ACCESS_ROLES } = options;

  if (!user?.id || hasWideHouseholdAccess(user, allowedWideRoles)) {
    return where;
  }

  return {
    ...where,
    household: {
      ...(where.household || {}),
      created_by_user_id: toBigIntId(user.id, 'User ID'),
    },
  };
};

module.exports = {
  DEFAULT_WIDE_HOUSEHOLD_ACCESS_ROLES,
  assertHouseholdAccess,
  hasWideHouseholdAccess,
  scopeHouseholdRelationWhere,
  toBigIntId,
};
