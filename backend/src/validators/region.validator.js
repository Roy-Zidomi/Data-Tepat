const { z } = require('zod');

const createRegionSchema = z.object({
  province: z.string().min(1).max(100),
  city_regency: z.string().min(1).max(100),
  district: z.string().min(1).max(100),
  village: z.string().min(1).max(100),
  rt: z.string().max(10).optional().nullable(),
  rw: z.string().max(10).optional().nullable(),
  postal_code: z.string().max(10).optional().nullable(),
});

const updateRegionSchema = createRegionSchema.partial();

const regionParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

module.exports = {
  createRegionSchema,
  updateRegionSchema,
  regionParamsSchema,
};
