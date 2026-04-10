const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');

class ComplaintService {
  async submitComplaint(data, userId) {
    const { household_id, application_id, distribution_id, complaint_type, description } = data;

    return prisma.$transaction(async (tx) => {
      const complaint = await tx.complaint.create({
        data: {
          household_id: BigInt(household_id),
          application_id: application_id ? BigInt(application_id) : null,
          distribution_id: distribution_id ? BigInt(distribution_id) : null,
          submitted_by_user_id: BigInt(userId),
          complaint_type,
          description,
          status: 'pending'
        }
      });

      await logAudit({
        userId,
        action: 'create',
        entityType: 'Complaint',
        entityId: complaint.id,
        reason: 'Submitted a new complaint'
      });

      return complaint;
    });
  }

  async getMyComplaints(userId) {
    return prisma.complaint.findMany({
      where: { submitted_by_user_id: BigInt(userId) },
      orderBy: { created_at: 'desc' },
      include: {
        application: {
          include: { aidType: true }
        }
      }
    });
  }
}

module.exports = new ComplaintService();
