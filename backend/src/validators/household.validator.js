const { z } = require('zod');

const createHouseholdSchema = z.object({
  nomor_kk: z.string().min(16).max(32),
  nama_kepala_keluarga: z.string().min(1).max(150),
  nik_kepala_keluarga: z.string().min(16).max(32).optional().nullable(),
  alamat: z.string().min(1),
  region_id: z.number().int().positive(),
  phone: z.string().max(30).optional().nullable(),
  registration_source: z.enum(['self', 'assisted']),
  // registered_by_role is automatically inferred from auth token
});

const updateHouseholdSchema = createHouseholdSchema.partial();

const householdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

module.exports = {
  createHouseholdSchema,
  updateHouseholdSchema,
  householdParamsSchema,
};
