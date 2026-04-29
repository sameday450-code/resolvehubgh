/**
 * Billing Validation Schemas
 * Centralized Zod schemas for all payment and subscription endpoints
 */

const { z } = require('zod');

/**
 * Payment Checkout Validation
 */
const paymentCheckoutSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .int('Amount must be a whole number (in cents)')
    .describe('Payment amount in cents'),
  
  currency: z
    .enum(['NGN', 'USD', 'GHS', 'KES'])
    .optional()
    .default('NGN')
    .describe('Currency code'),
  
  planId: z
    .string()
    .min(1, 'Plan ID is required')
    .describe('Subscription plan ID'),
  
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .describe('Payer email address'),
  
  reference: z
    .string()
    .min(1, 'Reference is required')
    .optional()
    .describe('Unique transaction reference'),
});

/**
 * Payment Webhook Validation
 */
const paystackWebhookSchema = z.object({
  event: z
    .enum(['charge.success', 'charge.failed'])
    .describe('Paystack event type'),
  
  data: z.object({
    reference: z
      .string()
      .min(1, 'Transaction reference is required')
      .describe('Paystack transaction reference'),
    
    status: z
      .enum(['success', 'failed'])
      .describe('Payment status'),
    
    amount: z
      .number()
      .positive('Amount must be greater than 0')
      .describe('Amount in cents'),
    
    customer: z
      .object({
        email: z.string().email().optional(),
        customer_code: z.string().optional(),
      })
      .optional(),
  }),
});

const stripeWebhookSchema = z.object({
  type: z
    .enum(['checkout.session.completed', 'payment_intent.succeeded', 'invoice.payment_failed'])
    .describe('Stripe event type'),
  
  data: z.object({
    object: z.object({
      id: z.string().min(1, 'Session/Intent ID is required'),
      status: z.enum(['succeeded', 'failed', 'open']),
      amount: z.number().positive().optional(),
      customer_email: z.string().email().optional(),
      client_reference_id: z.string().optional(),
    }),
  }),
});

/**
 * Custom Plan Request Validation
 */
const customPlanRequestSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .describe('Company contact email'),
  
  companyName: z
    .string()
    .min(2, 'Company name is required')
    .max(100, 'Company name must be 100 characters or less')
    .describe('Company name'),
  
  contactPerson: z
    .string()
    .min(2, 'Contact person name is required')
    .max(100, 'Contact person name must be 100 characters or less')
    .describe('Primary contact person'),
  
  phone: z
    .string()
    .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/, 'Invalid phone number')
    .optional()
    .describe('Contact phone number'),
  
  requirements: z
    .string()
    .min(10, 'Requirements must be at least 10 characters')
    .max(2000, 'Requirements must be 2000 characters or less')
    .describe('Detailed plan requirements'),
  
  industry: z
    .enum(['RETAIL', 'F&B', 'SERVICES', 'HEALTH', 'EDUCATION', 'OTHER'])
    .optional()
    .describe('Industry classification'),
  
  expectedBudget: z
    .enum(['< 100k', '100k - 500k', '500k - 1M', '> 1M'])
    .optional()
    .describe('Expected monthly budget'),
});

/**
 * Subscription Update Validation
 */
const subscriptionUpdateSchema = z.object({
  status: z
    .enum(['ACTIVE', 'PENDING_PAYMENT', 'EXPIRED', 'CANCELLED', 'PAST_DUE', 'PENDING_ACTIVATION'])
    .describe('New subscription status'),
  
  planId: z
    .string()
    .optional()
    .describe('New plan ID for upgrade/downgrade'),
  
  reason: z
    .string()
    .optional()
    .describe('Reason for status change'),
});

/**
 * Enterprise Inquiry Update (Super Admin only)
 */
const enterpriseInquiryUpdateSchema = z.object({
  status: z
    .enum(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'NEGOTIATING'])
    .describe('Inquiry status'),
  
  internalNotes: z
    .string()
    .optional()
    .max(1000, 'Internal notes must be 1000 characters or less')
    .describe('Internal review notes'),
  
  proposedPlan: z
    .object({
      name: z.string().min(1).optional(),
      staffLimit: z.number().positive().optional(),
      branchLimit: z.number().positive().optional(),
      monthlyPrice: z.number().positive().optional(),
    })
    .optional()
    .describe('Proposed custom plan details'),
});

/**
 * Subscription Cancellation Validation
 */
const subscriptionCancellationSchema = z.object({
  reason: z
    .string()
    .min(5, 'Cancellation reason must be at least 5 characters')
    .max(500, 'Cancellation reason must be 500 characters or less')
    .optional()
    .describe('Reason for cancellation (helps with retention)'),
  
  immediate: z
    .boolean()
    .default(false)
    .describe('Cancel immediately vs. at period end'),
});

/**
 * Trial Extension Request (Super Admin only)
 */
const trialExtensionSchema = z.object({
  companyId: z
    .string()
    .min(1, 'Company ID is required')
    .describe('Company to extend trial for'),
  
  additionalDays: z
    .number()
    .positive('Additional days must be greater than 0')
    .int('Additional days must be a whole number')
    .max(90, 'Cannot extend trial by more than 90 days')
    .describe('Number of days to extend trial'),
  
  reason: z
    .string()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason must be 500 characters or less')
    .describe('Reason for extension (for audit trail)'),
});

/**
 * Transaction Listing Query Validation
 */
const transactionQuerySchema = z.object({
  page: z
    .number()
    .positive('Page must be greater than 0')
    .int('Page must be a whole number')
    .default(1)
    .optional(),
  
  limit: z
    .number()
    .positive('Limit must be greater than 0')
    .int('Limit must be a whole number')
    .max(100, 'Maximum limit is 100 items per page')
    .default(20)
    .optional(),
  
  status: z
    .enum(['PENDING', 'SUCCESS', 'FAILED'])
    .optional()
    .describe('Filter by transaction status'),
  
  gateway: z
    .enum(['PAYSTACK', 'STRIPE'])
    .optional()
    .describe('Filter by payment gateway'),
  
  startDate: z
    .string()
    .datetime()
    .optional()
    .describe('Filter transactions from this date'),
  
  endDate: z
    .string()
    .datetime()
    .optional()
    .describe('Filter transactions until this date'),
});

/**
 * Validation helper function
 * Returns { success, data, errors }
 */
const validate = (schema, data) => {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated,
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    }
    throw error;
  }
};

/**
 * Middleware for request validation
 * Usage: router.post('/endpoint', validateRequest(paymentCheckoutSchema), controller);
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = source === 'body' ? req.body : req.query;
    const validation = validate(schema, dataToValidate);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Replace request data with validated data
    if (source === 'body') {
      req.body = validation.data;
    } else {
      req.query = validation.data;
    }

    next();
  };
};

module.exports = {
  // Schemas
  paymentCheckoutSchema,
  paystackWebhookSchema,
  stripeWebhookSchema,
  customPlanRequestSchema,
  subscriptionUpdateSchema,
  enterpriseInquiryUpdateSchema,
  subscriptionCancellationSchema,
  trialExtensionSchema,
  transactionQuerySchema,
  
  // Functions
  validate,
  validateRequest,
};
