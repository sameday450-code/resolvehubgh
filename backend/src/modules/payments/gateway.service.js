const { v4: uuidv4 } = require('uuid');
const config = require('../../config');
const { BadRequestError } = require('../../utils/errors');

/**
 * Initialize a Paystack transaction.
 * Returns { checkoutUrl, providerReference }
 *
 * Paystack amounts are in the smallest currency unit (kobo for NGN, pesewas for GHS).
 * Plan price is stored in GHS; multiply by 100 to get pesewas.
 */
const initializePaystack = async ({ email, amountGHS, reference, metadata, callbackUrl }) => {
  const secretKey = config.paystack?.secretKey;
  if (!secretKey) {
    throw new BadRequestError('Paystack is not configured. Please contact support.');
  }

  const body = JSON.stringify({
    email,
    amount: Math.round(amountGHS * 100), // pesewas
    currency: 'GHS',
    reference: reference || `PS-${uuidv4()}`,
    callback_url: callbackUrl || `${config.frontendUrl}/payment/callback?gateway=paystack`,
    metadata: metadata || {},
  });

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body,
  });

  const result = await response.json();

  if (!result.status) {
    throw new BadRequestError(`Paystack initialization failed: ${result.message}`);
  }

  return {
    checkoutUrl: result.data.authorization_url,
    providerReference: result.data.reference,
    accessCode: result.data.access_code,
  };
};

/**
 * Verify a completed Paystack transaction by reference.
 * Returns { success, data }
 */
const verifyPaystack = async (reference) => {
  const secretKey = config.paystack?.secretKey;
  if (!secretKey) throw new BadRequestError('Paystack is not configured.');

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey}` },
    }
  );

  const result = await response.json();

  return {
    success: result.status && result.data?.status === 'success',
    data: result.data,
  };
};

/**
 * Initialize a Stripe Checkout Session.
 * Returns { checkoutUrl, providerReference, sessionId }
 *
 * Stripe amounts are in the smallest currency unit (cents for USD).
 * We treat the GHS price as USD for Stripe (international billing).
 *
 * @param {Object} opts
 * @param {string} opts.email - Customer email
 * @param {number} opts.amountGHS - Amount in GHS (will be converted to cents for Stripe)
 * @param {string} opts.planName - Product name for the line item
 * @param {Object} opts.metadata - Metadata to attach to the session
 * @param {string} opts.successUrl - URL to redirect to after successful payment
 * @param {string} opts.cancelUrl - URL to redirect to on cancelled payment
 * @returns {Promise<{checkoutUrl: string, providerReference: string, sessionId: string}>}
 */
const initializeStripe = async ({ email, amountGHS, planName, metadata, successUrl, cancelUrl }) => {
  const secretKey = config.stripe?.secretKey;
  if (!secretKey) {
    throw new BadRequestError('Stripe is not configured. Please contact support.');
  }

  // Stripe requires URL-encoded body for checkout sessions
  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('customer_email', email);
  params.append('line_items[0][quantity]', '1');
  params.append('line_items[0][price_data][currency]', 'usd');
  params.append('line_items[0][price_data][unit_amount]', String(Math.round(amountGHS * 100)));
  params.append('line_items[0][price_data][product_data][name]', planName || 'Enterprise Monthly Plan');
  params.append('success_url', successUrl || `${config.frontendUrl}/payment/success?gateway=stripe&session_id={CHECKOUT_SESSION_ID}`);
  params.append('cancel_url', cancelUrl || `${config.frontendUrl}/payment/cancelled?gateway=stripe`);

  // Attach metadata to the session (Stripe allows up to 50 key-value pairs)
  if (metadata) {
    Object.entries(metadata).slice(0, 50).forEach(([k, v]) => {
      params.append(`metadata[${k}]`, String(v));
    });
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ApplOge-Platform/1.0',
      },
      body: params.toString(),
    });

    const result = await response.json();

    if (result.error) {
      throw new BadRequestError(`Stripe initialization failed: ${result.error.message}`);
    }

    if (!result.url || !result.id) {
      throw new BadRequestError('Stripe returned invalid session data');
    }

    return {
      checkoutUrl: result.url,
      providerReference: result.id, // Stripe session ID
      sessionId: result.id,
    };
  } catch (error) {
    if (error instanceof BadRequestError) throw error;
    throw new BadRequestError(`Failed to initialize Stripe checkout: ${error.message}`);
  }
};

/**
 * Retrieve a Stripe checkout session to verify payment status.
 * Called by the verify endpoint and webhooks.
 *
 * @param {string} sessionId - The Stripe checkout session ID
 * @returns {Promise<{success: boolean, data: Object}>}
 */
const verifyStripe = async (sessionId) => {
  const secretKey = config.stripe?.secretKey;
  if (!secretKey) throw new BadRequestError('Stripe is not configured.');

  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'User-Agent': 'ApplOge-Platform/1.0',
      },
    });

    if (!response.ok) {
      throw new BadRequestError(`Failed to retrieve Stripe session: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: result.payment_status === 'paid',
      data: result,
      customerId: result.customer,
      paymentIntentId: result.payment_intent,
    };
  } catch (error) {
    if (error instanceof BadRequestError) throw error;
    throw new BadRequestError(`Failed to verify Stripe payment: ${error.message}`);
  }
};

/**
 * Retrieve a Stripe payment intent to check advanced payment details.
 * Useful for handling payment status and failure reasons.
 *
 * @param {string} paymentIntentId - The Stripe payment intent ID
 * @returns {Promise<{success: boolean, data: Object, lastError: string|null}>}
 */
const getStripePaymentIntent = async (paymentIntentId) => {
  const secretKey = config.stripe?.secretKey;
  if (!secretKey) throw new BadRequestError('Stripe is not configured.');

  try {
    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'User-Agent': 'ApplOge-Platform/1.0',
      },
    });

    if (!response.ok) {
      throw new BadRequestError(`Failed to retrieve payment intent: ${response.statusText}`);
    }

    const result = await response.json();
    const lastError = result.last_payment_error?.message || null;

    return {
      success: result.status === 'succeeded',
      data: result,
      lastError,
    };
  } catch (error) {
    if (error instanceof BadRequestError) throw error;
    throw new BadRequestError(`Failed to get payment intent: ${error.message}`);
  }
};

/**
 * Verify a Paystack webhook signature.
 * Uses HMAC-SHA512 of raw body with the Paystack secret key.
 */
const verifyPaystackSignature = (rawBody, signature) => {
  const crypto = require('crypto');
  const secretKey = config.paystack?.secretKey;
  if (!secretKey) return false;
  const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
  return hash === signature;
};

/**
 * Verify a Stripe webhook signature using the webhook secret.
 */
const verifyStripeSignature = (rawBody, signature) => {
  const webhookSecret = config.stripe?.webhookSecret;
  if (!webhookSecret) return false;

  // Stripe timestamp + signature validation
  const crypto = require('crypto');
  const parts = signature.split(',');
  const timestamp = parts.find((p) => p.startsWith('t='))?.split('=')[1];
  const v1 = parts.find((p) => p.startsWith('v1='))?.split('=')[1];

  if (!timestamp || !v1) return false;

  const tolerance = 300; // 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > tolerance) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto.createHmac('sha256', webhookSecret).update(signedPayload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'));
};

module.exports = {
  initializePaystack,
  verifyPaystack,
  initializeStripe,
  verifyStripe,
  getStripePaymentIntent,
  verifyPaystackSignature,
  verifyStripeSignature,
};
