import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { billingAPI, paymentsAPI } from '../../lib/api';
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
import ManualActivationForm from '../../components/billing/ManualActivationForm';
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
  CheckCircle,
  Smartphone,
  Clock,
} from 'lucide-react';

export default function BillingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { subscribe: socketSubscribe } = useSocket();

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
  } else if (
    subscription?.data?.status === 'PENDING_PAYMENT' ||
    subscription?.data?.status === 'PAST_DUE'
  ) {
    bannerType = 'payment_due';
  } else if (subscription?.data?.status === 'ACTIVE') {
    bannerType = 'subscription_active';
  }

  if (subscriptionLoading) return <PageLoading />;

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
          Manage your subscription and payment information
        </p>
      </div>

      {/* Status Banners */}
      {bannerType && (
        <BillingStatusBanner
          type={bannerType}
          daysLeft={daysRemaining}
          periodEnd={subscription?.currentPeriodEnd}
          isDismissible
        />
      )}

      {/* Tabs */}
      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manual" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Manual Payment
          </TabsTrigger>
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

        {/* MANUAL PAYMENT TAB — primary */}
        <TabsContent value="manual" className="space-y-4">
          <ManualActivationForm />
        </TabsContent>

        {/* SUBSCRIPTION TAB */}
        <TabsContent value="subscription" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <SubscriptionCard
                subscription={subscription?.data}
                billingProfile={billingProfile?.data}
                onUpgrade={() => {}}
                onRetryPayment={() => {}}
              />
            </div>
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
                      <p className="text-xs text-muted-foreground">Days remaining</p>
                    </div>
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
            </div>
          </div>

          {/* Online payments coming soon banner */}
          <Card className="border-dashed">
            <CardContent className="flex items-center gap-4 py-5">
              <Clock className="h-8 w-8 text-muted-foreground shrink-0" />
              <div>
                <p className="font-semibold text-sm">Online Payment — Coming Soon</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Paystack and Stripe integrations are currently unavailable. Use the{' '}
                  <strong>Manual Payment</strong> tab to activate your subscription.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRANSACTIONS TAB */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>View your payment history and transaction details</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable
                transactions={transactionsData?.data?.data || []}
                isLoading={transactionsLoading}
                onRetry={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* BILLING INFO TAB */}
        <TabsContent value="billing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Your billing contact details</CardDescription>
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
                    <p className="text-sm font-medium mt-1">{billingProfile.data.billingPhone}</p>
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
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate('/dashboard/settings')}
                >
                  Update Billing Info
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supported Payment Methods</CardTitle>
                <CardDescription>How to pay for your ResolveHub subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Mobile Money</p>
                    <p className="text-xs text-muted-foreground">
                      MTN, Telecel, AirtelTigo
                    </p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">
                      Any Ghanaian bank
                    </p>
                  </div>
                </div>
                <Alert className="mt-2">
                  <AlertDescription className="text-xs">
                    <strong>Online payment coming soon.</strong> Paystack and Stripe
                    integrations will be available shortly.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Download invoices for your records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Invoices will appear here after subscription activation</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
