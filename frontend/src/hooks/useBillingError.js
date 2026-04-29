import { useEffect, useState } from 'react';

/**
 * Hook to track billing error from API responses
 * Used when components receive 402 errors
 */
export function useBillingError() {
  const [billingError, setBillingError] = useState(null);

  useEffect(() => {
    // Check session storage for billing error
    const stored = sessionStorage.getItem('billingError');
    if (stored) {
      try {
        setBillingError(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const clearError = () => {
    sessionStorage.removeItem('billingError');
    setBillingError(null);
  };

  return { billingError, clearError };
}

/**
 * Hook to check if a mutation/query failed due to billing
 * Can be used with React Query to detect 402 errors
 */
export function useBillingErrorHandler() {
  const { billingError, clearError } = useBillingError();

  const handleError = (error) => {
    if (error?.response?.status === 402) {
      return {
        isBillingError: true,
        reason: error.response.data?.reason,
        message: error.response.data?.message,
        actionBlocked: error.response.data?.actionBlocked,
      };
    }
    return { isBillingError: false };
  };

  return { billingError, clearError, handleError };
}
