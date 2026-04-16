const prisma = require('../config/database');
const bcrypt = require('bcrypt');
const { logAudit } = require('../utils/auditLogger');
const { buildPaginationMeta, excludeFields } = require('../utils/helpers');

class UserService {
  /**
   * List all users with pagination and filters
   */
  async listAll(query) {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      is_active,
      sort_by = 'created_at',
      sort_dir = 'desc',
    } = query;

    const pageTotal = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageTotal;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        take: pageTotal,
        skip,
        orderBy: { [sort_by]: sort_dir },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          phone: true,
          role: true,
          is_active: true,
          activation_status: true,
          must_change_password: true,
          created_at: true,
          updated_at: true,
        },
      }),
    ]);

    return {
      data: users,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get user by ID (excluding password_hash)
   */
  async getById(id) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        is_active: true,
        activation_status: true,
        must_change_password: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return user;
  }

  /**
   * Create a new user account (admin_main creates relawan, pengawas, admin_staff, warga)
   * Generates a temporary password and sets activation_status to 'pending_otp' if phone is provided.
   */
  async createUser(data, adminUser) {
    const { name, email, phone, role } = data;

    // Check for duplicate email
    if (email) {
      const existingEmail = await prisma.user.findFirst({ where: { email } });
      if (existingEmail) {
        throw { statusCode: 409, message: 'Email sudah terdaftar' };
      }
    }

    // Generate username from name
    const baseUsername = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 20);
    const username = data.username || `${baseUsername}_${Date.now().toString().slice(-4)}`;

    // Check for duplicate username
    const existingUsername = await prisma.user.findFirst({ where: { username } });
    if (existingUsername) {
      throw { statusCode: 409, message: 'Username sudah terdaftar' };
    }

    // For warga: no password (activation via OTP)
    // For staff/relawan/pengawas: generate temp password
    let password_hash = '';
    let tempPassword = null;
    let activationStatus = 'pending_otp';
    let mustChangePassword = false;

    if (role !== 'warga') {
      // Generate random temporary password
      tempPassword = this._generateTempPassword(10);
      password_hash = await bcrypt.hash(tempPassword, 10);
      activationStatus = 'active'; // Staff accounts are immediately active
      mustChangePassword = true;   // Flag: admin-generated temp password
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email || null,
        username,
        password_hash,
        phone: phone || null,
        role,
        is_active: role !== 'warga', // warga inactive until OTP activation
        activation_status: activationStatus,
        must_change_password: mustChangePassword,
      },
    });

    // Generate OTP for warga accounts
    if (role === 'warga' && phone) {
      const otpService = require('./otp.service');
      await otpService.generateOTP(newUser.id, phone, 'activation');
    }

    // Audit log
    await logAudit({
      userId: adminUser.id,
      action: 'create',
      entityType: 'User',
      entityId: newUser.id,
      newValue: { name, email, username, role, phone },
      reason: `Admin created ${role} account`,
    });

    return {
      user: excludeFields({ ...newUser, id: newUser.id.toString() }, ['password_hash']),
      tempPassword, // null for warga (OTP-based), temporary password for others
    };
  }

  /**
   * Update user role (admin_main only)
   */
  async updateRole(userId, newRole, adminUser) {
    const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    // Cannot change own role
    if (user.id.toString() === adminUser.id.toString()) {
      throw { statusCode: 400, message: 'Tidak dapat mengubah role akun sendiri' };
    }

    const oldRole = user.role;

    const updated = await prisma.user.update({
      where: { id: BigInt(userId) },
      data: { role: newRole },
    });

    await logAudit({
      userId: adminUser.id,
      action: 'update',
      entityType: 'User',
      entityId: updated.id,
      oldValue: { role: oldRole },
      newValue: { role: newRole },
      reason: `Role changed from ${oldRole} to ${newRole}`,
    });

    return excludeFields(updated, ['password_hash']);
  }

  /**
   * Toggle user active status
   */
  async toggleActive(userId, isActive, adminUser) {
    const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    // Cannot deactivate own account
    if (user.id.toString() === adminUser.id.toString()) {
      throw { statusCode: 400, message: 'Tidak dapat menonaktifkan akun sendiri' };
    }

    const updated = await prisma.user.update({
      where: { id: BigInt(userId) },
      data: { is_active: isActive },
    });

    await logAudit({
      userId: adminUser.id,
      action: 'update',
      entityType: 'User',
      entityId: updated.id,
      oldValue: { is_active: !isActive },
      newValue: { is_active: isActive },
      reason: isActive ? 'User activated' : 'User deactivated',
    });

    return excludeFields(updated, ['password_hash']);
  }

  /**
   * Update user profile data
   */
  async updateUser(userId, data, adminUser) {
    const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.username) updateData.username = data.username;
    if (data.phone !== undefined) updateData.phone = data.phone;

    const updated = await prisma.user.update({
      where: { id: BigInt(userId) },
      data: updateData,
    });

    await logAudit({
      userId: adminUser.id,
      action: 'update',
      entityType: 'User',
      entityId: updated.id,
      oldValue: excludeFields(user, ['password_hash']),
      newValue: updateData,
      reason: 'Admin updated user profile',
    });

    return excludeFields(updated, ['password_hash']);
  }

  /**
   * Generate a temporary alphanumeric password
   */
  _generateTempPassword(length = 10) {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

module.exports = new UserService();
