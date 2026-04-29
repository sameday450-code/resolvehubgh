import { Loader2 } from 'lucide-react';
import BillingLockedBanner from './BillingLockedBanner';
import TrialBanner from './TrialBanner';
import TrialExpiredModal from './TrialExpiredModal';

export function LoadingSpinner({ size = 'default', className = '' }) {
  const sizes = { sm: 'h-4 w-4', default: 'h-8 w-8', lg: 'h-12 w-12' };
  return <Loader2 className={`animate-spin text-primary ${sizes[size]} ${className}`} />;
}

export function PageLoading() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function StatsCard({ title, value, icon: Icon, description, trend, className = '', color = 'blue' }) {
  const colorMap = {
    blue: { bg: 'from-blue-500/10 to-blue-600/5', icon: 'bg-blue-500/10 text-blue-600', ring: 'ring-blue-500/20' },
    green: { bg: 'from-emerald-500/10 to-emerald-600/5', icon: 'bg-emerald-500/10 text-emerald-600', ring: 'ring-emerald-500/20' },
    amber: { bg: 'from-amber-500/10 to-amber-600/5', icon: 'bg-amber-500/10 text-amber-600', ring: 'ring-amber-500/20' },
    purple: { bg: 'from-violet-500/10 to-violet-600/5', icon: 'bg-violet-500/10 text-violet-600', ring: 'ring-violet-500/20' },
    red: { bg: 'from-red-500/10 to-red-600/5', icon: 'bg-red-500/10 text-red-600', ring: 'ring-red-500/20' },
    cyan: { bg: 'from-cyan-500/10 to-cyan-600/5', icon: 'bg-cyan-500/10 text-cyan-600', ring: 'ring-cyan-500/20' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`group relative rounded-2xl border bg-gradient-to-br ${c.bg} p-5 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${c.icon} ring-1 ${c.ring} transition-transform group-hover:scale-110 duration-300`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {description && (
        <p className="mt-3 text-xs text-muted-foreground">
          {trend && (
            <span className={`inline-flex items-center gap-0.5 font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%{' '}
            </span>
          )}
          {description}
        </p>
      )}
    </div>
  );
}

export { BillingLockedBanner, TrialBanner, TrialExpiredModal };
