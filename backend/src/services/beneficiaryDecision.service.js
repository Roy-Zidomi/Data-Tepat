const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');
const { APPLICATION_TRANSITIONS } = require('../config/permissions');

class BeneficiaryDecisionService {
  async hydrateDecisionMetadata(decisions) {
    if (!Array.isArray(decisions) || decisions.length === 0) return [];

    const ids = decisions.map((decision) => BigInt(decision.id));
    const logs = await prisma.auditLog.findMany({
      where: {
        entity_type: 'BeneficiaryDecision',
        entity_id: { in: ids },
      },
      orderBy: { created_at: 'asc' },
      select: {
        entity_id: true,
        action: true,
        new_value: true,
      },
    });

    const metadataMap = new Map();

    decisions.forEach((decision) => {
      metadataMap.set(decision.id.toString(), {
        reason_codes: [],
        reason_summary: '',
        evidence_items: [],
        latest_revision_no: 1,
        reported_to_main: false,
      });
    });

    logs.forEach((log) => {
      const key = log.entity_id.toString();
      const current = metadataMap.get(key) || {
        reason_codes: [],
        reason_summary: '',
        evidence_items: [],
        latest_revision_no: 1,
        reported_to_main: false,
      };
      const payload = log.new_value || {};

      if (Array.isArray(payload.reason_codes)) current.reason_codes = payload.reason_codes;
      if (typeof payload.reason_summary === 'string') current.reason_summary = payload.reason_summary;
      if (Array.isArray(payload.evidence_items)) current.evidence_items = payload.evidence_items;
      if (typeof payload.revision_no === 'number') current.latest_revision_no = payload.revision_no;
      if (payload.reported_to_main === true) current.reported_to_main = true;
      if (payload.reported_to_main === false) current.reported_to_main = false;

      metadataMap.set(key, current);
    });

    return decisions.map((decision) => ({
      ...decision,
      ...(metadataMap.get(decision.id.toString()) || {}),
    }));
  }

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

    const hydrated = await this.hydrateDecisionMetadata(data);

    return {
      data: hydrated,
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
    const [hydrated] = await this.hydrateDecisionMetadata([decision]);
    return hydrated;
  }

  /**
   * Create a beneficiary decision (approve / reject / waitlist)
   * Admin main and staff can call this
   */
  async createDecision(data, adminUser) {
    const {
      application_id,
      decision_status,
      approved_aid_type_id,
      approved_amount,
      approved_note,
      reason_codes = [],
      reason_summary = '',
      evidence_items = [],
    } = data;

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
          reason_codes,
          reason_summary,
          evidence_items,
          revision_no: 1,
          reported_to_main: false,
        },
        reason: approved_note || `Decision: ${decision_status}`,
      });

      return {
        ...decision,
        reason_codes,
        reason_summary,
        evidence_items,
        latest_revision_no: 1,
        reported_to_main: false,
      };
    });
  }

  async reviseDecision(id, data, user) {
    const decisionId = BigInt(id);
    const {
      decision_status,
      approved_aid_type_id,
      approved_amount,
      approved_note,
      reason_codes = [],
      reason_summary = '',
      evidence_items = [],
      revision_note,
    } = data;

    const existingDecision = await prisma.beneficiaryDecision.findUnique({
      where: { id: decisionId },
      include: {
        application: true,
      },
    });

    if (!existingDecision) {
      throw { statusCode: 404, message: 'Decision not found' };
    }

    const [hydratedDecision] = await this.hydrateDecisionMetadata([existingDecision]);
    const nextRevisionNo = (hydratedDecision?.latest_revision_no || 1) + 1;

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.beneficiaryDecision.update({
        where: { id: decisionId },
        data: {
          decision_status,
          approved_aid_type_id: approved_aid_type_id ? BigInt(approved_aid_type_id) : null,
          approved_amount: approved_amount || null,
          approved_note: approved_note || null,
          decided_by_user_id: BigInt(user.id),
          decided_at: new Date(),
        },
      });

      const newAppStatus = decision_status === 'approved'
        ? 'approved'
        : decision_status === 'rejected'
          ? 'rejected'
          : 'admin_review';

      await tx.aidApplication.update({
        where: { id: existingDecision.application_id },
        data: {
          status: newAppStatus,
          current_step_note: `Revisi keputusan: ${decision_status}. ${approved_note || revision_note || ''}`,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          application_id: existingDecision.application_id,
          old_status: existingDecision.application?.status || null,
          new_status: newAppStatus,
          changed_by_user_id: BigInt(user.id),
          reason: revision_note || `Revision decision: ${decision_status}`,
        },
      });

      return result;
    });

    await logAudit({
      userId: user.id,
      action: 'update',
      entityType: 'BeneficiaryDecision',
      entityId: updated.id,
      oldValue: {
        decision_status: existingDecision.decision_status,
        approved_amount: existingDecision.approved_amount,
      },
      newValue: {
        decision_status,
        approved_amount,
        approved_note,
        reason_codes,
        reason_summary,
        evidence_items,
        revision_no: nextRevisionNo,
        reported_to_main: false,
      },
      reason: revision_note || 'Decision revised by staff',
    });

    const [hydrated] = await this.hydrateDecisionMetadata([updated]);
    return hydrated;
  }

  async reportToMain(id, user) {
    const decisionId = BigInt(id);
    const decision = await prisma.beneficiaryDecision.findUnique({
      where: { id: decisionId },
    });

    if (!decision) {
      throw { statusCode: 404, message: 'Decision not found' };
    }

    if (decision.decision_status !== 'approved') {
      throw { statusCode: 400, message: 'Only approved decisions can be reported to admin utama' };
    }

    await logAudit({
      userId: user.id,
      action: 'report',
      entityType: 'BeneficiaryDecision',
      entityId: decision.id,
      newValue: {
        reported_to_main: true,
      },
      reason: 'Decision reported to admin utama',
    });

    return {
      id: decision.id,
      reported_to_main: true,
    };
  }
}

module.exports = new BeneficiaryDecisionService();
