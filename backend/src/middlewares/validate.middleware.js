const { errorResponse } = require('../utils/response');

/**
 * Validate request against Zod schema
 * @param {Object} schema - Zod schema object
 * @param {string} source - 'body', 'query', or 'params'
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsedData = schema.parse(req[source]);
      
      // Overwrite req scope with validated & parsed data
      // For instance: string "1" parameterized becomes number 1 if specified in Zod
      req[source] = parsedData;
      
      next();
    } catch (error) {
      next(error); // Pass to global error handler (which handles ZodError)
    }
  };
};

module.exports = {
  validate,
};
