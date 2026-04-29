import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Calendar,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { formatDate } from '../../lib/dateUtils';

const STATUS_CONFIG = {
  TRIALING: {
    icon: Clock,
    color: 'bg-blue-500 text-white',
    label: 'Trial Active',
    description: 'Your free trial is active',
  },
  ACTIVE: {
    icon: CheckCircle,
    color: 'bg-green-500 text-white',
    label: 'Active',
    description: 'Your subscription is active',
  },
  PENDING_ACTIVATION: {
    icon: AlertCircle,
    color: 'bg-amber-500 text-white',
    label: 'Pending Payment',
    description: 'Complete payment to activate',
  },
  PENDING_PAYMENT: {
    icon: AlertCircle,
    color: 'bg-amber-500 text-white',
    label: 'Payment Due',
    description: 'Payment is overdue',
  },
  PAST_DUE: {
    icon: AlertCircle,
    color: 'bg-red-500 text-white',
    label: 'Past Due',
    description: 'Payment is past due',
  },
  EXPIRED: {
    icon: AlertCircle,
    color: 'bg-red-500 text-white',
    label: 'Expired',
    description: 'Your subscription has expired',
  },
  CANCELLED: {
    icon: AlertCircle,
    color: 'bg-gray-500 text-white',
    label: 'Cancelled',
    description: 'Your subscription is cancelled',
  },
};

export default function SubscriptionCard({ subscription, billingProfile, onUpgrade, onRetryPayment }) {
  if (!subscription) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>Get started with a plan</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onUpgrade} className="w-full">
            <Zap className="mr-2 h-4 w-4" />
            View Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = STATUS_CONFIG[subscription.status] || STATUS_CONFIG.PENDING_ACTIVATION;
  const StatusIcon = statusConfig.icon;

  // Calculate days remaining in trial
  const daysRemaining = subscription.trialEndsAt
    ? Math.ceil((new Date(subscription.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const isTrialEndingSoon = daysRemaining && daysRemaining <= 7 && daysRemaining > 0;
  const isPaymentDue = ['PENDING_PAYMENT', 'PAST_DUE'].includes(subscription.status);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{subscription.subscriptionPlan?.name || 'Plan'}</CardTitle>
            <CardDescription className="text-xs">
              {subscription.subscriptionPlan?.description}
            </CardDescription>
          </div>
          <Badge className={statusConfig.color}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pricing and Cycle */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Plan Price
            </p>
            <p className="text-xl font-bold mt-1">
              {subscription.subscriptionPlan?.price > 0 ? (
                <>
                  ₵{subscription.subscriptionPlan?.price.toFixed(2)}
                  <span className="text-xs text-muted-foreground font-normal ml-1">
                    /{subscription.subscriptionPlan?.billingCycle?.toLowerCase()}
                  </span>
                </>
              ) : (
                'Free Trial'
              )}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Cycle
            </p>
            <p className="text-lg font-semibold mt-1 capitalize">
              {subscription.subscriptionPlan?.billingCycle?.replace('_', ' ') || 'N/A'}
            </p>
          </div>
        </div>

        {/* Trial Status */}
        {subscription.status === 'TRIALING' && daysRemaining !== null && (
          <div
            className={`p-3 rounded-lg border-l-4 ${
              isTrialEndingSoon
                ? 'bg-amber-50 border-amber-500 dark:bg-amber-950/30'
                : 'bg-blue-50 border-blue-500 dark:bg-blue-950/30'
            }`}
          >
            <p className="text-sm font-medium">
              {isTrialEndingSoon ? '⏰' : '✨'} Trial Ends in {daysRemaining} day
              {daysRemaining !== 1 ? 's' : ''}
            </p>
            {subscription.trialEndsAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Ends on {formatDate(new Date(subscription.trialEndsAt), 'MMM dd, yyyy')}
              </p>
            )}
          </div>
        )}

        {/* Billing Period */}
        {subscription.status === 'ACTIVE' && subscription.currentPeriodEnd && (
          <div className="p-3 rounded-lg bg-muted/40 border">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Billing Period</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {subscription.currentPeriodStart && (
                <>
                  {formatDate(new Date(subscription.currentPeriodStart), 'MMM dd')} -{' '}
                  {formatDate(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                </>
              )}
            </p>
          </div>
        )}

        {/* Payment Method / Gateway */}
        {subscription.gateway && (
          <div className="p-3 rounded-lg bg-muted/40 border">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Payment Method</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 capitalize">
              {subscription.gateway === 'PAYSTACK' ? 'Paystack' : 'Stripe'}
            </p>
          </div>
        )}

        {/* Plan Features */}
        {subscription.subscriptionPlan?.features && Array.isArray(subscription.subscriptionPlan.features) && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Included Features
            </p>
            <ul className="space-y-1">
              {subscription.subscriptionPlan.features.slice(0, 4).map((feature, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
              {subscription.subscriptionPlan.features.length > 4 && (
                <li className="text-xs text-muted-foreground italic">
                  +{subscription.subscriptionPlan.features.length - 4} more features
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Limits */}
        {subscription.subscriptionPlan && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Plan Limits
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted/40 p-2 rounded">
                <p className="text-xs text-muted-foreground">Max Branches</p>
                <p className="font-semibold">{subscription.subscriptionPlan.maxBranches}</p>
              </div>
              <div className="bg-muted/40 p-2 rounded">
                <p className="text-xs text-muted-foreground">Max QR Codes</p>
                <p className="font-semibold">{subscription.subscriptionPlan.maxQRCodes}</p>
              </div>
              <div className="bg-muted/40 p-2 rounded">
                <p className="text-xs text-muted-foreground">Max Staff</p>
                <p className="font-semibold">{subscription.subscriptionPlan.maxStaff}</p>
              </div>
              <div className="bg-muted/40 p-2 rounded">
                <p className="text-xs text-muted-foreground">Data Retention</p>
                <p className="font-semibold">{subscription.subscriptionPlan.dataRetention || '365'}d</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t space-y-2">
          {isPaymentDue && (
            <Button
              onClick={onRetryPayment}
              className="w-full"
              variant="destructive"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Retry Payment
            </Button>
          )}

          {(subscription.status === 'PENDING_ACTIVATION' || isPaymentDue) && (
            <Button
              onClick={onUpgrade}
              className="w-full"
              variant={isPaymentDue ? 'outline' : 'default'}
            >
              Complete Payment
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {subscription.status === 'TRIALING' && (
            <Button
              onClick={onUpgrade}
              className="w-full"
            >
              <Zap className="mr-2 h-4 w-4" />
              Upgrade to Enterprise
            </Button>
          )}

          {subscription.status === 'CANCELLED' && (
            <Button
              onClick={onUpgrade}
              className="w-full"
            >
              <Zap className="mr-2 h-4 w-4" />
              Reactivate Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
