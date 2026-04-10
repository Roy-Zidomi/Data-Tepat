const { z } = require('zod');

const uploadDocumentSchema = z.object({
  household_id: z.string().min(1, 'Household ID is required'),
  document_type: z.enum(['ktp', 'kk', 'sktm', 'photo_house', 'photo_field'], {
    errorMap: () => ({ message: 'Invalid document type' })
  })
  // file validation is handled by multer
});

const verifyDocumentSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Invalid verification status' })
  }),
  note: z.string().optional()
});

module.exports = {
  uploadDocumentSchema,
  verifyDocumentSchema
};
