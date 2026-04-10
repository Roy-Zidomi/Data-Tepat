const prisma = require('../config/database');

class OtpService {
  /**
   * Mengenerate dan menyimpan OTP untuk user tertentu.
   * @param {string|bigint} userId - ID dari user.
   * @param {string} phone - Nomor telepon tujuan.
   * @param {string} actionType - 'activation' | 'login' | 'recovery'
   * @returns {string} - OTP yang di-generate.
   */
  async generateOTP(userId, phone, actionType = 'activation') {
    // Basic rate limiting prevention at DB level: check existing requested count in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingOtps = await prisma.otpCode.findMany({
      where: {
        user_id: BigInt(userId),
        created_at: { gte: oneHourAgo }
      }
    });

    if (existingOtps.length >= 5) {
      throw { statusCode: 429, message: 'Terlalu banyak permintaan OTP dalam satu jam terakhir. Silakan coba nanti.' };
    }

    // Invalidate previous unused OTPs for this action
    await prisma.otpCode.updateMany({
      where: { user_id: BigInt(userId), action_type: actionType, is_used: false },
      data: { is_used: true }
    });

    // Generate 6-digit code
    const optCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes

    await prisma.otpCode.create({
      data: {
        user_id: BigInt(userId),
        phone: phone,
        otp_code: optCode,
        action_type: actionType,
        expires_at: expiresAt,
        is_used: false
      }
    });

    // Mock sending WhatsApp message
    this.mockSendWhatsApp(phone, optCode, actionType);

    return optCode;
  }

  /**
   * Verifikasi OTP
   */
  async verifyOTP(phone, otpCode, actionType = 'activation') {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone: phone,
        otp_code: otpCode,
        action_type: actionType,
        is_used: false,
        expires_at: { gt: new Date() } // Must not be expired
      },
      orderBy: { created_at: 'desc' },
      include: { user: true }
    });

    if (!otpRecord) {
      throw { statusCode: 400, message: 'Kode OTP tidak valid atau sudah kedaluwarsa' };
    }

    // Mark as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { is_used: true }
    });

    return otpRecord;
  }

  /**
   * MOCK WhatsApp API Gateway
   */
  mockSendWhatsApp(phone, optCode, actionType) {
    console.log(`\n================= WHATSAPP GATEWAY MOCK =================`);
    console.log(`To: ${phone}`);
    console.log(`Message: BantuTepat OTP Code untuk ${actionType} Anda adalah: *${optCode}*. Jangan berikan kode ini kepada siapapun. Berlaku 5 menit.`);
    console.log(`==========================================================\n`);
  }
}

module.exports = new OtpService();
