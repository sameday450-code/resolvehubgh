import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

export default function TrialBanner() {
  const { subscription } = useAuth();
  const navigate = useNavigate();

  if (!subscription || subscription.status !== 'TRIALING') return null;

  const trialEndsAt = new Date(subscription.trialEndsAt);
  const now = new Date();
  const daysRemaining = Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) return null;

  let bgClass = 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
  let textClass = 'text-blue-800 dark:text-blue-300';
  let subTextClass = 'text-blue-600 dark:text-blue-400';
  let Icon = Clock;

  if (daysRemaining <= 1) {
    bgClass = 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
    textClass = 'text-red-800 dark:text-red-300';
    subTextClass = 'text-red-600 dark:text-red-400';
    Icon = AlertTriangle;
  } else if (daysRemaining <= 3) {
    bgClass = 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800';
    textClass = 'text-orange-800 dark:text-orange-300';
    subTextClass = 'text-orange-600 dark:text-orange-400';
    Icon = AlertTriangle;
  } else if (daysRemaining <= 7) {
    bgClass = 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
    textClass = 'text-yellow-800 dark:text-yellow-300';
    subTextClass = 'text-yellow-600 dark:text-yellow-400';
    Icon = Clock;
  }

  const label =
    daysRemaining <= 1
      ? 'Your trial expires today.'
      : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining in your free trial`;

  return (
    <div className={`flex items-center gap-3 px-6 py-2.5 border-b text-sm ${bgClass}`}>
      <Icon className={`h-4 w-4 shrink-0 ${textClass}`} />
      <span className={`font-medium ${textClass}`}>{label}</span>
      <span className={`hidden sm:inline ${subTextClass}`}>
        · When your trial ends, you'll need to activate a paid plan to continue.
      </span>
      <Button
        size="sm"
        className="ml-auto h-7 px-3 text-xs gap-1 shrink-0"
        onClick={() => navigate('/dashboard/settings?tab=billing')}
      >
        <Zap className="h-3 w-3" />
        View Plans
      </Button>
    </div>
  );
}
