const { z } = require('zod');

const initPaymentSchema = z.object({
  body: z.object({
    gateway: z.enum(['PAYSTACK', 'STRIPE'], {
      errorMap: () => ({ message: 'Gateway must be PAYSTACK or STRIPE' }),
    }),
  }),
});

module.exports = { initPaymentSchema };
