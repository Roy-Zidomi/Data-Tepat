const { z } = require('zod');

const submitComplaintSchema = z.object({
  household_id: z.string().min(1, 'Household ID is required'),
  application_id: z.string().optional(),
  distribution_id: z.string().optional(),
  complaint_type: z.enum(['application', 'distribution', 'general'], {
    errorMap: () => ({ message: 'Invalid complaint type' })
  }),
  description: z.string().min(10, 'Description must be at least 10 characters')
});

module.exports = {
  submitComplaintSchema
};
