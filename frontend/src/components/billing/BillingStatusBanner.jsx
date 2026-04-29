import {
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

const BANNER_CONFIG = {
  trial_ending_soon: {
    icon: Clock,
    title: 'Trial Ending Soon',
    description: (daysLeft) =>
      `Your free trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Upgrade to continue using ApplOge.`,
    color: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-800 dark:text-amber-200',
    actionColor: 'bg-amber-600 hover:bg-amber-700',
  },
  trial_expired: {
    icon: AlertTriangle,
    title: 'Trial Expired',
    description: 'Your trial has expired. Upgrade to enterprise to continue using ApplOge.',
    color: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-800 dark:text-red-200',
    actionColor: 'bg-red-600 hover:bg-red-700',
  },
  payment_due: {
    icon: AlertCircle,
    title: 'Payment Required',
    description: 'Your payment is overdue. Complete payment to regain full access.',
    color: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-800 dark:text-red-200',
    actionColor: 'bg-red-600 hover:bg-red-700',
  },
  subscription_active: {
    icon: CheckCircle,
    title: 'Subscription Active',
    description: (periodEnd) =>
      `Your subscription is active. Next billing date: ${periodEnd}`,
    color: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    textColor: 'text-green-800 dark:text-green-200',
    actionColor: 'bg-green-600 hover:bg-green-700',
  },
  pending_activation: {
    icon: Zap,
    title: 'Pending Activation',
    description: 'Complete your payment to activate your subscription and unlock full access.',
    color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-800 dark:text-blue-200',
    actionColor: 'bg-blue-600 hover:bg-blue-700',
  },
};

export default function BillingStatusBanner({
  type,
  daysLeft,
  periodEnd,
  onAction,
  onDismiss,
  isDismissible = true,
  actionLabel = 'Take Action',
}) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !type) return null;

  const config = BANNER_CONFIG[type];
  if (!config) return null;

  const Icon = config.icon;

  let description = config.description;
  if (typeof description === 'function') {
    description = description(daysLeft || periodEnd);
  }

  return (
    <div
      className={`border rounded-lg p-4 ${config.color} mb-6 animate-in fade-in-50 duration-200`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${config.textColor}`}>
            {config.title}
          </h3>
          <p className={`text-sm mt-1 ${config.textColor} opacity-90`}>
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onAction && (
            <Button
              size="sm"
              onClick={onAction}
              className={`${config.actionColor} text-white border-0`}
            >
              {actionLabel}
            </Button>
          )}

          {isDismissible && (
            <button
              onClick={() => {
                setIsDismissed(true);
                onDismiss?.();
              }}
              className={`p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors ${config.textColor}`}
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
