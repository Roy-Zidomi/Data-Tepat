const { z } = require('zod');

const createAidTypeSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(150),
  description: z.string().optional().nullable(),
  unit: z.string().max(50).optional().nullable(),
  is_active: z.boolean().optional(),
});

const updateAidTypeSchema = createAidTypeSchema.partial();

const aidTypeParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

module.exports = {
  createAidTypeSchema,
  updateAidTypeSchema,
  aidTypeParamsSchema,
};
