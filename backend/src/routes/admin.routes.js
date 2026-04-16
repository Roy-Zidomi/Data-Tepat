const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission, requireAnyPermission } = require('../middlewares/rbac.middleware');
const { successResponse } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');

// All admin routes require authentication
router.use(authenticate);

/**
 * Helper: Serialize BigInt in objects
 */
function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (_, v) =>
    typeof v === 'bigint' ? v.toString() : v
  ));
}

/**
 * GET /api/v1/admin/warga-eligible
 * Daftar rumah tangga yang pengajuannya sudah Disetujui 
 * namun belum memiliki akun warga terhubung.
 * Access: admin_main only
 */
router.get('/warga-eligible', requirePermission('WARGA_ACCOUNT_CREATE'), async (req, res, next) => {
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
 * POST /api/v1/admin/create-warga
 * Admin membuatkan akun warga untuk rumah tangga yang sudah disetujui.
 * Body: { household_id, email, phone?, name }
 * Access: admin_main only
 */
router.post('/create-warga', requirePermission('WARGA_ACCOUNT_CREATE'), async (req, res, next) => {
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
      reason: `Admin created warga account for household ${household_id}`,
      ipAddress: req.ip,
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
 * GET /api/v1/admin/dashboard-stats
 * Dashboard statistics — response terstruktur per role (Revisi #2 & #6)
 * Access: admin_main, admin_staff
 */
router.get('/dashboard-stats', requirePermission('DASHBOARD_OVERVIEW'), async (req, res, next) => {
  try {
    const role = req.user.role;

    // Keep dashboard queries sequential so the endpoint stays stable even when
    // production/runtime uses a very small pooled connection limit.
    const totalHouseholds = await prisma.household.count();
    const totalApplications = await prisma.aidApplication.count();
    const processingApplications = await prisma.aidApplication.count({
      where: {
        status: {
          in: ['submitted', 'initial_validation', 'document_verification', 'field_survey', 'scoring', 'admin_review'],
        },
      },
    });
    const approvedDecisions = await prisma.beneficiaryDecision.count({
      where: { decision_status: 'approved' },
    });
    const rejectedDecisions = await prisma.beneficiaryDecision.count({
      where: { decision_status: 'rejected' },
    });
    const totalDistributions = await prisma.aidDistribution.count();
    const openComplaints = await prisma.complaint.count({
      where: { status: { in: ['open', 'in_review'] } },
    });
    const pendingDocumentVerification = await prisma.document.count({
      where: { verifications: { none: {} } },
    });
    const pendingSurveyReview = await prisma.survey.count({
      where: { status: 'completed' },
    });

    const incompleteHouseholds = await prisma.household.count({
      where: { economicCondition: null },
    });

    const recentDistributions = await prisma.aidDistribution.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        aidType: { select: { name: true } },
        decision: { select: { application: { select: { household: { select: { nama_kepala_keluarga: true } } } } } },
      },
    });

    const applicationsByStatus = await prisma.aidApplication.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const dashboardExtras = {
      applicationsByStatus: applicationsByStatus.map((statusGroup) => ({
        status: statusGroup.status,
        count: statusGroup._count.status,
      })),
    };

    if (role === 'admin_main') {
      dashboardExtras.totalUsers = await prisma.user.count();
    }

    return successResponse(res, serializeBigInt({
      role,
      totalHouseholds,
      totalApplications,
      processingApplications,
      pendingApplications: processingApplications,
      approvedDecisions,
      rejectedDecisions,
      totalDistributions,
      openComplaints,
      pendingDocumentVerification,
      pendingSurveyReview,
      incompleteHouseholds,
      recentDistributions: recentDistributions.map(d => ({
        id: d.id, distribution_code: d.distribution_code, recipient_name: d.recipient_name,
        status: d.status, aid_type: d.aidType?.name,
        household_head: d.decision?.application?.household?.nama_kepala_keluarga,
        created_at: d.created_at,
      })),
      ...dashboardExtras,
    }), 'Dashboard statistics retrieved');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/audit-logs
 * Access: admin_main & pengawas → full access, admin_staff → limited (own actions only)
 */
router.get('/audit-logs', requireAnyPermission('AUDIT_LOG_FULL', 'AUDIT_LOG_LIMITED'), async (req, res, next) => {
  try {
    const { entity_type, action, user_id, date_from, date_to, page = 1, limit = 50 } = req.query;

    const where = {};

    // admin_staff: can only see their own audit entries
    if (req.user.role === 'admin_staff') {
      where.user_id = BigInt(req.user.id);
    }

    // Filters
    if (entity_type) where.entity_type = entity_type;
    if (action) where.action = action;
    if (user_id && req.user.role !== 'admin_staff') {
      where.user_id = BigInt(user_id);
    }
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    const pageTotal = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageTotal;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: pageTotal,
        skip,
        include: {
          user: { select: { name: true, role: true } }
        }
      }),
    ]);

    const result = logs.map(l => ({
      ...l,
      id: l.id.toString(),
      user_id: l.user_id ? l.user_id.toString() : null,
      entity_id: l.entity_id.toString()
    }));

    return successResponse(res, {
      records: result,
      meta: {
        total,
        page: parseInt(page),
        limit: pageTotal,
        totalPages: Math.ceil(total / pageTotal),
      },
    }, 'Audit logs retrieved');
  } catch (error) {
    next(error);
  }
});

module.exports = router;

