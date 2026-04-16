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
}

module.exports = new FamilyMemberService();
