const { z } = require('zod');

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin_main', 'admin_staff', 'pengawas', 'relawan', 'warga']),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').optional(),
});

const activateSchema = z.object({
  phone: z.string().min(8, 'Phone number is required'),
  otpCode: z.string().length(6, 'OTP must be exactly 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

const resendOtpSchema = z.object({
  phone: z.string().min(8, 'Phone number is required')
});

module.exports = {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  activateSchema,
  resendOtpSchema
};