const userService = require('../services/user.service');
const { successResponse } = require('../utils/response');

class UserController {
  async listAll(req, res, next) {
    try {
      const { data, meta } = await userService.listAll(req.query);

      const result = JSON.parse(
        JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
      );

      return successResponse(res, { records: result, meta }, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id);

      const result = JSON.parse(
        JSON.stringify(user, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
      );

      return successResponse(res, result, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const { user, tempPassword } = await userService.createUser(req.body, req.user);

      const result = JSON.parse(
        JSON.stringify(user, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
      );

      const message = tempPassword
        ? `User berhasil dibuat. Password sementara: ${tempPassword}`
        : 'User berhasil dibuat. OTP telah dikirim ke nomor telepon terdaftar.';

      return successResponse(res, result, message, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const updated = await userService.updateUser(req.params.id, req.body, req.user);

      const result = JSON.parse(
        JSON.stringify(updated, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
      );

      return successResponse(res, result, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const { role } = req.body;
      const updated = await userService.updateRole(req.params.id, role, req.user);

      const result = JSON.parse(
        JSON.stringify(updated, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
      );

      return successResponse(res, result, 'User role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req, res, next) {
    try {
      const { is_active } = req.body;
      const updated = await userService.toggleActive(req.params.id, is_active, req.user);

      const result = JSON.parse(
        JSON.stringify(updated, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
      );

      const message = is_active ? 'User activated successfully' : 'User deactivated successfully';
      return successResponse(res, result, message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
