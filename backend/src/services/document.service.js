const prisma = require('../config/database');
const { logAudit } = require('../utils/auditLogger');

class DocumentService {
  /**
   * Upload a new document and register it to a household
   */
  async uploadDocument(file, fileUrl, body, user) {
    const { household_id, document_type } = body;

    // Check household ownership
    const household = await prisma.household.findUnique({
      where: { id: BigInt(household_id) }
    });

    if (!household) {
      throw { statusCode: 404, message: 'Household not found' };
    }

    if (user.role === 'warga' && household.created_by_user_id.toString() !== user.id.toString()) {
      throw { statusCode: 403, message: 'Forbidden: You can only upload documents to your own household' };
    }

    return prisma.$transaction(async (tx) => {
      // 1. Create document record
      const document = await tx.document.create({
        data: {
          household_id: BigInt(household_id),
          document_type,
          file_url: fileUrl,
          original_filename: file.originalname,
          mime_type: file.mimetype,
          uploaded_by_user_id: BigInt(user.id)
        }
      });

      // 2. Auto-create pending verification record
      await tx.documentVerification.create({
        data: {
          document_id: document.id,
          status: 'pending'
        }
      });

      // 3. Log audit
      await logAudit({
        userId: user.id,
        action: 'create',
        entityType: 'Document',
        entityId: document.id,
        reason: `Uploaded ${document_type} file`
      });

      return document;
    });
  }

  async getMyDocuments(user) {
    return prisma.document.findMany({
      where: { household: { created_by_user_id: BigInt(user.id) } },
      include: {
        verifications: {
          orderBy: { verified_at: 'desc' },
          take: 1
        }
      },
      orderBy: { uploaded_at: 'desc' }
    });
  }

  async getDocumentsByHousehold(household_id, user) {
    const household = await prisma.household.findUnique({
      where: { id: BigInt(household_id) }
    });

    if (!household) {
      throw { statusCode: 404, message: 'Household not found' };
    }

    if (user.role === 'warga' && household.created_by_user_id.toString() !== user.id.toString()) {
      throw { statusCode: 403, message: 'Forbidden: You can only view documents of your own household' };
    }

    return prisma.document.findMany({
      where: { household_id: BigInt(household_id) },
      include: {
        verifications: {
          orderBy: { verified_at: 'desc' },
          take: 1
        }
      },
      orderBy: { uploaded_at: 'desc' }
    });
  }

  // Admin/Petugas can verify
  async verifyDocument(documentId, status, note, userId) {
    return prisma.$transaction(async (tx) => {
      const docVerify = await tx.documentVerification.create({
        data: {
          document_id: BigInt(documentId),
          status,
          verification_note: note,
          verified_by_user_id: BigInt(userId),
          verified_at: new Date()
        }
      });

      await logAudit({
        userId,
        action: 'update',
        entityType: 'DocumentVerification',
        entityId: docVerify.id,
        reason: `Marked document ${documentId} as ${status}`
      });

      return docVerify;
    });
  }
}

module.exports = new DocumentService();
