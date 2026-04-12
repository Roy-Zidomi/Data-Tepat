const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');
const { generateDistributionCode, buildPaginationMeta } = require('../utils/helpers');
const { DISTRIBUTION_TRANSITIONS } = require('../config/permissions');

class DistributionService {
  /**
   * List all distributions with pagination & filters
   */
  async listAll(query) {
    const { page = 1, limit = 20, status, aid_type_id, search } = query;
    const pageTotal = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageTotal;

    const where = {};
    if (status) where.status = status;
    if (aid_type_id) where.aid_type_id = BigInt(aid_type_id);
    if (search) {
      where.OR = [
        { recipient_name: { contains: search, mode: 'insensitive' } },
        { distribution_code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.aidDistribution.count({ where }),
      prisma.aidDistribution.findMany({
        where,
        take: pageTotal,
        skip,
        orderBy: { created_at: 'desc' },
        include: {
          aidType: { select: { code: true, name: true } },
          distributedByUser: { select: { name: true, role: true } },
          decision: {
            select: {
              decision_status: true,
              application: {
                select: {
                  application_no: true,
                  household: {
                    select: { nomor_kk: true, nama_kepala_keluarga: true }
                  }
                }
              }
            }
          },
          _count: { select: { proofs: true } },
        },
      }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Get single distribution by ID
   */
  async getById(id) {
    const dist = await prisma.aidDistribution.findUnique({
      where: { id: BigInt(id) },
      include: {
        aidType: true,
        distributedByUser: { select: { name: true, role: true } },
        decision: {
          include: {
            application: {
              include: {
                household: true,
              }
            }
          }
        },
        proofs: true,
        statusHistories: { orderBy: { changed_at: 'desc' } },
      },
    });

    if (!dist) throw { statusCode: 404, message: 'Distribution not found' };
    return dist;
  }

  /**
   * Create a new distribution record from an approved decision
   */
  async createDistribution(data, user) {
    const {
      beneficiary_decision_id,
      aid_type_id,
      planned_date,
      recipient_name,
      recipient_relation,
      delivery_location,
      quantity,
      unit,
      notes,
    } = data;

    // Verify decision exists and is approved
    const decision = await prisma.beneficiaryDecision.findUnique({
      where: { id: BigInt(beneficiary_decision_id) },
      include: { application: { include: { household: true } } },
    });

    if (!decision) {
      throw { statusCode: 404, message: 'Beneficiary decision not found' };
    }
    if (decision.decision_status !== 'approved') {
      throw { statusCode: 400, message: 'Can only create distribution for approved decisions' };
    }

    const distributionCode = generateDistributionCode();

    return prisma.$transaction(async (tx) => {
      const distribution = await tx.aidDistribution.create({
        data: {
          beneficiary_decision_id: BigInt(beneficiary_decision_id),
          aid_type_id: BigInt(aid_type_id),
          distribution_code: distributionCode,
          planned_date: planned_date ? new Date(planned_date) : null,
          recipient_name,
          recipient_relation: recipient_relation || null,
          delivery_location: delivery_location || null,
          distributed_by_user_id: BigInt(user.id),
          quantity: quantity || null,
          unit: unit || null,
          status: 'recorded',
          notes: notes || null,
        },
      });

      // Record initial status history
      await tx.distributionStatusHistory.create({
        data: {
          distribution_id: distribution.id,
          new_status: 'recorded',
          changed_by_user_id: BigInt(user.id),
          reason: 'Distribution record created',
        },
      });

      await logAudit({
        userId: user.id,
        action: 'create',
        entityType: 'AidDistribution',
        entityId: distribution.id,
        newValue: { distributionCode, recipient_name, quantity },
        reason: 'Created distribution record',
      });

      return distribution;
    });
  }

  /**
   * Update distribution status through the workflow
   */
  async updateStatus(id, newStatus, reason, user) {
    const distribution = await prisma.aidDistribution.findUnique({
      where: { id: BigInt(id) },
    });

    if (!distribution) {
      throw { statusCode: 404, message: 'Distribution not found' };
    }

    // Validate transition
    const transitionKey = `${distribution.status}→${newStatus}`;
    const allowedRoles = DISTRIBUTION_TRANSITIONS[transitionKey];

    if (!allowedRoles) {
      throw { statusCode: 400, message: `Invalid status transition: ${distribution.status} → ${newStatus}` };
    }

    if (!allowedRoles.includes(user.role)) {
      throw { statusCode: 403, message: `Role '${user.role}' cannot perform transition: ${transitionKey}` };
    }

    return prisma.$transaction(async (tx) => {
      const updateData = { status: newStatus };

      // If transitioning to delivered/completed, set distributed_date
      if (['delivered', 'completed'].includes(newStatus) && !distribution.distributed_date) {
        updateData.distributed_date = new Date();
      }

      const updated = await tx.aidDistribution.update({
        where: { id: BigInt(id) },
        data: updateData,
      });

      await tx.distributionStatusHistory.create({
        data: {
          distribution_id: updated.id,
          old_status: distribution.status,
          new_status: newStatus,
          changed_by_user_id: BigInt(user.id),
          reason: reason || `Status changed to ${newStatus}`,
        },
      });

      await logAudit({
        userId: user.id,
        action: 'distribute',
        entityType: 'AidDistribution',
        entityId: updated.id,
        oldValue: { status: distribution.status },
        newValue: { status: newStatus },
        reason: reason || `Distribution status: ${distribution.status} → ${newStatus}`,
      });

      return updated;
    });
  }

  /**
   * Upload proof of distribution
   */
  async uploadProof(distributionId, proofData, user) {
    const distribution = await prisma.aidDistribution.findUnique({
      where: { id: BigInt(distributionId) },
    });

    if (!distribution) {
      throw { statusCode: 404, message: 'Distribution not found' };
    }

    const proof = await prisma.distributionProof.create({
      data: {
        distribution_id: BigInt(distributionId),
        proof_type: proofData.proof_type,
        file_url: proofData.file_url,
        caption: proofData.caption || null,
        uploaded_by_user_id: BigInt(user.id),
      },
    });

    await logAudit({
      userId: user.id,
      action: 'create',
      entityType: 'DistributionProof',
      entityId: proof.id,
      reason: `Uploaded ${proofData.proof_type} proof for distribution ${distributionId}`,
    });

    return proof;
  }
}

module.exports = new DistributionService();
