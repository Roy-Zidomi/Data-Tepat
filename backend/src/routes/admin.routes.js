const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { successResponse } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');

/**
 * Helper: Generate random alphanumeric password
 */
function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Helper: Serialize BigInt in objects
 */
function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (_, v) =>
    typeof v === 'bigint' ? v.toString() : v
  ));
}

router.use(authorize('admin_main', 'admin_staff', 'pengawas'));

/**
 * GET /api/admin/warga-eligible
 * Daftar rumah tangga yang pengajuannya sudah Disetujui 
 * namun belum memiliki akun warga terhubung.
 */
router.get('/warga-eligible', async (req, res, next) => {
  try {
    // Find approved decisions
    const approved = await prisma.beneficiaryDecision.findMany({
      where: { decision_status: 'approved' },
      include: {
        application: {
          include: {
            household: {
              include: {
                region: true,
                createdByUser: { select: { role: true } }
              }
            },
            aidType: { select: { name: true } },
          }
        }
      }
    });

    // Filter those whose created_by_user has role !== 'warga' (no account yet)
    const eligible = approved.filter(decision =>
      decision.application.household.createdByUser.role !== 'warga'
    );

    const result = eligible.map(d => ({
      household_id: d.application.household.id.toString(),
      nomor_kk: d.application.household.nomor_kk,
      nama_kepala_keluarga: d.application.household.nama_kepala_keluarga,
      nik_kepala_keluarga: d.application.household.nik_kepala_keluarga,
      alamat: d.application.household.alamat,
      phone: d.application.household.phone,
      aid_type: d.application.aidType.name,
      region: d.application.household.region,
      application_no: d.application.application_no,
      decision_id: d.id.toString(),
    }));

    return successResponse(res, result, 'Eligible households for warga account creation');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/create-warga
 * Admin membuatkan akun warga untuk rumah tangga yang sudah disetujui.
 * Body: { household_id, email, phone?, name }
 */
router.post('/create-warga', async (req, res, next) => {
  try {
    const { household_id, email, name, phone } = req.body;

    if (!household_id || !name) {
      throw { statusCode: 400, message: 'household_id dan name wajib diisi' };
    }

    // Verify household exists
    const household = await prisma.household.findUnique({
      where: { id: BigInt(household_id) }
    });
    if (!household) {
      throw { statusCode: 404, message: 'Data rumah tangga tidak ditemukan' };
    }

    // Check if warga account already exists for this household
    const existingHouseholdUser = await prisma.user.findFirst({
      where: { email, role: 'warga' }
    });
    if (existingHouseholdUser) {
      throw { statusCode: 409, message: 'Akun dengan email ini sudah ada' };
    }

    // Generate username from NIK or name

    // Username: lowercase & sanitized name or NIK prefix
    const baseUsername = (household.nik_kepala_keluarga || name)
      .toLowerCase()
      .replace(/\s+/g, '_')
      .substring(0, 20);
    const username = `${baseUsername}_${Date.now().toString().slice(-4)}`;

    // Create warga user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email || null,
        username,
        password_hash: '', // will be set upon activation
        phone: phone || household.phone || null,
        role: 'warga',
        is_active: false,
        activation_status: 'pending_otp',
      }
    });

    // Link household to the new warga user
    await prisma.household.update({
      where: { id: BigInt(household_id) },
      data: { created_by_user_id: newUser.id }
    });

    // Generate OTP
    const otpService = require('../services/otp.service');
    const userPhone = phone || household.phone;
    if(userPhone) {
      await otpService.generateOTP(newUser.id, userPhone, 'activation');
    }

    // Audit log
    await logAudit({
      userId: req.user.id,
      action: 'create',
      entityType: 'User',
      entityId: newUser.id,
      reason: `Admin created warga account for household ${household_id}`
    });

    const result = serializeBigInt({
      user_id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      phone: userPhone,
      activation_status: newUser.activation_status,
      household_id: household_id,
    });

    return successResponse(res, result, 'Akun warga berhasil dibuat. OTP telah dikirim ke nomor WA terdaftar.', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/audit-logs
 * Pengawas dan Admin dapat melihat audit trail dari pengambilan keputusan
 */
router.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { created_at: 'desc' },
      take: 100,
      include: {
        user: { select: { name: true, role: true } }
      }
    });

    const result = logs.map(l => ({
      ...l,
      id: l.id.toString(),
      user_id: l.user_id ? l.user_id.toString() : null,
      entity_id: l.entity_id.toString()
    }));

    return successResponse(res, result, 'Audit logs retrieved');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
