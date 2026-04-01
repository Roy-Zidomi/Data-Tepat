/**
 * Build pagination meta object
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Exclude fields from an object (e.g., password_hash)
 */
const excludeFields = (obj, keys) => {
  if (!obj) return obj;
  const newObj = { ...obj };
  for (let key of keys) {
    delete newObj[key];
  }
  return newObj;
};

/**
 * Generate unique application number
 */
const generateApplicationNo = () => {
  const prefix = 'APP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
};

/**
 * Generate unique distribution code
 */
const generateDistributionCode = () => {
  const prefix = 'DIST';
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
};

module.exports = {
  buildPaginationMeta,
  excludeFields,
  generateApplicationNo,
  generateDistributionCode,
};