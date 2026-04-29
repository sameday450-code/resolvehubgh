import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { paymentsAPI } from '../../lib/api';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Hexagon,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser: _setUser } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'failed'
  const [errorMessage, setErrorMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      // Resolve gateway + reference from URL params or sessionStorage fallback
      const gateway =
        searchParams.get('gateway')?.toUpperCase() ||
        sessionStorage.getItem('payment_gateway') ||
        '';
      const reference =
        gateway === 'STRIPE'
          ? searchParams.get('session_id') || sessionStorage.getItem('payment_reference') || ''
          : searchParams.get('reference') ||
            searchParams.get('trxref') ||
            sessionStorage.getItem('payment_reference') ||
            '';

      if (!gateway || !reference) {
        setErrorMessage('Missing payment details. Please try again.');
        setStatus('failed');
        return;
      }

      try {
        const { data } = await paymentsAPI.verify(reference, gateway);
        const subscription = data.data?.subscription;

        if (subscription?.status === 'ACTIVE') {
          // Update stored user subscription so context reflects new state
          const stored = localStorage.getItem('user');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              parsed.subscription = subscription;
              localStorage.setItem('user', JSON.stringify(parsed));
            } catch {
              // ignore JSON parse errors
            }
          }
          // Clear session payment data
          sessionStorage.removeItem('payment_reference');
          sessionStorage.removeItem('payment_gateway');
          sessionStorage.removeItem('payment_transaction_id');

          setStatus('success');
          // Navigate after short delay so user sees success screen
          setTimeout(() => navigate('/dashboard?payment=success', { replace: true }), 2200);
        } else {
          setErrorMessage('Payment was not confirmed by the gateway. Please try again.');
          setStatus('failed');
        }
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message ||
            'We could not verify your payment. If you were charged, please contact support.'
        );
        setStatus('failed');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border shadow-lg overflow-hidden">
          <div
            className={`h-1.5 ${
              status === 'success'
                ? 'bg-green-500'
                : status === 'failed'
                ? 'bg-red-500'
                : 'bg-gradient-to-r from-primary via-primary/70 to-primary/40'
            }`}
          />

          <div className="p-8 flex flex-col items-center text-center">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
                <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl">
                  <Hexagon className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-lg font-bold tracking-tight">ResolveHub</span>
            </div>

            {/* Loading */}
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
                <p className="text-sm text-muted-foreground">
                  Please wait while we confirm your payment with the gateway...
                </p>
              </>
            )}

            {/* Success */}
            {status === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Your Enterprise Monthly subscription is now active. Redirecting you to your
                  dashboard...
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Taking you to the dashboard
                </div>
              </>
            )}

            {/* Failed */}
            {status === 'failed' && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Payment Not Confirmed</h2>
                <p className="text-sm text-muted-foreground mb-6">{errorMessage}</p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    asChild
                    className="flex-1 gap-2"
                    variant="default"
                  >
                    <Link to="/pending-payment">
                      Try Again
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <a href="mailto:support@resolvehub.com">Contact Support</a>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {status === 'failed' && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            If you believe this is an error, please email{' '}
            <a href="mailto:support@resolvehub.com" className="underline">
              support@resolvehub.com
            </a>{' '}
            with your payment reference.
          </p>
        )}
      </div>
    </div>
  );
}
