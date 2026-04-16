const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');
const { APPLICATION_TRANSITIONS } = require('../config/permissions');

class BeneficiaryDecisionService {
  /**
   * List all decisions with pagination
   */
  async listAll(query) {
    const { page = 1, limit = 20, decision_status, aid_type_id } = query;
    const pageTotal = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageTotal;

    const where = {};
    if (decision_status) where.decision_status = decision_status;
    if (aid_type_id) where.approved_aid_type_id = BigInt(aid_type_id);

    const [total, data] = await Promise.all([
      prisma.beneficiaryDecision.count({ where }),
      prisma.beneficiaryDecision.findMany({
        where,
        take: pageTotal,
        skip,
        orderBy: { decided_at: 'desc' },
        include: {
          application: {
            include: {
              household: {
                select: {
                  id: true,
                  nomor_kk: true,
                  nama_kepala_keluarga: true,
                  alamat: true,
                }
              },
              aidType: { select: { code: true, name: true } },
              scoringResults: { orderBy: { scored_at: 'desc' }, take: 1 },
            }
          },
          approvedAidType: { select: { code: true, name: true } },
          decidedByUser: { select: { name: true, role: true } },
        }
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: parseInt(page),
        limit: pageTotal,
        totalPages: Math.ceil(total / pageTotal),
      },
    };
  }

  /**
   * Get single decision by ID
   */
  async getById(id) {
    const decision = await prisma.beneficiaryDecision.findUnique({
      where: { id: BigInt(id) },
      include: {
        application: {
          include: {
            household: true,
            aidType: true,
            scoringResults: { orderBy: { scored_at: 'desc' }, take: 1 },
            surveys: { orderBy: { survey_date: 'desc' }, take: 1 },
          }
        },
        approvedAidType: true,
        decidedByUser: { select: { name: true, role: true } },
        distributions: true,
      },
    });

    if (!decision) throw { statusCode: 404, message: 'Decision not found' };
    return decision;
  }

  /**
   * Create a beneficiary decision (approve / reject / waitlist)
   * Only admin_main can call this
   */
  async createDecision(data, adminUser) {
    const { application_id, decision_status, approved_aid_type_id, approved_amount, approved_note } = data;

    // Verify the application exists and is in admin_review status
    const application = await prisma.aidApplication.findUnique({
      where: { id: BigInt(application_id) },
      include: { scoringResults: { orderBy: { scored_at: 'desc' }, take: 1 } }
    });

    if (!application) {
      throw { statusCode: 404, message: 'Application not found' };
    }

    if (application.status !== 'admin_review') {
      throw { statusCode: 400, message: `Application must be in 'admin_review' status. Current: '${application.status}'` };
    }

    // Check if decision already exists
    const existingDecision = await prisma.beneficiaryDecision.findUnique({
      where: { application_id: BigInt(application_id) }
    });
    if (existingDecision) {
      throw { statusCode: 409, message: 'Decision already exists for this application' };
    }

    return prisma.$transaction(async (tx) => {
      // Create decision
      const decision = await tx.beneficiaryDecision.create({
        data: {
          application_id: BigInt(application_id),
          decision_status,
          approved_aid_type_id: approved_aid_type_id ? BigInt(approved_aid_type_id) : null,
          approved_amount: approved_amount || null,
          approved_note: approved_note || null,
          decided_by_user_id: BigInt(adminUser.id),
        },
      });

      // Update application status
      const newAppStatus = decision_status === 'approved' ? 'approved'
        : decision_status === 'rejected' ? 'rejected'
        : 'admin_review'; // waitlisted stays in admin_review

      await tx.aidApplication.update({
        where: { id: BigInt(application_id) },
        data: {
          status: newAppStatus,
          current_step_note: `Decision: ${decision_status}. ${approved_note || ''}`,
        },
      });

      // Record status history
      await tx.applicationStatusHistory.create({
        data: {
          application_id: BigInt(application_id),
          old_status: 'admin_review',
          new_status: newAppStatus,
          changed_by_user_id: BigInt(adminUser.id),
          reason: `Beneficiary decision: ${decision_status}`,
        },
      });

      // Audit
      await logAudit({
        userId: adminUser.id,
        action: decision_status === 'approved' ? 'approve' : 'reject',
        entityType: 'BeneficiaryDecision',
        entityId: decision.id,
        newValue: {
          application_id,
          decision_status,
          approved_amount,
        },
        reason: approved_note || `Decision: ${decision_status}`,
      });

      return decision;
    });
  }
}

module.exports = new BeneficiaryDecisionService();
