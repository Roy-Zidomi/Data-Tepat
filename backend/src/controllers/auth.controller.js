const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response');
const prisma = require('../config/database');
const { excludeFields } = require('../utils/helpers');

class AuthController {
  async login(req, res, next) {
    try {
      const { emailOrUsername, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const data = await authService.login(emailOrUsername, password, ipAddress);

      return successResponse(res, data, 'Login successful');
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
}

module.exports = new AuthController();