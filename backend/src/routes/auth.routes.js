const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { loginSchema, changePasswordSchema } = require('../validators/auth.validator');

// Public route
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.use(authenticate);
router.get('/me', authController.getMe);
router.post('/change-password', validate(changePasswordSchema), authController.changePassword);

module.exports = router;