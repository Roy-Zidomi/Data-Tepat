const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');

class AuthService {
  async login(emailOrUsername, password, ipAddress) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      }
    });

    if (!user || !user.is_active) {
      throw { statusCode: 401, message: 'Invalid credentials or inactive account' };
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id.toString(), role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Build user safe object
    const userSafe = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      phone: user.phone
    };

    // Audit log
    await logAudit({
      userId: user.id,
      action: 'login',
      entityType: 'User',
      entityId: user.id,
      ipAddress
    });

    return { token, user: userSafe };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Current password is incorrect' };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: BigInt(userId) },
      data: { password_hash: hashedNewPassword }
    });
    
    await logAudit({
      userId,
      action: 'update',
      entityType: 'User',
      entityId: user.id,
      reason: 'Password changed'
    });

    return true;
  }
}

module.exports = new AuthService();