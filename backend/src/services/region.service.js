const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');
const { buildPaginationMeta } = require('../utils/helpers');

class RegionService {
  async listAll(query) {
    const {
      page = 1,
      limit = 50,
      search,
      province,
      city_regency,
      district,
    } = query;

    const pageTotal = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageTotal;

    const where = {};
    if (search) {
      where.OR = [
        { province: { contains: search, mode: 'insensitive' } },
        { city_regency: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { village: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (province) where.province = { contains: province, mode: 'insensitive' };
    if (city_regency) where.city_regency = { contains: city_regency, mode: 'insensitive' };
    if (district) where.district = { contains: district, mode: 'insensitive' };

    const [total, data] = await Promise.all([
      prisma.region.count({ where }),
      prisma.region.findMany({
        where,
        take: pageTotal,
        skip,
        orderBy: { province: 'asc' },
      }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, limit) };
  }

  async getById(id) {
    const region = await prisma.region.findUnique({ where: { id: BigInt(id) } });
    if (!region) throw { statusCode: 404, message: 'Region not found' };
    return region;
  }

  async create(data, user) {
    const region = await prisma.region.create({ data });

    await logAudit({
      userId: user.id,
      action: 'create',
      entityType: 'Region',
      entityId: region.id,
      newValue: data,
      reason: 'Created region',
    });

    return region;
  }

  async update(id, data, user) {
    const existing = await this.getById(id);

    const updated = await prisma.region.update({
      where: { id: BigInt(id) },
      data,
    });

    await logAudit({
      userId: user.id,
      action: 'update',
      entityType: 'Region',
      entityId: updated.id,
      oldValue: existing,
      newValue: data,
      reason: 'Updated region',
    });

    return updated;
  }

  async delete(id, user) {
    const existing = await this.getById(id);

    // Check if any households reference this region
    const householdCount = await prisma.household.count({ where: { region_id: BigInt(id) } });
    if (householdCount > 0) {
      throw { statusCode: 400, message: `Cannot delete: ${householdCount} households still reference this region` };
    }

    await prisma.region.delete({ where: { id: BigInt(id) } });

    await logAudit({
      userId: user.id,
      action: 'delete',
      entityType: 'Region',
      entityId: id,
      oldValue: existing,
      reason: 'Deleted region',
    });

    return true;
  }
}

module.exports = new RegionService();
