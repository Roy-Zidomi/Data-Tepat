const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');
const scoringService = require('./scoring.service'); 

class AidApplicationService {
  async createApplication(data, userId) {
    const { household_id, aid_type_id, description } = data;

    // Check household
    const household = await prisma.household.findUnique({
      where: { id: BigInt(household_id) }
    });
    if (!household) throw { statusCode: 404, message: 'Household not found' };

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
          household_id: BigInt(household_id),
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

  async submitApplication(applicationId, userId) {
    const application = await prisma.aidApplication.findUnique({
      where: { id: BigInt(applicationId) }
    });

    if (!application) throw { statusCode: 404, message: 'Application not found' };
    if (application.status !== 'draft') {
      throw { statusCode: 400, message: 'Only draft applications can be submitted' };
    }

    return prisma.$transaction(async (tx) => {
      const updatedApp = await tx.aidApplication.update({
        where: { id: BigInt(applicationId) },
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

  async getApplicationById(id) {
    const application = await prisma.aidApplication.findUnique({
      where: { id: BigInt(id) },
      include: {
        statusHistories: { orderBy: { changed_at: 'desc' } },
        aidType: true,
        household: {
          include: { documents: true, familyMembers: true }
        },
        scoringResults: true
      }
    });

    if (!application) throw { statusCode: 404, message: 'Application not found' };
    return application;
  }
}

module.exports = new AidApplicationService();
