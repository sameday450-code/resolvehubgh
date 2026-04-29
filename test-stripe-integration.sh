#!/bin/bash

# ============================================
# PHASE 7 - STRIPE INTEGRATION TEST SUITE
# ============================================
# 
# This script tests all Stripe payment flow scenarios
# Prerequisites: API running on localhost:5000, authenticated token
#
# Usage:
#   chmod +x test-stripe-integration.sh
#   ./test-stripe-integration.sh <auth_token> <company_id>

set -e

AUTH_TOKEN=${1:-"your-jwt-token"}
COMPANY_ID=${2:-"your-company-id"}
API_URL="http://localhost:5000/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function for tests
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5

    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "\n${YELLOW}[Test $TESTS_RUN] $name${NC}"
    
    if [ "$method" == "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL$endpoint" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL$endpoint" \
            -H "Authorization: Bearer $AUTH_TOKEN")
    fi

    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$status_code" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo "Response: $body" | jq '.' 2>/dev/null || echo "Response: $body"
        echo "$body" # Return for further processing
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "Response: $body"
    fi
}

# ============================================
# TEST SUITE
# ============================================

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}STRIPE INTEGRATION TEST SUITE${NC}"
echo -e "${YELLOW}========================================${NC}"
echo "API URL: $API_URL"
echo "Auth Token: ${AUTH_TOKEN:0:20}..."
echo "Company ID: $COMPANY_ID"

# Test 1: Initialize Stripe Payment
echo -e "\n${YELLOW}--- Test 1: Initialize Stripe Payment ---${NC}"
init_response=$(test_endpoint \
    "Initialize Stripe checkout" \
    "POST" \
    "/payments/initialize" \
    '{"gateway":"STRIPE"}' \
    "200")

# Extract session ID from response
SESSION_ID=$(echo "$init_response" | jq -r '.data.providerReference' 2>/dev/null)
TRANSACTION_ID=$(echo "$init_response" | jq -r '.data.transactionId' 2>/dev/null)
CHECKOUT_URL=$(echo "$init_response" | jq -r '.data.checkoutUrl' 2>/dev/null)

if [ -z "$SESSION_ID" ] || [ "$SESSION_ID" == "null" ]; then
    echo -e "${RED}Failed to extract session ID from response${NC}"
    SESSION_ID="cs_test_fake_id"
fi

echo "Session ID: $SESSION_ID"
echo "Transaction ID: $TRANSACTION_ID"
echo "Checkout URL: $CHECKOUT_URL"

# Test 2: Get Payment Transactions
echo -e "\n${YELLOW}--- Test 2: Get Payment Transactions ---${NC}"
test_endpoint \
    "List company payment transactions" \
    "GET" \
    "/payments/my" \
    "" \
    "200"

# Test 3: Get Specific Transaction
echo -e "\n${YELLOW}--- Test 3: Get Specific Transaction ---${NC}"
test_endpoint \
    "Get specific transaction" \
    "GET" \
    "/payments/my/$TRANSACTION_ID" \
    "" \
    "200"

# Test 4: Idempotency - Initialize Again (should return existing session)
echo -e "\n${YELLOW}--- Test 4: Idempotency Check ---${NC}"
idempotent_response=$(test_endpoint \
    "Initialize again (should reuse session)" \
    "POST" \
    "/payments/initialize" \
    '{"gateway":"STRIPE"}' \
    "200")

IS_EXISTING=$(echo "$idempotent_response" | jq -r '.data.isExisting' 2>/dev/null)
echo "Is existing session: $IS_EXISTING"

if [ "$IS_EXISTING" == "true" ]; then
    echo -e "${GREEN}✓ Idempotency working correctly${NC}"
else
    echo -e "${YELLOW}! New session created (might be outside 30-min window)${NC}"
fi

# Test 5: Verify Payment (should fail if not actually paid)
echo -e "\n${YELLOW}--- Test 5: Verify Payment (Simulate) ---${NC}"
echo "Note: In real scenario, payment must be completed at Stripe Checkout"
test_endpoint \
    "Verify Stripe payment" \
    "POST" \
    "/payments/verify" \
    "{\"reference\":\"$SESSION_ID\",\"gateway\":\"STRIPE\"}" \
    "200"

# Test 6: Invalid Gateway Error
echo -e "\n${YELLOW}--- Test 6: Error Handling ---${NC}"
test_endpoint \
    "Invalid gateway parameter" \
    "POST" \
    "/payments/initialize" \
    '{"gateway":"INVALID"}' \
    "400"

# Test 7: Missing Gateway Error
echo -e "\n${YELLOW}--- Test 7: Missing Required Field ---${NC}"
test_endpoint \
    "Missing gateway parameter" \
    "POST" \
    "/payments/initialize" \
    '{}' \
    "400"

# Test 8: Super Admin - List All Transactions
echo -e "\n${YELLOW}--- Test 8: Super Admin Endpoints ---${NC}"
test_endpoint \
    "Super admin list all transactions" \
    "GET" \
    "/payments?limit=5" \
    "" \
    "200"

# ============================================
# MANUAL TEST SCENARIOS
# ============================================

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}MANUAL TEST SCENARIOS${NC}"
echo -e "${YELLOW}========================================${NC}"

cat << 'EOF'

The following scenarios require manual interaction with Stripe Checkout:

SCENARIO 1: Successful Payment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Visit the Checkout URL printed above
2. Fill payment form with test card:
   - Card: 4242 4242 4242 4242
   - Expiry: 12/25
   - CVC: 123
   - Email: any@example.com
3. Click "Pay"
4. Expected result:
   - Redirect to success page
   - Webhook fires: checkout.session.completed
   - Subscription status → ACTIVE
   - Company status → APPROVED
   - Dashboard access unlocked

SCENARIO 2: Failed Payment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Visit the Checkout URL
2. Use declined test card:
   - Card: 4000 0000 0000 0002
   - Expiry: 12/25
   - CVC: 123
3. Click "Pay"
4. Expected result:
   - Error message
   - Can retry payment
   - Transaction status remains PENDING

SCENARIO 3: Abandoned Session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Visit the Checkout URL
2. Close browser without completing
3. Wait 24 hours (or trigger manually in Stripe Dashboard)
4. Expected result:
   - Webhook fires: checkout.session.expired
   - Transaction status → FAILED
   - User can start new checkout

SCENARIO 4: Webhook Duplicate Prevention
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Use Stripe CLI to simulate webhook:
   stripe trigger checkout.session.completed
2. Observe logs:
   - First webhook: Transaction activated
   - Repeated webhook: Detected as idempotent
   - Subscription NOT activated twice

SCENARIO 5: Signature Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Tamper with webhook payload
2. Send to webhook endpoint manually
3. Expected result:
   - 403 Forbidden response
   - Log: "Stripe webhook signature verification failed"

EOF

# ============================================
# DATABASE VERIFICATION QUERIES
# ============================================

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}DATABASE VERIFICATION QUERIES${NC}"
echo -e "${YELLOW}========================================${NC}"

cat << EOF

Run these queries to verify payment state:

-- Check transactions
SELECT id, status, gateway, amount, "paidAt", "failedAt"
FROM "PaymentTransaction"
WHERE "companyId" = '$COMPANY_ID' AND gateway = 'STRIPE'
ORDER BY "createdAt" DESC
LIMIT 5;

-- Check subscription
SELECT id, status, "activatedAt", "currentPeriodStart", "currentPeriodEnd"
FROM "CompanySubscription"
WHERE "companyId" = '$COMPANY_ID';

-- Check company approval status
SELECT id, status, "approvedAt"
FROM "Company"
WHERE id = '$COMPANY_ID';

EOF

# ============================================
# TEST SUMMARY
# ============================================

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}TEST SUMMARY${NC}"
echo -e "${YELLOW}========================================${NC}"
echo "Total Tests: $TESTS_RUN"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All automated tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed. Review output above.${NC}"
    exit 1
fi
