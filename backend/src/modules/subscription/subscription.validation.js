const { z } = require('zod');

const activateTrialSchema = z.object({
  body: z.object({
    planType: z.literal('STARTER_TRIAL'),
  }),
});

const selectPlanSchema = z.object({
  body: z.object({
    planType: z.enum(['ENTERPRISE_MONTHLY', 'CUSTOM_ENTERPRISE']),
  }),
});

module.exports = { activateTrialSchema, selectPlanSchema };
