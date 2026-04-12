const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/rbac.middleware');
const { successResponse } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');
const { buildPaginationMeta } = require('../utils/helpers');

router.use(authenticate);

/**
 * Helper: Serialize BigInt in objects
 */
function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (_, v) =>
    typeof v === 'bigint' ? v.toString() : v
  ));
}

// ═══════════════════════════════════════════════
// ECONOMIC CONDITIONS
// ═══════════════════════════════════════════════

/**
 * GET /api/v1/household-data/economic-conditions
 * List all economic conditions with household info
 */
router.get('/economic-conditions', requirePermission('HOUSEHOLD_LIST'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
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
      prisma.economicCondition.count({ where }),
      prisma.economicCondition.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { updated_at: 'desc' },
        include: {
          household: { select: { id: true, nomor_kk: true, nama_kepala_keluarga: true, alamat: true } },
          updatedByUser: { select: { name: true, role: true } },
        },
      }),
    ]);

    return successResponse(res, serializeBigInt({ records, meta: buildPaginationMeta(total, page, limit) }), 'Economic conditions retrieved');
  } catch (error) { next(error); }
});

/**
 * GET /api/v1/household-data/economic-conditions/:householdId
 */
router.get('/economic-conditions/:householdId', requirePermission('HOUSEHOLD_LIST'), async (req, res, next) => {
  try {
    const data = await prisma.economicCondition.findUnique({
      where: { household_id: BigInt(req.params.householdId) },
      include: {
        household: { select: { id: true, nomor_kk: true, nama_kepala_keluarga: true } },
        updatedByUser: { select: { name: true } },
      },
    });
    if (!data) throw { statusCode: 404, message: 'Data kondisi ekonomi tidak ditemukan' };
    return successResponse(res, serializeBigInt(data), 'Economic condition retrieved');
  } catch (error) { next(error); }
});

/**
 * PUT /api/v1/household-data/economic-conditions/:householdId
 */
router.put('/economic-conditions/:householdId', requirePermission('HOUSEHOLD_UPDATE'), async (req, res, next) => {
  try {
    const householdId = BigInt(req.params.householdId);
    const { monthly_income_total, income_source, head_job_status, monthly_basic_expense, dependents_count, has_other_income_source, debt_estimation, notes } = req.body;
    
    const data = await prisma.economicCondition.upsert({
      where: { household_id: householdId },
      create: { household_id: householdId, monthly_income_total, income_source, head_job_status, monthly_basic_expense, dependents_count, has_other_income_source, debt_estimation, notes, updated_by_user_id: BigInt(req.user.id) },
      update: { monthly_income_total, income_source, head_job_status, monthly_basic_expense, dependents_count, has_other_income_source, debt_estimation, notes, updated_by_user_id: BigInt(req.user.id) },
    });
    
    await logAudit({ userId: req.user.id, action: 'update', entityType: 'EconomicCondition', entityId: data.id, ipAddress: req.ip });
    return successResponse(res, serializeBigInt(data), 'Economic condition updated');
  } catch (error) { next(error); }
});

// ═══════════════════════════════════════════════
// HOUSING CONDITIONS
// ═══════════════════════════════════════════════

router.get('/housing-conditions', requirePermission('HOUSEHOLD_LIST'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) {
      where.household = { OR: [
        { nama_kepala_keluarga: { contains: search, mode: 'insensitive' } },
        { nomor_kk: { contains: search, mode: 'insensitive' } },
      ]};
    }

    const [total, records] = await Promise.all([
      prisma.housingCondition.count({ where }),
      prisma.housingCondition.findMany({
        where, skip, take: parseInt(limit), orderBy: { updated_at: 'desc' },
        include: {
          household: { select: { id: true, nomor_kk: true, nama_kepala_keluarga: true, alamat: true } },
          updatedByUser: { select: { name: true, role: true } },
        },
      }),
    ]);

    return successResponse(res, serializeBigInt({ records, meta: buildPaginationMeta(total, page, limit) }), 'Housing conditions retrieved');
  } catch (error) { next(error); }
});

router.get('/housing-conditions/:householdId', requirePermission('HOUSEHOLD_LIST'), async (req, res, next) => {
  try {
    const data = await prisma.housingCondition.findUnique({
      where: { household_id: BigInt(req.params.householdId) },
      include: {
        household: { select: { id: true, nomor_kk: true, nama_kepala_keluarga: true } },
        updatedByUser: { select: { name: true } },
      },
    });
    if (!data) throw { statusCode: 404, message: 'Data kondisi tempat tinggal tidak ditemukan' };
    return successResponse(res, serializeBigInt(data), 'Housing condition retrieved');
  } catch (error) { next(error); }
});

router.put('/housing-conditions/:householdId', requirePermission('HOUSEHOLD_UPDATE'), async (req, res, next) => {
  try {
    const householdId = BigInt(req.params.householdId);
    const { home_ownership_status, house_condition, floor_type, roof_type, wall_type, clean_water_access, electricity_access, sanitation_type, bedroom_count, notes } = req.body;
    
    const data = await prisma.housingCondition.upsert({
      where: { household_id: householdId },
      create: { household_id: householdId, home_ownership_status, house_condition, floor_type, roof_type, wall_type, clean_water_access, electricity_access, sanitation_type, bedroom_count, notes, updated_by_user_id: BigInt(req.user.id) },
      update: { home_ownership_status, house_condition, floor_type, roof_type, wall_type, clean_water_access, electricity_access, sanitation_type, bedroom_count, notes, updated_by_user_id: BigInt(req.user.id) },
    });
    
    await logAudit({ userId: req.user.id, action: 'update', entityType: 'HousingCondition', entityId: data.id, ipAddress: req.ip });
    return successResponse(res, serializeBigInt(data), 'Housing condition updated');
  } catch (error) { next(error); }
});

// ═══════════════════════════════════════════════
// HOUSEHOLD ASSETS
// ═══════════════════════════════════════════════

router.get('/assets', requirePermission('HOUSEHOLD_LIST'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) {
      where.household = { OR: [
        { nama_kepala_keluarga: { contains: search, mode: 'insensitive' } },
        { nomor_kk: { contains: search, mode: 'insensitive' } },
      ]};
    }

    const [total, records] = await Promise.all([
      prisma.householdAsset.count({ where }),
      prisma.householdAsset.findMany({
        where, skip, take: parseInt(limit), orderBy: { updated_at: 'desc' },
        include: {
          household: { select: { id: true, nomor_kk: true, nama_kepala_keluarga: true, alamat: true } },
          updatedByUser: { select: { name: true, role: true } },
        },
      }),
    ]);

    return successResponse(res, serializeBigInt({ records, meta: buildPaginationMeta(total, page, limit) }), 'Household assets retrieved');
  } catch (error) { next(error); }
});

router.get('/assets/:householdId', requirePermission('HOUSEHOLD_LIST'), async (req, res, next) => {
  try {
    const data = await prisma.householdAsset.findUnique({
      where: { household_id: BigInt(req.params.householdId) },
      include: {
        household: { select: { id: true, nomor_kk: true, nama_kepala_keluarga: true } },
        updatedByUser: { select: { name: true } },
      },
    });
    if (!data) throw { statusCode: 404, message: 'Data aset rumah tangga tidak ditemukan' };
    return successResponse(res, serializeBigInt(data), 'Household asset retrieved');
  } catch (error) { next(error); }
});

router.put('/assets/:householdId', requirePermission('HOUSEHOLD_UPDATE'), async (req, res, next) => {
  try {
    const householdId = BigInt(req.params.householdId);
    const { owns_house, has_bicycle, has_motorcycle, has_car, has_other_land, productive_assets, savings_range, other_assets } = req.body;
    
    const data = await prisma.householdAsset.upsert({
      where: { household_id: householdId },
      create: { household_id: householdId, owns_house, has_bicycle, has_motorcycle, has_car, has_other_land, productive_assets, savings_range, other_assets, updated_by_user_id: BigInt(req.user.id) },
      update: { owns_house, has_bicycle, has_motorcycle, has_car, has_other_land, productive_assets, savings_range, other_assets, updated_by_user_id: BigInt(req.user.id) },
    });
    
    await logAudit({ userId: req.user.id, action: 'update', entityType: 'HouseholdAsset', entityId: data.id, ipAddress: req.ip });
    return successResponse(res, serializeBigInt(data), 'Household asset updated');
  } catch (error) { next(error); }
});

// ═══════════════════════════════════════════════
// HOUSEHOLD VULNERABILITIES
// ═══════════════════════════════════════════════

router.get('/vulnerabilities', requirePermission('HOUSEHOLD_LIST'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) {
      where.household = { OR: [
        { nama_kepala_keluarga: { contains: search, mode: 'insensitive' } },
        { nomor_kk: { contains: search, mode: 'insensitive' } },
      ]};
    }

    const [total, records] = await Promise.all([
      prisma.householdVulnerability.count({ where }),
      prisma.householdVulnerability.findMany({
        where, skip, take: parseInt(limit), orderBy: { updated_at: 'desc' },
        include: {
          household: { select: { id: true, nomor_kk: true, nama_kepala_keluarga: true, alamat: true } },
          updatedByUser: { select: { name: true, role: true } },
        },
      }),
    ]);

    return successResponse(res, serializeBigInt({ records, meta: buildPaginationMeta(total, page, limit) }), 'Vulnerabilities retrieved');
  } catch (error) { next(error); }
});

router.get('/vulnerabilities/:householdId', requirePermission('HOUSEHOLD_LIST'), async (req, res, next) => {
  try {
    const data = await prisma.householdVulnerability.findUnique({
      where: { household_id: BigInt(req.params.householdId) },
      include: {
        household: { select: { id: true, nomor_kk: true, nama_kepala_keluarga: true } },
        updatedByUser: { select: { name: true } },
      },
    });
    if (!data) throw { statusCode: 404, message: 'Data kerentanan tidak ditemukan' };
    return successResponse(res, serializeBigInt(data), 'Vulnerability retrieved');
  } catch (error) { next(error); }
});

router.put('/vulnerabilities/:householdId', requirePermission('HOUSEHOLD_UPDATE'), async (req, res, next) => {
  try {
    const householdId = BigInt(req.params.householdId);
    const { is_disaster_victim, lost_job_recently, has_severe_ill_member, has_disabled_member, has_elderly_member, has_pregnant_member, has_school_children, ever_received_aid_before, special_condition_notes } = req.body;
    
    const data = await prisma.householdVulnerability.upsert({
      where: { household_id: householdId },
      create: { household_id: householdId, is_disaster_victim, lost_job_recently, has_severe_ill_member, has_disabled_member, has_elderly_member, has_pregnant_member, has_school_children, ever_received_aid_before, special_condition_notes, updated_by_user_id: BigInt(req.user.id) },
      update: { is_disaster_victim, lost_job_recently, has_severe_ill_member, has_disabled_member, has_elderly_member, has_pregnant_member, has_school_children, ever_received_aid_before, special_condition_notes, updated_by_user_id: BigInt(req.user.id) },
    });
    
    await logAudit({ userId: req.user.id, action: 'update', entityType: 'HouseholdVulnerability', entityId: data.id, ipAddress: req.ip });
    return successResponse(res, serializeBigInt(data), 'Vulnerability updated');
  } catch (error) { next(error); }
});

module.exports = router;
