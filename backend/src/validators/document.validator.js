const { z } = require('zod');

const DOCUMENT_TYPE_ALIASES = {
  ktp: 'ktp',
  kk: 'kk',
  sktm: 'sktm',
  photo_house: 'foto_rumah',
  photo_field: 'foto_lapangan',
  foto_rumah: 'foto_rumah',
  foto_lapangan: 'foto_lapangan',
  lainnya: 'lainnya',
};

const ALLOWED_DOCUMENT_TYPES = ['ktp', 'kk', 'sktm', 'foto_rumah', 'foto_lapangan', 'lainnya'];

const uploadDocumentSchema = z.object({
  household_id: z.coerce
    .string()
    .min(1, 'Household ID is required')
    .regex(/^\d+$/, 'Household ID must be numeric'),
  document_type: z
    .string()
    .min(1, 'Document type is required')
    .transform((value) => value.trim().toLowerCase())
    .transform((value) => DOCUMENT_TYPE_ALIASES[value] || value)
    .refine((value) => ALLOWED_DOCUMENT_TYPES.includes(value), {
      message: 'Invalid document type',
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
