const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');
const scoringService = require('./scoring.service');
const { APPLICATION_TRANSITIONS } = require('../config/permissions');
const { buildPaginationMeta } = require('../utils/helpers');
const { assertHouseholdAccess, toBigIntId } = require('../utils/householdAccess');

class AidApplicationService {
  async createApplication(data, user) {
    const { household_id, aid_type_id, description } = data;
    const userId = user.id;

    const household = await assertHouseholdAccess(user, household_id, {
      allowedWideRoles: ['admin_main', 'admin_staff'],
      forbiddenMessage: 'Forbidden: You can only create applications for your own household',
    });

    // Check Aid Type
    const aidType = await prisma.aidType.findUnique({
      where: { id: BigInt(aid_type_id) }
    });
    if (!aidType) throw { statusCode: 404, message: 'Aid type not found' };

    // Generate unique app no
    const applicationNo = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return prisma.$transaction(async (tx) => {
      const application = await tx.aidApplication.create({
        data: {
          household_id: household.id,
          aid_type_id: BigInt(aid_type_id),
          application_no: applicationNo,
          submitted_by_user_id: BigInt(userId),
          status: 'draft',
          current_step_note: description || 'Draft created'
        }
      });

      await tx.applicationStatusHistory.create({
        data: {
          application_id: application.id,
          new_status: 'draft',
          changed_by_user_id: BigInt(userId),
          reason: 'Initial creation'
        }
      });

      await logAudit({
        userId,
        action: 'create',
        entityType: 'AidApplication',
        entityId: application.id,
        reason: 'Created draft aid application'
      });

      return application;
    });
  }

  async submitApplication(applicationId, user) {
    const userId = user.id;
    const appId = toBigIntId(applicationId, 'Application ID');
    const application = await prisma.aidApplication.findUnique({
      where: { id: appId }
    });

    if (!application) throw { statusCode: 404, message: 'Application not found' };
    await assertHouseholdAccess(user, application.household_id, {
      allowedWideRoles: ['admin_main', 'admin_staff'],
      forbiddenMessage: 'Forbidden: You can only submit applications for your own household',
    });

    if (application.status !== 'draft') {
      throw { statusCode: 400, message: 'Only draft applications can be submitted' };
    }

    return prisma.$transaction(async (tx) => {
      const updatedApp = await tx.aidApplication.update({
        where: { id: appId },
        data: { 
          status: 'submitted',
          submission_date: new Date(),
          current_step_note: 'Submitted by user, waiting for review' 
        }
      });

      await tx.applicationStatusHistory.create({
        data: {
          application_id: updatedApp.id,
          old_status: 'draft',
          new_status: 'submitted',
          changed_by_user_id: BigInt(userId),
          reason: 'User submitted the application'
        }
      });

      await logAudit({
        userId,
        action: 'update',
        entityType: 'AidApplication',
        entityId: updatedApp.id,
        reason: 'Submitted application for processing'
      });

      // Synchronous Scoring
      await scoringService.calculateScore(application.household_id, updatedApp.id, userId);

      return updatedApp;
    });
  }

  async getMyApplications(userId) {
    return prisma.aidApplication.findMany({
      where: { submitted_by_user_id: BigInt(userId) },
      include: {
        aidType: true,
        household: {
          select: {
            nama_kepala_keluarga: true,
            nomor_kk: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  /**
   * Get all applications (admin view) with filters and pagination
   */
  async getAll(query) {
    const {
      page = 1,
      limit = 20,
      status,
      aid_type_id,
      search,
      sort_by = 'created_at',
      sort_dir = 'desc',
    } = query;

    const pageTotal = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageTotal;

    const where = {};
    if (status) where.status = status;
    if (aid_type_id) where.aid_type_id = BigInt(aid_type_id);
    if (search) {
      where.OR = [
        { application_no: { contains: search, mode: 'insensitive' } },
        { household: { nama_kepala_keluarga: { contains: search, mode: 'insensitive' } } },
        { household: { nomor_kk: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.aidApplication.count({ where }),
      prisma.aidApplication.findMany({
        where,
        take: pageTotal,
        skip,
        orderBy: { [sort_by]: sort_dir },
        include: {
          aidType: { select: { code: true, name: true } },
          household: {
            select: { nomor_kk: true, nama_kepala_keluarga: true, alamat: true }
          },
          submittedByUser: { select: { name: true, role: true } },
          scoringResults: { orderBy: { scored_at: 'desc' }, take: 1 },
          beneficiaryDecision: { select: { decision_status: true } },
        },
      }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, limit) };
  }

  async getApplicationById(id, user) {
    const applicationId = toBigIntId(id, 'Application ID');
    const application = await prisma.aidApplication.findUnique({
      where: { id: applicationId },
      include: {
        statusHistories: { orderBy: { changed_at: 'desc' } },
        aidType: true,
        household: {
          include: {
            documents: true,
            familyMembers: true,
            economicCondition: true,
            housingCondition: true,
            householdAsset: true,
            vulnerability: true,
          }
        },
        scoringResults: { orderBy: { scored_at: 'desc' } },
        surveys: { orderBy: { survey_date: 'desc' } },
        beneficiaryDecision: true,
        duplicateChecks: true,
      }
    });

    if (!application) throw { statusCode: 404, message: 'Application not found' };
    await assertHouseholdAccess(user, application.household_id, {
      allowedWideRoles: ['admin_main', 'admin_staff', 'pengawas'],
      forbiddenMessage: 'Forbidden: You can only view applications for your own household',
    });

    return application;
  }

  /**
   * Update application status through the workflow.
   * Validates state transitions using APPLICATION_TRANSITIONS.
   */
  async updateStatus(applicationId, newStatus, reason, user) {
    const appId = toBigIntId(applicationId, 'Application ID');
    const application = await prisma.aidApplication.findUnique({
      where: { id: appId },
    });

    if (!application) {
      throw { statusCode: 404, message: 'Application not found' };
    }

    const transitionKey = `${application.status}→${newStatus}`;
    const allowedRoles = APPLICATION_TRANSITIONS[transitionKey];

    if (!allowedRoles) {
      throw {
        statusCode: 400,
        message: `Invalid status transition: '${application.status}' → '${newStatus}'`,
      };
    }

    if (!allowedRoles.includes(user.role)) {
      throw {
        statusCode: 403,
        message: `Role '${user.role}' cannot perform transition: ${transitionKey}`,
      };
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.aidApplication.update({
        where: { id: appId },
        data: {
          status: newStatus,
          current_step_note: reason || `Status changed to ${newStatus}`,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          application_id: appId,
          old_status: application.status,
          new_status: newStatus,
          changed_by_user_id: BigInt(user.id),
          reason: reason || `Status transition: ${application.status} → ${newStatus}`,
        },
      });

      await logAudit({
        userId: user.id,
        action: 'update',
        entityType: 'AidApplication',
        entityId: updated.id,
        oldValue: { status: application.status },
        newValue: { status: newStatus },
        reason: reason || `Application workflow: ${application.status} → ${newStatus}`,
      });

      return updated;
    });
  }
}

module.exports = new AidApplicationService();
