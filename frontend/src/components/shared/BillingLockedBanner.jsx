import { AlertCircle, Clock, CreditCard, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';

/**
 * BillingLockedBanner - Shows when user's billing state prevents access to features
 * Provides clear messaging and recovery actions
 */
export default function BillingLockedBanner({
  reason = 'BILLING_REQUIRED',
  message = 'Your subscription is not active.',
  actionBlocked = 'Please upgrade your subscription.',
  status = null,
  onUpgrade = null,
  onRetry = null,
  fullWidth = true,
}) {
  // Determine icon based on reason
  const getIcon = () => {
    switch (reason) {
      case 'TRIAL_EXPIRED':
        return <Clock className="h-5 w-5" />;
      case 'PENDING_PAYMENT':
        return <CreditCard className="h-5 w-5" />;
      case 'EXPIRED':
      case 'CANCELLED':
      case 'PAST_DUE':
        return <Lock className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  // Determine color variant based on reason
  const getVariant = () => {
    switch (reason) {
      case 'TRIAL_EXPIRED':
        return 'warning';
      case 'PENDING_PAYMENT':
        return 'warning';
      case 'EXPIRED':
      case 'CANCELLED':
      case 'PAST_DUE':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Get specific message based on reason
  const getDetailedMessage = () => {
    switch (reason) {
      case 'TRIAL_EXPIRED':
        return 'Your free trial has ended. Activate a paid plan to continue using ResolveHub.';
      case 'PENDING_PAYMENT':
        return 'Your payment is pending. Complete your activation to regain access.';
      case 'PAST_DUE':
        return 'Your subscription payment is overdue. Please update your payment method.';
      case 'EXPIRED':
        return 'Your subscription has expired. Renew your subscription to restore access.';
      case 'CANCELLED':
        return 'Your subscription has been cancelled. Start a new subscription to continue.';
      case 'NO_SUBSCRIPTION':
        return 'You don\'t have an active subscription. Choose a plan to get started.';
      case 'PENDING_ACTIVATION':
        return 'Your subscription is being activated. Please wait a moment and try again.';
      default:
        return message;
    }
  };

  const containerClass = fullWidth ? 'w-full' : '';

  return (
    <Alert variant={getVariant()} className={containerClass}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <AlertTitle className="text-base font-semibold">
            {reason === 'TRIAL_EXPIRED' && 'Trial Period Ended'}
            {reason === 'PENDING_PAYMENT' && 'Payment Required'}
            {reason === 'PAST_DUE' && 'Payment Overdue'}
            {reason === 'EXPIRED' && 'Subscription Expired'}
            {reason === 'CANCELLED' && 'Subscription Cancelled'}
            {reason === 'NO_SUBSCRIPTION' && 'No Active Subscription'}
            {reason === 'PENDING_ACTIVATION' && 'Activating Your Subscription'}
            {!['TRIAL_EXPIRED', 'PENDING_PAYMENT', 'PAST_DUE', 'EXPIRED', 'CANCELLED', 'NO_SUBSCRIPTION', 'PENDING_ACTIVATION'].includes(reason) && 'Billing Required'}
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm">
            <p className="mb-2">{getDetailedMessage()}</p>
            {actionBlocked && <p className="text-xs italic text-muted-foreground">{actionBlocked}</p>}
          </AlertDescription>
        </div>
      </div>

      {/* Action buttons */}
      {(onUpgrade || onRetry) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {onUpgrade && (
            <Button
              size="sm"
              variant={reason === 'PENDING_PAYMENT' || reason === 'PAST_DUE' ? 'destructive' : 'default'}
              onClick={onUpgrade}
            >
              {reason === 'PENDING_PAYMENT' || reason === 'PAST_DUE' ? 'Update Payment' : 'Upgrade Now'}
            </Button>
          )}
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
            >
              Try Again
            </Button>
          )}
        </div>
      )}
    </Alert>
  );
}
