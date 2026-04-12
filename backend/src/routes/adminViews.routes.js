const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/rbac.middleware');
const { successResponse } = require('../utils/response');
const { buildPaginationMeta } = require('../utils/helpers');

router.use(authenticate);

function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (_, v) =>
    typeof v === 'bigint' ? v.toString() : v
  ));
}

// ═══════════════════════════════════════════════
// FAMILY MEMBERS — Admin list view
// ═══════════════════════════════════════════════

router.get('/family-members', requirePermission('HOUSEHOLD_LIST'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nik: { contains: search, mode: 'insensitive' } },
        { household: { nomor_kk: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [total, records] = await Promise.all([
      prisma.familyMember.count({ where }),
      prisma.familyMember.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' },
        include: {
          household: { select: { id: true, nomor_kk: true, nama_kepala_keluarga: true } },
        },
      }),
    ]);

    return successResponse(res, serializeBigInt({ records, meta: buildPaginationMeta(total, page, limit) }), 'Family members retrieved');
  } catch (error) { next(error); }
});

// ═══════════════════════════════════════════════
// DOCUMENT VERIFICATION — Admin list view
// ═══════════════════════════════════════════════

/**
 * GET /api/v1/admin-views/documents
 * List all documents with verification status for admin review
 */
router.get('/documents', requirePermission('DOCUMENT_VERIFY'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.household = {
        OR: [
          { nama_kepala_keluarga: { contains: search, mode: 'insensitive' } },
          { nomor_kk: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, records] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { uploaded_at: 'desc' },
        include: {
          household: { select: { id: true, nomor_kk: true, nama_kepala_keluarga: true } },
          uploadedByUser: { select: { name: true, role: true } },
          verifications: {
            orderBy: { verified_at: 'desc' },
            take: 1,
            include: {
              verifiedByUser: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    // Flatten latest verification
    const formatted = records.map(doc => ({
      ...doc,
      latestVerification: doc.verifications?.[0] || null,
    }));

    return successResponse(res, serializeBigInt({ records: formatted, meta: buildPaginationMeta(total, page, limit) }), 'Documents retrieved');
  } catch (error) { next(error); }
});

// ═══════════════════════════════════════════════
// SCORING RESULTS — Admin list view
// ═══════════════════════════════════════════════

/**
 * GET /api/v1/admin-views/scoring-results
 * List all scoring results with application and household info
 */
router.get('/scoring-results', requirePermission('DECISION_LIST'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, priority_level } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (priority_level) where.priority_level = priority_level;
    if (search) {
      where.application = {
        household: {
          OR: [
            { nama_kepala_keluarga: { contains: search, mode: 'insensitive' } },
            { nomor_kk: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    }

    const [total, records] = await Promise.all([
      prisma.scoringResult.count({ where }),
      prisma.scoringResult.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { total_score: 'desc' },
        include: {
          application: {
            select: {
              id: true,
              application_no: true,
              status: true,
              household: { select: { id: true, nomor_kk: true, nama_kepala_keluarga: true } },
              aidType: { select: { name: true, code: true } },
            },
          },
          scoredByUser: { select: { name: true } },
        },
      }),
    ]);

    return successResponse(res, serializeBigInt({ records, meta: buildPaginationMeta(total, page, limit) }), 'Scoring results retrieved');
  } catch (error) { next(error); }
});

/**
 * GET /api/v1/admin-views/survey-results
 * List all surveys with summary for admin view
 */
router.get('/survey-results', requirePermission('SURVEY_LIST'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.application = {
        household: {
          OR: [
            { nama_kepala_keluarga: { contains: search, mode: 'insensitive' } },
            { nomor_kk: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    }

    const [total, records] = await Promise.all([
      prisma.survey.count({ where }),
      prisma.survey.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { survey_date: 'desc' },
        include: {
          application: {
            select: {
              id: true,
              application_no: true,
              household: { select: { id: true, nama_kepala_keluarga: true, alamat: true } },
            },
          },
          surveyor: { select: { name: true } },
          _count: { select: { checklists: true, photos: true } },
        },
      }),
    ]);

    return successResponse(res, serializeBigInt({ records, meta: buildPaginationMeta(total, page, limit) }), 'Survey results retrieved');
  } catch (error) { next(error); }
});

// ═══════════════════════════════════════════════
// DISTRIBUTION PROOFS — Admin gallery view
// ═══════════════════════════════════════════════

router.get('/distribution-proofs', requirePermission('DISTRIBUTION_LIST'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.distribution = {
        OR: [
          { recipient_name: { contains: search, mode: 'insensitive' } },
          { distribution_code: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, records] = await Promise.all([
      prisma.distributionProof.count({ where }),
      prisma.distributionProof.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { uploaded_at: 'desc' },
        include: {
          distribution: {
            select: {
              id: true,
              distribution_code: true,
              recipient_name: true,
              status: true,
              aidType: { select: { name: true } },
            },
          },
          uploadedByUser: { select: { name: true } },
        },
      }),
    ]);

    return successResponse(res, serializeBigInt({ records, meta: buildPaginationMeta(total, page, limit) }), 'Distribution proofs retrieved');
  } catch (error) { next(error); }
});

// ═══════════════════════════════════════════════
// DISTRIBUTION HISTORY — Admin timeline view
// ═══════════════════════════════════════════════

router.get('/distribution-history', requirePermission('DISTRIBUTION_LIST'), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.distribution = {
        OR: [
          { recipient_name: { contains: search, mode: 'insensitive' } },
          { distribution_code: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, records] = await Promise.all([
      prisma.distributionStatusHistory.count({ where }),
      prisma.distributionStatusHistory.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { changed_at: 'desc' },
        include: {
          distribution: {
            select: {
              id: true,
              distribution_code: true,
              recipient_name: true,
              aidType: { select: { name: true } },
            },
          },
          changedByUser: { select: { name: true, role: true } },
        },
      }),
    ]);

    return successResponse(res, serializeBigInt({ records, meta: buildPaginationMeta(total, page, limit) }), 'Distribution history retrieved');
  } catch (error) { next(error); }
});

// ═══════════════════════════════════════════════
// USER ACTIVITY LOG — Per-user activity monitoring
// ═══════════════════════════════════════════════

router.get('/user-activity', requirePermission('AUDIT_LOG_FULL'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const userWhere = {};
    if (search) {
      userWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) userWhere.role = role;

    const [totalUsers, users] = await Promise.all([
      prisma.user.count({ where: userWhere }),
      prisma.user.findMany({
        where: userWhere,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          is_active: true,
          created_at: true,
        },
      }),
    ]);

    // Get recent audit log counts per user (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityCounts = await prisma.auditLog.groupBy({
      by: ['user_id'],
      where: {
        user_id: { in: users.map(u => u.id) },
        created_at: { gte: sevenDaysAgo },
      },
      _count: { id: true },
    });

    const countMap = {};
    activityCounts.forEach(a => { countMap[a.user_id.toString()] = a._count.id; });

    // Get latest action per user
    const latestActions = await Promise.all(
      users.map(u =>
        prisma.auditLog.findFirst({
          where: { user_id: u.id },
          orderBy: { created_at: 'desc' },
          select: { action: true, entity_type: true, created_at: true },
        })
      )
    );

    const records = users.map((u, i) => ({
      ...u,
      id: u.id.toString(),
      recent_activity_count: countMap[u.id.toString()] || 0,
      latest_action: latestActions[i],
    }));

    return successResponse(res, serializeBigInt({
      records,
      meta: buildPaginationMeta(totalUsers, page, limit),
    }), 'User activity retrieved');
  } catch (error) { next(error); }
});

module.exports = router;
