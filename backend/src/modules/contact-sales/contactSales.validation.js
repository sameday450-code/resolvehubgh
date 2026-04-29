const { z } = require('zod');

const submitContactSalesSchema = z.object({
  body: z.object({
    companyName: z.string().min(2).max(200),
    contactName: z.string().min(2).max(100),
    contactEmail: z.string().email(),
    contactPhone: z.string().min(6).max(30).optional(),
    country: z.string().min(2).max(100).optional(),
    industry: z.string().max(100).optional(),
    estimatedBranches: z.number().int().positive().optional(),
    estimatedUsers: z.number().int().positive().optional(),
    requirements: z.string().min(10).max(2000),
    sourcePlanType: z
      .enum(['STARTER_TRIAL', 'ENTERPRISE_MONTHLY', 'CUSTOM_ENTERPRISE'])
      .default('CUSTOM_ENTERPRISE'),
  }),
});

const updateContactSalesSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.string().optional(),
    adminNotes: z.string().max(2000).optional(),
  }),
});

module.exports = { submitContactSalesSchema, updateContactSalesSchema };
