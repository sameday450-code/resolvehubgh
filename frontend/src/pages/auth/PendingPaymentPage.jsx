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

            <h1 className="text-2xl font-bold tracking-tight mb-1">Activate Your Subscription</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Hi {user?.fullName?.split(' ')[0] ?? 'there'}, your account is ready. Complete your payment to activate your Enterprise plan.
            </p>

            {/* Plan summary */}
            <div className="rounded-xl border bg-muted/30 p-4 mb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <p className="font-semibold">Enterprise Monthly Plan</p>
                  <p className="text-xl font-bold text-primary shrink-0">GHS 299<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                </div>
                <ul className="mt-3 space-y-1.5">
                  <li className="text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Payment Method:</p>
                    <p>Mobile Money or Bank Transfer</p>
                  </li>
                  <li className="text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Activation:</p>
                    <p>Email support@resolvehub.com with payment confirmation. We'll activate within 2 hours.</p>
                  </li>
                </ul>
              </div>
            </div>

            {/* Manual payment instructions */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold">How to Activate:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-bold text-primary shrink-0">1.</span>
                  <span>Pay GHS 299 via Mobile Money or Bank Transfer to the account we'll provide</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary shrink-0">2.</span>
                  <span>Email us at <a href="mailto:support@resolvehub.com" className="text-primary font-medium hover:underline">support@resolvehub.com</a> with your payment proof</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary shrink-0">3.</span>
                  <span>We'll verify and activate your account within 2 hours</span>
                </li>
              </ol>
              <Button
                onClick={() => window.location.href = 'mailto:support@resolvehub.com?subject=Payment%20for%20ResolveHub&body=I%20would%20like%20to%20complete%20payment%20for%20my%20Enterprise%20subscription.'}
                className="w-full h-12 text-sm font-medium bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 mt-4"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Email Support for Payment Details
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground mb-6">
              Payment will be processed manually. We typically respond to payment inquiries within 2 hours during business hours.
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
