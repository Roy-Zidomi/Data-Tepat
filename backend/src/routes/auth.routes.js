const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { loginSchema, registerSchema, changePasswordSchema, activateSchema, resendOtpSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/auth.validator');

// Public routes
router.post('/login', validate(loginSchema), authController.login);
router.post('/activate', validate(activateSchema), authController.activate);
router.post('/otp/resend', validate(resendOtpSchema), authController.resendOtp);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.use(authenticate);
router.get('/me', authController.getMe);
router.post('/change-password', validate(changePasswordSchema), authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;