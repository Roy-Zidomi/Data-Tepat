const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response');
const prisma = require('../config/database');
const { excludeFields } = require('../utils/helpers');

class AuthController {
  async register(req, res, next) {
    try {
      const data = req.body;
      const { token, user } = await authService.register(data);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return successResponse(res, { user }, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { emailOrUsername, password, role } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const { token, user } = await authService.login(emailOrUsername, password, ipAddress, role);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return successResponse(res, { user }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      return successResponse(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: BigInt(req.user.id) }
      });

      if (!user) {
        throw { statusCode: 404, message: 'User not found' };
      }

      const safeUser = excludeFields(user, ['password_hash']);
      return successResponse(res, safeUser, 'Current user profile');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      await authService.changePassword(req.user.id, currentPassword, newPassword);

      return successResponse(res, null, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  }
  async activate(req, res, next) {
    try {
      const { phone, otpCode, newPassword } = req.body;
      await authService.activateAccount(phone, otpCode, newPassword);
      return successResponse(res, null, 'Account activated successfully. You can now login.', 200);
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req, res, next) {
    try {
      const { phone } = req.body;
      await authService.resendOtp(phone);
      return successResponse(res, null, 'A new OTP has been sent to your phone.', 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();