import { useQuery } from '@tanstack/react-query';
import { subscriptionAPI } from '../../lib/api';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

export default function TrialStatusBanner() {
  const navigate = useNavigate();
  const { data: subscription } = useQuery({
    queryKey: ['subscription-info'],
    queryFn: () => subscriptionAPI.getCompanySubscriptionInfo(),
  });

  if (!subscription?.data) return null;

  const sub = subscription.data;
  const now = new Date();
  const trialEnd = new Date(sub.trialEndDate);
  const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
  const isTrialActive = sub.paymentStatus === 'UNPAID' && daysRemaining > 0;
  const isTrialExpired = daysRemaining <= 0 && sub.paymentStatus !== 'MANUAL_APPROVED';

  if (!isTrialActive && !isTrialExpired) {
    return null;
  }

  if (isTrialActive) {
    return (
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Free Trial Active
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                You are currently using your 14-day free trial. During the trial, you can create{' '}
                <strong>{sub.branchLimit} branch</strong> and start collecting complaints.
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-2 font-medium">
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Expires on {new Date(sub.trialEndDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            onClick={() => navigate('/dashboard/billing')}
          >
            Go to Billing
          </Button>
        </div>
      </div>
    );
  }

  if (isTrialExpired) {
    return (
      <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Trial Expired
              </h3>
              <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                Your 14-day free trial has ended. Your dashboard is temporarily locked.
              </p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-2">
                To continue using ResolveHub, make payment via <strong>Mobile Money</strong> or{' '}
                <strong>Bank Transfer</strong>, then request activation from the Billing page.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white shrink-0"
            onClick={() => navigate('/dashboard/billing')}
          >
            Go to Billing
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
