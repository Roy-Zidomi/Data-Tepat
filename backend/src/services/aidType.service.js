const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');
const { buildPaginationMeta } = require('../utils/helpers');

class AidTypeService {
  async listAll(query) {
    const { page = 1, limit = 50, search, is_active } = query;
    const pageTotal = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageTotal;

    const where = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const [total, data] = await Promise.all([
      prisma.aidType.count({ where }),
      prisma.aidType.findMany({ where, take: pageTotal, skip, orderBy: { code: 'asc' } }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, limit) };
  }

  async getById(id) {
    const aidType = await prisma.aidType.findUnique({ where: { id: BigInt(id) } });
    if (!aidType) throw { statusCode: 404, message: 'Aid type not found' };
    return aidType;
  }

  async create(data, user) {
    const aidType = await prisma.aidType.create({ data });

    await logAudit({
      userId: user.id,
      action: 'create',
      entityType: 'AidType',
      entityId: aidType.id,
      newValue: data,
      reason: 'Created aid type',
    });

    return aidType;
  }

  async update(id, data, user) {
    const existing = await this.getById(id);

    const updated = await prisma.aidType.update({ where: { id: BigInt(id) }, data });

    await logAudit({
      userId: user.id,
      action: 'update',
      entityType: 'AidType',
      entityId: updated.id,
      oldValue: existing,
      newValue: data,
      reason: 'Updated aid type',
    });

    return updated;
  }

  async delete(id, user) {
    const existing = await this.getById(id);

    // Check if any applications reference this aid type
    const appCount = await prisma.aidApplication.count({ where: { aid_type_id: BigInt(id) } });
    if (appCount > 0) {
      throw { statusCode: 400, message: `Cannot delete: ${appCount} applications reference this aid type` };
    }

    await prisma.aidType.delete({ where: { id: BigInt(id) } });

    await logAudit({
      userId: user.id,
      action: 'delete',
      entityType: 'AidType',
      entityId: id,
      oldValue: existing,
      reason: 'Deleted aid type',
    });

    return true;
  }
}

module.exports = new AidTypeService();
