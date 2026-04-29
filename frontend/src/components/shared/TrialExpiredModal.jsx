import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Phone, RefreshCw, Clock, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, paymentsAPI } from '../../lib/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function TrialExpiredModal() {
  const navigate = useNavigate();
  const { isPendingPayment } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingGateway, setLoadingGateway] = useState(null);

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      const { data } = await authAPI.getProfile();
      const updated = data.data;
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const merged = { ...stored, subscription: updated.subscription };
      localStorage.setItem('user', JSON.stringify(merged));
      window.location.reload();
    } catch {
      toast.error('Could not refresh subscription status. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handlePay = async (gateway) => {
    setLoadingGateway(gateway);
    try {
      const { data } = await paymentsAPI.initialize(gateway);
      const { checkoutUrl, providerReference, transactionId } = data.data;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 animate-in fade-in-0 zoom-in-95">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isPendingPayment ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-destructive/10'}`}>
            {isPendingPayment
              ? <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              : <Lock className="h-8 w-8 text-destructive" />}
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-2">
            {isPendingPayment ? 'Complete Your Payment' : 'Your free trial has ended'}
          </h2>
          <p className="text-muted-foreground text-sm mb-1">
            {isPendingPayment
              ? 'Your account is pending payment to activate your Enterprise Monthly subscription.'
              : 'Your 14-day free trial has expired.'}
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            {isPendingPayment
              ? 'Choose a payment gateway below to complete your subscription and unlock all features.'
              : 'Upgrade to a paid plan to continue using complaint management, QR codes, analytics, and branch management.'}
          </p>

          <div className="w-full space-y-3">
            {isPendingPayment ? (
              <>
                <Button
                  className="w-full h-11 font-medium"
                  style={{ background: '#00c3a0', color: '#fff' }}
                  disabled={!!loadingGateway}
                  onClick={() => handlePay('PAYSTACK')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {loadingGateway === 'PAYSTACK' ? 'Redirecting...' : 'Pay with Paystack (GHS)'}
                </Button>
                <Button
                  className="w-full h-11 font-medium"
                  style={{ background: '#635bff', color: '#fff' }}
                  disabled={!!loadingGateway}
                  onClick={() => handlePay('STRIPE')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {loadingGateway === 'STRIPE' ? 'Redirecting...' : 'Pay with Stripe (USD)'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="w-full h-11 bg-[#00c3a0] hover:bg-[#00b090] text-white font-medium"
                  onClick={() => navigate('/dashboard/settings?tab=billing')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay with Paystack
                </Button>
                <Button
                  className="w-full h-11 bg-[#635bff] hover:bg-[#5851eb] text-white font-medium"
                  onClick={() => navigate('/dashboard/settings?tab=billing')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay with Stripe
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => navigate('/contact')}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Sales
                </Button>
              </>
            )}
          </div>

          <button
            onClick={handleRefreshStatus}
            disabled={refreshing}
            className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Checking...' : 'Already paid? Refresh status'}
          </button>
        </div>
      </div>
    </div>
  );
}
