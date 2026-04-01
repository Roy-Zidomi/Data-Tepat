const { z } = require('zod');

const createApplicationSchema = z.object({
  household_id: z.number().int().positive(),
  aid_type_id: z.number().int().positive(),
  // application_no is generated automatically
});

const updateApplicationStatusSchema = z.object({
  status: z.enum([
    'draft', 'submitted', 'initial_validation', 'document_verification',
    'field_survey', 'scoring', 'admin_review', 'approved', 'rejected', 'cancelled'
  ]),
  current_step_note: z.string().optional().nullable(),
  reason: z.string().optional().nullable() // For audit log or history tracking
});

const applicationParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

module.exports = {
  createApplicationSchema,
  updateApplicationStatusSchema,
  applicationParamsSchema
};
