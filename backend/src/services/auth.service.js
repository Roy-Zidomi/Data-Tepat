const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');

class AuthService {
  async register(data) {
    const { name, username, email, password, phone } = data;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username || email } // fallback username to email if not provided
        ]
      }
    });

    if (existingUser) {
      throw { statusCode: 400, message: 'Email or username already in use' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username: username || email.split('@')[0], 
        password_hash: hashedPassword,
        phone,
        role: 'warga',
        is_active: true
      }
    });

    await logAudit({
      userId: user.id,
      action: 'create',
      entityType: 'User',
      entityId: user.id,
      reason: 'User self-registration'
    });

    return this.login(user.email, password, 'system');
  }
  async login(emailOrUsername, password, ipAddress, expectedRole) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: emailOrUsername, mode: 'insensitive' } },
          { username: { equals: emailOrUsername, mode: 'insensitive' } }
        ]
      }
    });

    if (!user || !user.is_active) {
      console.log(`[Login Failed]: User not found or inactive. Email/Username: ${emailOrUsername}`);
      throw { statusCode: 401, message: 'Akun tidak ditemukan atau tidak aktif' };
    }

    // Validate role matches what the user selected on the login form
    if (expectedRole && user.role !== expectedRole) {
      console.log(`[Login Failed]: Role mismatch. User: ${user.email}, Role in DB: ${user.role}, Expected: ${expectedRole}`);
      throw {
        statusCode: 403,
        message: `Akun ini terdaftar sebagai "${user.role}", bukan "${expectedRole}". Silakan pilih tipe akun yang sesuai.`
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log(`[Login Failed]: Incorrect password for ${user.email}`);
      throw { statusCode: 401, message: 'Password salah' };
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
      phone: user.phone,
      must_change_password: user.must_change_password
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
      data: { password_hash: hashedNewPassword, must_change_password: false }
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
  async activateAccount(phone, otpCode, newPassword) {
    const otpService = require('./otp.service');
    const otpRecord = await otpService.verifyOTP(phone, otpCode, 'activation');

    const user = otpRecord.user;
    if (user.activation_status === 'active') {
      throw { statusCode: 400, message: 'Account is already active' };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedNewPassword,
        is_active: true,
        activation_status: 'active'
      }
    });

    await logAudit({
      userId: user.id,
      action: 'update',
      entityType: 'User',
      entityId: user.id,
      reason: 'Account activated via OTP'
    });

    return true;
  }

  async resendOtp(phone) {
    const user = await prisma.user.findFirst({
      where: { phone, activation_status: 'pending_otp' }
    });

    if (!user) {
      throw { statusCode: 404, message: 'User pending activation not found with this phone number' };
    }

    const otpService = require('./otp.service');
    await otpService.generateOTP(user.id, phone, 'activation');
    return true;
  }

  /**
   * Forgot password — generate token, hash it, store in DB, return plaintext token.
   * In production, the plaintext token would be sent via email.
   */
  async forgotPassword(email) {
    // Always return generic message to prevent email enumeration
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });

    if (!user || !user.is_active) {
      // Don't reveal whether email exists
      return { message: 'Jika email terdaftar, link reset password telah dikirim.' };
    }

    // Generate random token
    const plainToken = crypto.randomBytes(32).toString('hex');
    // Hash with SHA-256 before storing
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

    // Set token and expiry (15 minutes)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_reset_token: hashedToken,
        password_reset_expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      }
    });

    // Build reset URL (frontend route)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${plainToken}`;

    // In production: send email with resetUrl
    // For development: log to console
    console.log(`[Password Reset] Token for ${email}: ${resetUrl}`);

    await logAudit({
      userId: user.id,
      action: 'update',
      entityType: 'User',
      entityId: user.id,
      reason: 'Password reset requested'
    });

    return { message: 'Jika email terdaftar, link reset password telah dikirim.' };
  }

  /**
   * Reset password using token from email link.
   * Verifies SHA-256 hash of token, checks expiry, updates password.
   */
  async resetPassword(token, newPassword) {
    // Hash the incoming plaintext token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        password_reset_token: hashedToken,
        password_reset_expires: { gt: new Date() }
      }
    });

    if (!user) {
      throw { statusCode: 400, message: 'Token tidak valid atau sudah kedaluwarsa.' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null,
        must_change_password: false
      }
    });

    await logAudit({
      userId: user.id,
      action: 'update',
      entityType: 'User',
      entityId: user.id,
      reason: 'Password reset via email token'
    });

    return { message: 'Password berhasil direset. Silakan login dengan password baru.' };
  }
}
module.exports = new AuthService();
