const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');
const { buildPaginationMeta } = require('../utils/helpers');
const { assertHouseholdAccess, toBigIntId } = require('../utils/householdAccess');

class ComplaintService {
  async submitComplaint(data, user) {
    const { household_id, application_id, distribution_id, complaint_type, description } = data;
    const userId = user.id;
    const applicationId = application_id ? toBigIntId(application_id, 'Application ID') : null;
    const distributionId = distribution_id ? toBigIntId(distribution_id, 'Distribution ID') : null;
    const household = await assertHouseholdAccess(user, household_id, {
      allowedWideRoles: ['pengawas'],
      forbiddenMessage: 'Forbidden: You can only submit complaints for your own household',
    });

    if (applicationId) {
      const application = await prisma.aidApplication.findUnique({
        where: { id: applicationId },
        select: { household_id: true },
      });

      if (!application) {
        throw { statusCode: 404, message: 'Application not found' };
      }

      if (application.household_id.toString() !== household.id.toString()) {
        throw { statusCode: 400, message: 'Application does not belong to the selected household' };
      }
    }

    if (distributionId) {
      const distribution = await prisma.aidDistribution.findUnique({
        where: { id: distributionId },
        select: {
          decision: {
            select: {
              application: {
                select: { household_id: true },
              },
            },
          },
        },
      });

      if (!distribution) {
        throw { statusCode: 404, message: 'Distribution not found' };
      }

      const distributionHouseholdId = distribution.decision?.application?.household_id;
      if (!distributionHouseholdId || distributionHouseholdId.toString() !== household.id.toString()) {
        throw { statusCode: 400, message: 'Distribution does not belong to the selected household' };
      }
    }

    return prisma.$transaction(async (tx) => {
      const complaint = await tx.complaint.create({
        data: {
          household_id: household.id,
          application_id: applicationId,
          distribution_id: distributionId,
          submitted_by_user_id: BigInt(userId),
          complaint_type,
          description,
          status: 'open'
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
        household: { select: { nama_kepala_keluarga: true, nomor_kk: true } },
        application: {
          include: { aidType: true }
        }
      }
    });
  }

  /**
   * List all complaints (admin view)
   */
  async getAllComplaints(query) {
    const { page = 1, limit = 20, status, complaint_type, search } = query;
    const pageTotal = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageTotal;

    const where = {};
    if (status) where.status = status;
    if (complaint_type) where.complaint_type = complaint_type;
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { household: { nama_kepala_keluarga: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
        where,
        take: pageTotal,
        skip,
        orderBy: { created_at: 'desc' },
        include: {
          household: { select: { nomor_kk: true, nama_kepala_keluarga: true } },
          submittedByUser: { select: { name: true, role: true } },
          resolvedByUser: { select: { name: true, role: true } },
          application: { select: { application_no: true, aidType: { select: { name: true } } } },
        },
      }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Get complaint by ID
   */
  async getById(id) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: BigInt(id) },
      include: {
        household: true,
        submittedByUser: { select: { name: true, role: true, phone: true } },
        resolvedByUser: { select: { name: true, role: true } },
        application: { include: { aidType: true } },
        distribution: true,
      },
    });

    if (!complaint) throw { statusCode: 404, message: 'Complaint not found' };
    return complaint;
  }

  /**
   * Resolve or reject a complaint (admin_main only)
   */
  async resolveComplaint(id, data, adminUser) {
    const { status, resolution_note } = data;

    if (!['resolved', 'rejected'].includes(status)) {
      throw { statusCode: 400, message: "Status must be 'resolved' or 'rejected'" };
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: BigInt(id) },
    });

    if (!complaint) {
      throw { statusCode: 404, message: 'Complaint not found' };
    }

    if (['resolved', 'rejected'].includes(complaint.status)) {
      throw { statusCode: 400, message: 'Complaint is already resolved or rejected' };
    }

    const updated = await prisma.complaint.update({
      where: { id: BigInt(id) },
      data: {
        status,
        resolution_note: resolution_note || null,
        resolved_by_user_id: BigInt(adminUser.id),
        resolved_at: new Date(),
      },
    });

    await logAudit({
      userId: adminUser.id,
      action: status === 'resolved' ? 'approve' : 'reject',
      entityType: 'Complaint',
      entityId: updated.id,
      oldValue: { status: complaint.status },
      newValue: { status, resolution_note },
      reason: `Complaint ${status}: ${resolution_note || 'No note'}`,
    });

    return updated;
  }
}

module.exports = new ComplaintService();

