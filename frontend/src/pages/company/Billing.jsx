import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { paymentsAPI, billingAPI } from '../../lib/api';
import { PageLoading, ErrorState } from '../../components/shared';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import SubscriptionCard from '../../components/billing/SubscriptionCard';
import BillingStatusBanner from '../../components/billing/BillingStatusBanner';
import TransactionTable from '../../components/billing/TransactionTable';
import UpgradeModal from '../../components/billing/UpgradeModal';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  FileText,
  Zap,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Loader,
} from 'lucide-react';

export default function BillingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { subscribe: socketSubscribe } = useSocket();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  // Fetch subscription data
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: billingAPI.getSubscription,
    retry: 2,
  });

  // Fetch billing profile
  const { data: billingProfile } = useQuery({
    queryKey: ['billingProfile'],
    queryFn: billingAPI.getBillingProfile,
  });

  // Fetch transactions
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ['payments', 'my'],
    queryFn: () => paymentsAPI.getMyTransactions({ limit: 50, page: 1 }),
    retry: 1,
  });

  // Initialize payment mutation
  const initializePaymentMutation = useMutation({
    mutationFn: (gateway) => paymentsAPI.initializePayment(gateway),
    onSuccess: (data) => {
      setCheckoutUrl(data.data.checkoutUrl);
      // Redirect to checkout
      window.location.href = data.data.checkoutUrl;
    },
    onError: (error) => {
      console.error('Payment initialization failed:', error);
      alert(
        error.response?.data?.message || 'Failed to initialize payment. Please try again.'
      );
    },
  });

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: ({ reference, gateway }) =>
      paymentsAPI.verifyPayment(reference, gateway),
    onSuccess: (data) => {
      refetchSubscription();
      refetchTransactions();
      alert('Payment verified successfully! Your subscription is now active.');
    },
    onError: (error) => {
      console.error('Payment verification failed:', error);
      alert(
        error.response?.data?.message || 'Payment verification failed. Please try again.'
      );
    },
  });

  // Handle callback from payment gateway
  useEffect(() => {
    const gateway = searchParams.get('gateway');
    const sessionId = searchParams.get('session_id');
    const reference = searchParams.get('reference');

    if (gateway && (sessionId || reference)) {
      const paymentRef = sessionId || reference;
      verifyPaymentMutation.mutate({ reference: paymentRef, gateway });
    }
  }, [searchParams]);

  // Subscribe to real-time subscription updates
  useEffect(() => {
    if (!socketSubscribe) return;
    
    const unsubscribe = socketSubscribe('subscription_activated', () => {
      refetchSubscription();
      refetchTransactions();
    });

    return unsubscribe;
  }, [socketSubscribe, refetchSubscription, refetchTransactions]);

  // Calculate days remaining in trial
  const daysRemaining = subscription?.data?.trialEndsAt
    ? Math.ceil((new Date(subscription.data.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  // Determine banner type
  let bannerType = null;
  if (subscription?.data?.status === 'TRIALING' && daysRemaining !== null) {
    bannerType = daysRemaining <= 7 ? 'trial_ending_soon' : null;
  } else if (subscription?.data?.status === 'PENDING_ACTIVATION') {
    bannerType = 'pending_activation';
  } else if (subscription?.data?.status === 'PENDING_PAYMENT' || subscription?.data?.status === 'PAST_DUE') {
    bannerType = 'payment_due';
  } else if (subscription?.data?.status === 'ACTIVE') {
    bannerType = 'subscription_active';
  }

  const handleSelectGateway = async (gateway) => {
    setSelectedGateway(gateway);
    initializePaymentMutation.mutate(gateway);
  };

  const handleRetryPayment = (transaction) => {
    if (transaction.status === 'FAILED') {
      setUpgradeModalOpen(true);
    }
  };

  if (subscriptionLoading) {
    return <PageLoading />;
  }

  if (subscriptionError) {
    return (
      <ErrorState
        title="Failed to load subscription"
        description={subscriptionError?.response?.data?.message}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription, payment methods, and billing information
        </p>
      </div>

      {/* Status Banners */}
      {bannerType && (
        <BillingStatusBanner
          type={bannerType}
          daysLeft={daysRemaining}
          periodEnd={subscription?.currentPeriodEnd}
          onAction={() => setUpgradeModalOpen(true)}
          isDismissible
          actionLabel={
            subscription?.status === 'PENDING_ACTIVATION'
              ? 'Complete Payment'
              : subscription?.status === 'PENDING_PAYMENT'
              ? 'Retry Payment'
              : 'Upgrade Now'
          }
        />
      )}

      {/* Verification In Progress */}
      {verifyPaymentMutation.isPending && (
        <Alert>
          <Loader className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Verifying your payment... Please wait.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="subscription" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscription" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <FileText className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <Zap className="h-4 w-4" />
            Billing Info
          </TabsTrigger>
        </TabsList>

        {/* SUBSCRIPTION TAB */}
        <TabsContent value="subscription" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Subscription Card */}
            <div className="md:col-span-2">
              <SubscriptionCard
                subscription={subscription?.data}
                billingProfile={billingProfile?.data}
                onUpgrade={() => setUpgradeModalOpen(true)}
                onRetryPayment={() => handleRetryPayment({})}
              />
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              {subscription?.data?.status === 'TRIALING' && daysRemaining !== null && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Trial Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {daysRemaining}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Days remaining
                      </p>
                    </div>
                    <Button
                      onClick={() => setUpgradeModalOpen(true)}
                      className="w-full"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              )}

              {subscription?.data?.status === 'ACTIVE' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Subscription Active</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">All set!</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Your subscription is active and billing is on track.
                    </p>
                  </CardContent>
                </Card>
              )}

              {(subscription?.data?.status === 'PENDING_PAYMENT' ||
                subscription?.data?.status === 'PAST_DUE') && (
                <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-red-900 dark:text-red-100">
                      Payment Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      Your payment is overdue. Please complete payment to maintain
                      access.
                    </p>
                    <Button
                      onClick={() => setUpgradeModalOpen(true)}
                      className="w-full"
                      variant="destructive"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Retry Payment
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TRANSACTIONS TAB */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>
                View your payment history and transaction details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable
                transactions={transactionsData?.data?.data || []}
                isLoading={transactionsLoading}
                onRetry={handleRetryPayment}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* BILLING INFO TAB */}
        <TabsContent value="billing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Billing Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Your billing contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Billing Email
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {billingProfile?.data?.billingEmail || user?.email}
                  </p>
                </div>

                {billingProfile?.data?.billingPhone && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Billing Phone
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {billingProfile.data.billingPhone}
                    </p>
                  </div>
                )}

                {billingProfile?.data?.legalCompanyName && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Company Name
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {billingProfile.data.legalCompanyName}
                    </p>
                  </div>
                )}

                {billingProfile?.data?.country && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Country
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {billingProfile.data.country}
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate('/dashboard/settings')}
                >
                  Update Billing Info
                </Button>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your payment preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">🟢 Paystack</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fast and secure mobile-first payments
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">🔵 Stripe</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Global payment processing
                    </p>
                  </div>
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    You can use either payment method for your subscription.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Invoice History (Future) */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>
                Download invoices for your records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Invoices will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        subscription={subscription?.data}
        plans={[]}
        isLoading={initializePaymentMutation.isPending}
        onSelectGateway={handleSelectGateway}
      />
    </div>
  );
}
