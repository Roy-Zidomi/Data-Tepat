const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response');
const prisma = require('../config/database');

const userProfileSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  phone: true,
  role: true,
  is_active: true,
  activation_status: true,
  created_at: true,
  updated_at: true,
};

const buildCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = process.env.COOKIE_SAMESITE || (isProduction ? 'none' : 'lax');
  const secure =
    process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === 'true'
      : isProduction;

  const options = {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  if (process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
};

class AuthController {
  async register(req, res, next) {
    try {
      const data = req.body;
      const { token, user } = await authService.register(data);

      res.cookie('token', token, buildCookieOptions());

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
      res.cookie('token', token, buildCookieOptions());

      return successResponse(res, { user }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const cookieOptions = buildCookieOptions();
      delete cookieOptions.maxAge;
      res.clearCookie('token', cookieOptions);
      return successResponse(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: BigInt(req.user.id) },
        select: userProfileSelect,
      });

      if (!user) {
        throw { statusCode: 404, message: 'User not found' };
      }

      return successResponse(res, user, 'Current user profile');
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
  // OTP endpoints removed — activation via OTP no longer used

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return successResponse(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      return successResponse(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
