import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { paymentsAPI } from '../../lib/api';
import {
  CreditCard,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Clock,
  Hexagon,
  LogOut,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';

const PLAN_FEATURES = [
  'Up to 50 branches',
  'Up to 200 QR codes',
  'Up to 100 staff accounts',
  'Advanced analytics & export',
  'Real-time notifications',
  'Priority support',
  'Custom branding',
];

export default function PendingPaymentPage() {
  const { user, subscription, logout } = useAuth();
  const navigate = useNavigate();
  const [loadingGateway, setLoadingGateway] = useState(null); // 'PAYSTACK' | 'STRIPE' | null

  const handlePay = async (gateway) => {
    setLoadingGateway(gateway);
    try {
      const { data } = await paymentsAPI.initialize(gateway);
      const { checkoutUrl, providerReference, transactionId } = data.data;
      // Store reference so callback page can verify without relying on URL params alone
      sessionStorage.setItem('payment_reference', providerReference);
      sessionStorage.setItem('payment_gateway', gateway);
      sessionStorage.setItem('payment_transaction_id', transactionId ?? '');
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initialise payment. Try again.');
    } finally {
      setLoadingGateway(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isPending = subscription?.status === 'PENDING_PAYMENT';

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border shadow-lg overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
                <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl">
                  <Hexagon className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-lg font-bold tracking-tight">ResolveHub</span>
            </div>

            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-medium mb-4">
              <Clock className="h-3.5 w-3.5" />
              {isPending ? 'Payment Required' : 'Active'}
            </div>

            <h1 className="text-2xl font-bold tracking-tight mb-1">Complete Your Payment</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Hi {user?.fullName?.split(' ')[0] ?? 'there'}, your account is ready. Activate your
              Enterprise Monthly subscription to get started.
            </p>

            {/* Plan summary */}
            <div className="rounded-xl border bg-muted/30 p-4 mb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <p className="font-semibold">Enterprise Monthly</p>
                  <p className="text-xl font-bold text-primary shrink-0">GHS 299<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                </div>
                <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                  {PLAN_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Gateway buttons */}
            <div className="space-y-3 mb-6">
              <Button
                onClick={() => handlePay('PAYSTACK')}
                disabled={!!loadingGateway}
                className="w-full h-13 text-sm font-semibold justify-between px-5"
                style={{ background: '#00c3a0', color: '#fff' }}
              >
                <span className="flex items-center gap-2">
                  {loadingGateway === 'PAYSTACK' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-base">P</span>
                  )}
                  Pay with Paystack
                </span>
                <span className="flex items-center gap-1 text-xs opacity-80">
                  GHS · Cards · Mobile Money
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Button>

              <Button
                onClick={() => handlePay('STRIPE')}
                disabled={!!loadingGateway}
                className="w-full h-13 text-sm font-semibold justify-between px-5"
                style={{ background: '#635bff', color: '#fff' }}
              >
                <span className="flex items-center gap-2">
                  {loadingGateway === 'STRIPE' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-base">S</span>
                  )}
                  Pay with Stripe
                </span>
                <span className="flex items-center gap-1 text-xs opacity-80">
                  USD · International Cards
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground mb-6">
              Payments are processed securely by Paystack or Stripe. Your billing information is
              never stored on our servers.
            </p>

            <div className="border-t pt-4 flex justify-center">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out and continue later
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/60 mt-4">
          Need help?{' '}
          <a href="mailto:support@resolvehub.com" className="underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
