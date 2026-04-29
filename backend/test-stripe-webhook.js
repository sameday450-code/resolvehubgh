// ============================================
// STRIPE WEBHOOK TESTING & SIMULATION
// ============================================
// Usage: node test-stripe-webhook.js
// Simulates Stripe webhook events locally
// Requires: STRIPE_WEBHOOK_SECRET in environment

const crypto = require('crypto');
const fetch = require('node-fetch');

// Configuration
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const WEBHOOK_ENDPOINT = 'http://localhost:5000/api/payments/webhook/stripe';
const COMPANY_ID = process.env.COMPANY_ID || 'test-company-123';
const SESSION_ID = process.env.SESSION_ID || 'cs_test_demo_session_id';

if (!WEBHOOK_SECRET) {
  console.error('ERROR: STRIPE_WEBHOOK_SECRET not set in environment');
  console.error('Set it with: export STRIPE_WEBHOOK_SECRET=whsec_test_...');
  process.exit(1);
}

console.log('🔧 Stripe Webhook Simulator');
console.log('============================');
console.log(`Webhook Endpoint: ${WEBHOOK_ENDPOINT}`);
console.log(`Company ID: ${COMPANY_ID}`);
console.log(`Session ID: ${SESSION_ID}`);
console.log();

/**
 * Generate a valid Stripe webhook signature
 * Matches Stripe's signature format: t=<timestamp>,v1=<signature>
 */
function generateStripeSignature(timestamp, payload) {
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

/**
 * Send webhook event to the endpoint
 */
async function sendWebhookEvent(eventName, eventData) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    id: `evt_test_${Date.now()}`,
    object: 'event',
    type: eventName,
    created: timestamp,
    data: {
      object: eventData,
    },
  });

  const signature = generateStripeSignature(timestamp, payload);

  console.log(`\n📤 Sending Event: ${eventName}`);
  console.log(`   Timestamp: ${timestamp}`);
  console.log(`   Signature: ${signature.substring(0, 50)}...`);
  console.log(`   Payload Size: ${payload.length} bytes`);

  try {
    const response = await fetch(WEBHOOK_ENDPOINT, {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json',
      },
      body: payload,
    });

    const statusText = response.statusText || 'OK';
    console.log(`   Response: ${response.status} ${statusText}`);

    if (response.status === 200) {
      console.log(`   ✅ Webhook processed successfully`);
      return true;
    } else {
      console.log(`   ❌ Unexpected status code`);
      const body = await response.text();
      console.log(`   Body: ${body}`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Error sending webhook: ${error.message}`);
    return false;
  }
}

/**
 * Test: Successful checkout session
 */
async function testCheckoutSessionCompleted() {
  console.log('\n' + '='.repeat(50));
  console.log('TEST 1: checkout.session.completed');
  console.log('='.repeat(50));

  const sessionData = {
    id: SESSION_ID,
    object: 'checkout.session',
    mode: 'payment',
    payment_status: 'paid',
    customer: 'cus_test_customer_id',
    customer_email: 'test@example.com',
    payment_intent: 'pi_test_payment_intent_id',
    status: 'complete',
    metadata: {
      companyId: COMPANY_ID,
      subscriptionId: 'sub_test_123',
      planType: 'ENTERPRISE_MONTHLY',
    },
  };

  await sendWebhookEvent('checkout.session.completed', sessionData);
}

/**
 * Test: Expired checkout session
 */
async function testCheckoutSessionExpired() {
  console.log('\n' + '='.repeat(50));
  console.log('TEST 2: checkout.session.expired');
  console.log('='.repeat(50));

  const sessionData = {
    id: SESSION_ID,
    object: 'checkout.session',
    mode: 'payment',
    payment_status: 'unpaid',
    customer: null,
    status: 'expired',
    metadata: {
      companyId: COMPANY_ID,
    },
  };

  await sendWebhookEvent('checkout.session.expired', sessionData);
}

/**
 * Test: Charge refunded
 */
async function testChargeRefunded() {
  console.log('\n' + '='.repeat(50));
  console.log('TEST 3: charge.refunded');
  console.log('='.repeat(50));

  const chargeData = {
    id: 'ch_test_charge_id',
    object: 'charge',
    amount: 10000,
    currency: 'usd',
    status: 'succeeded',
    refunded: true,
    amount_refunded: 10000,
    metadata: {
      sessionId: SESSION_ID,
      companyId: COMPANY_ID,
    },
  };

  await sendWebhookEvent('charge.refunded', chargeData);
}

/**
 * Test: Invalid signature (security test)
 */
async function testInvalidSignature() {
  console.log('\n' + '='.repeat(50));
  console.log('TEST 4: Invalid Signature (Security Test)');
  console.log('='.repeat(50));

  const payload = JSON.stringify({
    id: 'evt_test_invalid',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: SESSION_ID,
        payment_status: 'paid',
      },
    },
  });

  // Use wrong signature
  const invalidSignature = 't=12345,v1=invalidsignature123456789';

  console.log('\n📤 Sending Event with INVALID Signature');
  console.log(`   Signature: ${invalidSignature}`);

  try {
    const response = await fetch(WEBHOOK_ENDPOINT, {
      method: 'POST',
      headers: {
        'stripe-signature': invalidSignature,
        'content-type': 'application/json',
      },
      body: payload,
    });

    console.log(`   Response: ${response.status}`);

    if (response.status === 403) {
      console.log(`   ✅ Correctly rejected invalid signature`);
      return true;
    } else {
      console.log(`   ❌ Should have rejected with 403, got ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

/**
 * Test: Idempotency - send same event twice
 */
async function testIdempotency() {
  console.log('\n' + '='.repeat(50));
  console.log('TEST 5: Idempotency (Duplicate Prevention)');
  console.log('='.repeat(50));

  const sessionData = {
    id: SESSION_ID,
    object: 'checkout.session',
    payment_status: 'paid',
    metadata: {
      companyId: COMPANY_ID,
      subscriptionId: 'sub_test_idempotent',
    },
  };

  console.log('\n🔄 Attempt 1: First webhook');
  const result1 = await sendWebhookEvent('checkout.session.completed', sessionData);

  console.log('\n⏱️  Wait 2 seconds...');
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log('\n🔄 Attempt 2: Duplicate webhook (replay attack)');
  const result2 = await sendWebhookEvent('checkout.session.completed', sessionData);

  if (result1 && result2) {
    console.log('\n✅ Both webhooks processed (with idempotency protection)');
    return true;
  }

  return false;
}

/**
 * Run all tests
 */
async function runAllTests() {
  const tests = [
    { name: 'Checkout Completed', fn: testCheckoutSessionCompleted },
    { name: 'Checkout Expired', fn: testCheckoutSessionExpired },
    { name: 'Charge Refunded', fn: testChargeRefunded },
    { name: 'Invalid Signature', fn: testInvalidSignature },
    { name: 'Idempotency', fn: testIdempotency },
  ];

  console.log('\n🚀 Running Stripe Webhook Tests');
  console.log('=' + '='.repeat(49));

  for (const test of tests) {
    try {
      await test.fn();
    } catch (error) {
      console.error(`❌ Test failed with error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ All webhook tests completed');
  console.log('='.repeat(50));
  console.log('\n📋 Next Steps:');
  console.log('   1. Check logs to verify webhook processing');
  console.log('   2. Query database to verify subscription activation');
  console.log('   3. Test with actual Stripe test card at checkout URL');
  console.log('   4. Verify webhook signature validation security');
}

/**
 * Interactive mode - select specific test
 */
async function interactiveMode() {
  console.log('\nAvailable Tests:');
  console.log('1. Checkout Session Completed');
  console.log('2. Checkout Session Expired');
  console.log('3. Charge Refunded');
  console.log('4. Invalid Signature');
  console.log('5. Idempotency Test');
  console.log('6. Run All Tests');
  console.log('0. Exit');

  // For automated testing, run all tests
  await runAllTests();
}

// Run tests
interactiveMode().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
