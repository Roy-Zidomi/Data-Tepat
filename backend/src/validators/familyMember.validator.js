const { z } = require('zod');

const familyMemberParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
  householdId: z.string().regex(/^\d+$/, "Household ID must be a number").transform(Number).optional()
});

const createFamilyMemberSchema = z.object({
  household_id: z.number().int().positive(),
  nik: z.string().min(16).max(32).optional().nullable(),
  name: z.string().min(1).max(150),
  relationship_to_head: z.string().min(1).max(100),
  birth_date: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid date format").optional().nullable(),
  age: z.number().int().min(0).optional().nullable(),
  gender: z.enum(['laki_laki', 'perempuan']).optional().nullable(),
  education_level: z.string().max(100).optional().nullable(),
  occupation: z.string().max(100).optional().nullable(),
  is_married: z.boolean().optional().nullable(),
  is_lansia: z.boolean().optional(),
  is_disability: z.boolean().optional(),
  is_pregnant: z.boolean().optional(),
  is_student: z.boolean().optional(),
  has_chronic_illness: z.boolean().optional(),
  notes: z.string().optional().nullable()
});

const updateFamilyMemberSchema = createFamilyMemberSchema.partial();

module.exports = {
  createFamilyMemberSchema,
  updateFamilyMemberSchema,
  familyMemberParamsSchema,
};
