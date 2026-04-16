const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');
const householdService = require('./household.service');

class FamilyMemberService {
  async addMembers(householdId, membersPayload, user) {
    // Verify household exists and user has access
    await householdService.getById(householdId, user);

    const createdMembers = await Promise.all(
      membersPayload.map(member =>
        prisma.familyMember.create({
          data: {
            ...member,
            household_id: BigInt(householdId),
            birth_date: member.birth_date ? new Date(member.birth_date) : null
          }
        })
      )
    );

    // Audit log
    await logAudit({
      userId: user.id,
      action: 'create',
      entityType: 'FamilyMembers',
      entityId: householdId,
      newValue: { count: createdMembers.length },
      reason: 'Added family members to household'
    });

    return createdMembers;
  }

  async updateMember(householdId, memberId, payload, user) {
    // Verify household access
    await householdService.getById(householdId, user);

    // Verify member belongs to household
    const existing = await prisma.familyMember.findFirst({
      where: { id: BigInt(memberId), household_id: BigInt(householdId) }
    });
    if (!existing) {
      throw { statusCode: 404, message: 'Anggota keluarga tidak ditemukan' };
    }

    const updated = await prisma.familyMember.update({
      where: { id: BigInt(memberId) },
      data: {
        ...payload,
        birth_date: payload.birth_date ? new Date(payload.birth_date) : existing.birth_date,
      }
    });

    await logAudit({
      userId: user.id,
      action: 'update',
      entityType: 'FamilyMember',
      entityId: memberId,
      newValue: payload,
      reason: 'Updated family member data'
    });

    return updated;
  }

  async deleteMember(householdId, memberId, user) {
    // Verify household access
    await householdService.getById(householdId, user);

    // Verify member belongs to household
    const existing = await prisma.familyMember.findFirst({
      where: { id: BigInt(memberId), household_id: BigInt(householdId) }
    });
    if (!existing) {
      throw { statusCode: 404, message: 'Anggota keluarga tidak ditemukan' };
    }

    await prisma.familyMember.delete({ where: { id: BigInt(memberId) } });

    await logAudit({
      userId: user.id,
      action: 'delete',
      entityType: 'FamilyMember',
      entityId: memberId,
      reason: 'Deleted family member from household'
    });

    return true;
  }
}

module.exports = new FamilyMemberService();

