const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters').max(200),
    email: z.string().email('Invalid email address'),
    adminFullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    adminPhone: z.string().min(6, 'Phone number is too short').max(20),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    industry: z.string().optional(),
    country: z.string().min(2).default('Ghana'),
    city: z.string().optional(),
    address: z.string().optional(),
    branchCount: z.number().int().min(1).default(1),
    planType: z.enum(['STARTER_TRIAL', 'ENTERPRISE_MONTHLY', 'CUSTOM_ENTERPRISE']).optional(),
    // Enterprise billing fields (required when planType = ENTERPRISE_MONTHLY)
    billingName: z.string().min(2).max(100).optional(),
    billingEmail: z.string().email().optional(),
    billingPhone: z.string().min(6).max(20).optional(),
    billingCountry: z.string().min(2).optional(),
    billingAddress: z.string().min(5).optional(),
    gateway: z.enum(['PAYSTACK', 'STRIPE']).optional(),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the terms' }),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

const superAdminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const googleAuthSchema = z.object({
  body: z.object({
    accessToken: z.string().min(1, 'Google access token is required'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  superAdminLoginSchema,
  googleAuthSchema,
};
