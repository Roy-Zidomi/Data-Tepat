const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');
const { buildPaginationMeta, buildPrismaSort } = require('../utils/helpers');

class HouseholdService {
  async getAll(query, user) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      region_id, 
      status_data,
      sort_by = 'created_at',
      sort_dir = 'desc'
    } = query;

    const pageTotal = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageTotal;

    // Base conditions
    const where = {};
    if (search) {
      where.OR = [
        { nomor_kk: { contains: search, mode: 'insensitive' } },
        { nama_kepala_keluarga: { contains: search, mode: 'insensitive' } },
        { nik_kepala_keluarga: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (region_id) where.region_id = BigInt(region_id);
    if (status_data) where.status_data = status_data;

    // RBAC logic for fetching
    if (user.role === 'warga') {
      where.created_by_user_id = BigInt(user.id);
    }

    const [total, data] = await Promise.all([
      prisma.household.count({ where }),
      prisma.household.findMany({
        where,
        take: pageTotal,
        skip,
        orderBy: { [sort_by]: sort_dir },
        include: {
          region: true,
          economicCondition: true,
          housingCondition: true,
          _count: { select: { familyMembers: true, documents: true, aidApplications: true } }
        }
      })
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, page, limit)
    };
  }

  async getById(id, user) {
    const where = { id: BigInt(id) };
    if (user.role === 'warga') {
      where.created_by_user_id = BigInt(user.id);
    }

    const household = await prisma.household.findFirst({
      where,
      include: {
        region: true,
        familyMembers: true,
        economicCondition: true,
        housingCondition: true,
        householdAsset: true,
        vulnerability: true,
        documents: true,
        aidApplications: { include: { aidType: true } }
      }
    });

    if (!household) {
      throw { statusCode: 404, message: 'Household not found or unauthorized' };
    }

    return household;
  }

  async create(payload, user) {
    const data = {
      ...payload,
      region_id: BigInt(payload.region_id),
      created_by_user_id: BigInt(user.id),
      registered_by_role: user.role
    };

    const household = await prisma.household.create({ data });

    await logAudit({
      userId: user.id,
      action: 'create',
      entityType: 'Household',
      entityId: household.id,
      newValue: data
    });

    return household;
  }

  async update(id, payload, user) {
    // Check access
    await this.getById(id, user); 
    
    // Convert BigInt params if any
    const dataToUpdate = { ...payload };
    if (dataToUpdate.region_id) {
       dataToUpdate.region_id = BigInt(dataToUpdate.region_id);
    }

    const updated = await prisma.household.update({
      where: { id: BigInt(id) },
      data: dataToUpdate
    });

    await logAudit({
      userId: user.id,
      action: 'update',
      entityType: 'Household',
      entityId: updated.id,
      newValue: dataToUpdate
    });

    return updated;
  }

  async delete(id, user) {
    if (!['admin', 'petugas'].includes(user.role)) {
       throw { statusCode: 403, message: 'Only admin or petugas can delete households' };
    }
    
    const deleted = await prisma.household.delete({
      where: { id: BigInt(id) }
    });

    await logAudit({
      userId: user.id,
      action: 'delete',
      entityType: 'Household',
      entityId: id,
      oldValue: deleted
    });

    return true;
  }
}

module.exports = new HouseholdService();
