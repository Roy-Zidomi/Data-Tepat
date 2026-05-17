const crypto = require('crypto');
const { errorResponse } = require('../utils/response');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_HEADER = 'x-csrf-token';
const EXEMPT_PATHS = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
]);

const getCsrfSecret = () => process.env.CSRF_SECRET || process.env.JWT_SECRET;

const signCsrfToken = (sessionToken, nonce) =>
  crypto
    .createHmac('sha256', getCsrfSecret())
    .update(`${sessionToken}:${nonce}`)
    .digest('hex');

const createCsrfToken = (sessionToken) => {
  const nonce = crypto.randomBytes(16).toString('hex');
  const signature = signCsrfToken(sessionToken, nonce);
  return `${nonce}.${signature}`;
};

const verifyCsrfToken = (sessionToken, csrfToken) => {
  if (!sessionToken || !csrfToken || !getCsrfSecret()) return false;

  const [nonce, signature] = csrfToken.split('.');
  if (!nonce || !signature) return false;

  const expectedSignature = signCsrfToken(sessionToken, nonce);
  const expected = Buffer.from(expectedSignature, 'hex');
  const actual = Buffer.from(signature, 'hex');

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

const hasBearerToken = (req) =>
  Boolean(req.headers.authorization && req.headers.authorization.startsWith('Bearer '));

const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method) || EXEMPT_PATHS.has(req.path) || hasBearerToken(req)) {
    return next();
  }

  const sessionToken = req.cookies?.token;
  if (!sessionToken) {
    return next();
  }

  const csrfToken = req.get(CSRF_HEADER);
  if (!verifyCsrfToken(sessionToken, csrfToken)) {
    return errorResponse(res, 'CSRF token tidak valid atau tidak ditemukan', 403);
  }

  return next();
};

module.exports = {
  createCsrfToken,
  csrfProtection,
  verifyCsrfToken,
};
