const rateLimit = require('express-rate-limit');

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildAuthLimiter = ({ maxEnvKey, defaultMax, message }) =>
  rateLimit({
    windowMs: parsePositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: parsePositiveInt(process.env[maxEnvKey], defaultMax),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

const loginLimiter = buildAuthLimiter({
  maxEnvKey: 'AUTH_LOGIN_RATE_LIMIT_MAX',
  defaultMax: 5,
  message: 'Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.',
});

const passwordResetLimiter = buildAuthLimiter({
  maxEnvKey: 'AUTH_PASSWORD_RESET_RATE_LIMIT_MAX',
  defaultMax: 3,
  message: 'Terlalu banyak permintaan reset password. Coba lagi beberapa menit lagi.',
});

module.exports = {
  loginLimiter,
  passwordResetLimiter,
};
