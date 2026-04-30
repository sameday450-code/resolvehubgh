import { Clock, AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

const TrialBanner = ({ subscription, onContactSupport, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!subscription || subscription.status !== 'TRIALING' || !isVisible) {
    return null;
  }

  const daysRemaining = subscription.daysRemainingInTrial || 0;
  const isAboutToExpire = daysRemaining <= 3;
  const isExpired = daysRemaining <= 0;

  const getBannerConfig = () => {
    if (isExpired) {
      return {
        icon: AlertTriangle,
        title: 'Trial Expired',
        color: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
        iconColor: 'text-red-600 dark:text-red-400',
        textColor: 'text-red-800 dark:text-red-200',
        buttonColor: 'bg-red-600 hover:bg-red-700',
      };
    }

    if (isAboutToExpire) {
      return {
        icon: AlertTriangle,
        title: 'Trial Ending Soon',
        color: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
        iconColor: 'text-amber-600 dark:text-amber-400',
        textColor: 'text-amber-800 dark:text-amber-200',
        buttonColor: 'bg-amber-600 hover:bg-amber-700',
      };
    }

    return {
      icon: Clock,
      title: 'Free Trial Active',
      color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-800 dark:text-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    };
  };

  const config = getBannerConfig();
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div
      className={`border rounded-lg p-4 flex items-center justify-between ${config.color} mb-4`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
        <div>
          <h3 className={`font-semibold ${config.textColor}`}>{config.title}</h3>
          <p className={`text-sm ${config.textColor} opacity-90`}>
            {isExpired
              ? 'Your trial has ended. Contact ResolveHub to activate your account.'
              : `You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your free trial.`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isExpired && (
          <Button
            onClick={onContactSupport}
            className={`${config.buttonColor} text-white`}
            size="sm"
          >
            Contact Support
          </Button>
        )}
        <button
          onClick={handleDismiss}
          className={`p-1 rounded hover:bg-white/20 ${config.textColor}`}
          aria-label="Dismiss banner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TrialBanner;
