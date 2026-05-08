import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { superAdminAPI, subscriptionAPI } from '../../lib/api';
import { formatDateSafe } from '../../lib/dateUtils';
import toast from 'react-hot-toast';
import {
  Lock, Unlock, Calendar, Zap, AlertCircle, Clock, CheckCircle2,
  CreditCard, DollarSign,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

const paymentStatusConfig = {
  UNPAID: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unpaid' },
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
  MANUAL_APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Paid' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
  TRIAL: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Trial' },
};

const ActivationModal = ({ companyId, onSuccess }) => {
  const [plan, setPlan] = useState('STARTER');
  const [duration, setDuration] = useState('30_days');
  const [paymentMethod, setPaymentMethod] = useState('MOBILE_MONEY');
  const [paymentReference, setPaymentReference] = useState('');
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) => subscriptionAPI.activateSubscription(companyId, data),
    onSuccess: (response) => {
      toast.success('Subscription activated successfully!');
      setOpen(false);
      // Reset form
      setPlan('STARTER');
      setDuration('30_days');
      setPaymentMethod('MOBILE_MONEY');
      setPaymentReference('');
      // Trigger refresh
      onSuccess?.();
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to activate subscription';
      toast.error(errorMsg);
      console.error('Subscription activation error:', err);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!plan) {
      toast.error('Please select a plan');
      return;
    }
    if (!duration) {
      toast.error('Please select a subscription duration');
      return;
    }
    mutation.mutate({
      plan,
      subscriptionDuration: duration,
      paymentMethod,
      paymentReference: paymentReference || 'MANUAL_ADMIN_ACTIVATION',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
          <Zap className="mr-2 h-4 w-4" /> Activate Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Activate Subscription</DialogTitle>
          <DialogDescription>
            Set up manual payment activation for this company
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pr-2">
          <div>
            <label className="text-sm font-medium">Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 rounded-lg border border-input bg-background text-sm"
            >
              <option value="STARTER">Starter - 2 branches</option>
              <option value="ENTERPRISE">Enterprise - 5 branches</option>
              <option value="CUSTOM">Custom - Unlimited</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Subscription Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 rounded-lg border border-input bg-background text-sm"
            >
              <option value="30_days">30 Days (1 Month)</option>
              <option value="90_days">90 Days (3 Months)</option>
              <option value="1_year">1 Year (365 Days)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 rounded-lg border border-input bg-background text-sm"
            >
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Payment Reference (Optional)</label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g., Transaction ID or Reference Number"
              className="w-full mt-1.5 px-3 py-2 rounded-lg border border-input bg-background text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave blank to use 'MANUAL_ADMIN_ACTIVATION'
            </p>
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg"
          >
            {mutation.isPending ? 'Activating...' : 'Confirm Activation'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function SubscriptionPanel({ companyId }) {
  const queryClient = useQueryClient();

  const { data: subscriptionData, isLoading, refetch } = useQuery({
    queryKey: ['company-subscription-admin', companyId],
    queryFn: () => subscriptionAPI.getCompanySubscriptionAdmin(companyId),
  });

  const lockMutation = useMutation({
    mutationFn: () => subscriptionAPI.lockDashboard(companyId),
    onSuccess: () => {
      toast.success('Dashboard locked');
      queryClient.invalidateQueries({ queryKey: ['company-subscription-admin', companyId] });
      // Also refetch the company detail page to reflect lock status
      queryClient.invalidateQueries({ queryKey: ['sa-company', companyId] });
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.message || 'Failed to lock dashboard';
      toast.error(errorMsg);
      console.error('Lock dashboard error:', err);
    },
  });

  const unlockMutation = useMutation({
    mutationFn: () => subscriptionAPI.unlockDashboard(companyId),
    onSuccess: () => {
      toast.success('Dashboard unlocked');
      queryClient.invalidateQueries({ queryKey: ['company-subscription-admin', companyId] });
      // Also refetch the company detail page to reflect lock status
      queryClient.invalidateQueries({ queryKey: ['sa-company', companyId] });
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.message || 'Failed to unlock dashboard';
      toast.error(errorMsg);
      console.error('Unlock dashboard error:', err);
    },
  });

  const extendTrialMutation = useMutation({
    mutationFn: (days) => subscriptionAPI.extendTrial(companyId, days),
    onSuccess: () => {
      toast.success('Trial extended successfully!');
      queryClient.invalidateQueries({ queryKey: ['company-subscription-admin', companyId] });
      // Also refetch the company detail page
      queryClient.invalidateQueries({ queryKey: ['sa-company', companyId] });
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.message || 'Failed to extend trial';
      toast.error(errorMsg);
      console.error('Extend trial error:', err);
    },
  });

  const handleActivationSuccess = () => {
    // Refetch both subscription and company details
    refetch();
    queryClient.invalidateQueries({ queryKey: ['sa-company', companyId] });
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading subscription info...</div>;

  const sub = subscriptionData?.data;
  if (!sub) return null;

  const paymentStatusInfo = paymentStatusConfig[sub.paymentStatus] || paymentStatusConfig.UNPAID;
  const daysLeft = sub.daysRemaining ?? 0;

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
      <div>
        <h2 className="text-base font-semibold mb-5">Subscription & Manual Activation</h2>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-muted/50 p-3.5 space-y-1.5">
            <p className="text-[11px] text-muted-foreground uppercase font-medium">Plan</p>
            <p className="text-sm font-bold">{sub.planName || sub.plan || 'No Plan'}</p>
          </div>

          <div className="rounded-xl bg-muted/50 p-3.5 space-y-1.5">
            <p className="text-[11px] text-muted-foreground uppercase font-medium">Payment Status</p>
            <Badge className={`text-xs font-medium rounded-md w-fit ${paymentStatusInfo.bg} ${paymentStatusInfo.text}`}>
              {paymentStatusInfo.label}
            </Badge>
          </div>

          <div className="rounded-xl bg-muted/50 p-3.5 space-y-1.5">
            <p className="text-[11px] text-muted-foreground uppercase font-medium">Branch Limit</p>
            <p className="text-sm font-bold">{sub.branchLimit || 1}</p>
          </div>

          <div className="rounded-xl bg-muted/50 p-3.5 space-y-1.5">
            <p className="text-[11px] text-muted-foreground uppercase font-medium">Lock Status</p>
            <Badge variant={sub.isDashboardLocked || sub.isLocked ? 'destructive' : 'outline'} className="text-xs font-medium rounded-md">
              {sub.isDashboardLocked || sub.isLocked ? 'Locked' : 'Unlocked'}
            </Badge>
          </div>
        </div>

        {/* Trial Info */}
        {(sub.trialStartDate || sub.trialEndDate) && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Trial Period</span>
                </div>
                <span className="text-sm font-medium">
                  {formatDateSafe(sub.trialStartDate)} - {formatDateSafe(sub.trialEndDate)}
                </span>
              </div>

              {sub.isTrialActive && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Days Remaining</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{daysLeft}</span>
                </div>
              )}

              {sub.isTrialExpired && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Trial Expired</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Subscription Dates */}
        {(sub.subscriptionStartDate || sub.subscriptionEndDate) && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Subscription Period</span>
                </div>
                <span className="text-sm font-medium">
                  {formatDateSafe(sub.subscriptionStartDate)} - {formatDateSafe(sub.subscriptionEndDate)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Activation Info */}
        {(sub.activatedAt || sub.activatedBy) && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">Activated</span>
              </div>
              {sub.activatedAt && (
                <p className="text-xs text-muted-foreground ml-6">
                  {formatDateSafe(sub.activatedAt)}
                </p>
              )}
            </div>
          </>
        )}

        {/* Latest Activation Request */}
        {sub.latestActivationRequest && (
          <>
            <Separator className="my-4" />
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium text-amber-900">Pending Activation Request</p>
              </div>
              <p className="text-xs text-amber-700">
                Submitted: {formatDateSafe(sub.latestActivationRequest.createdAt)}
              </p>
              <Badge className="bg-amber-200 text-amber-800 text-xs rounded-md">
                {sub.latestActivationRequest.status}
              </Badge>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <Separator />
      <div className="space-y-2.5">
        <ActivationModal companyId={companyId} onSuccess={handleActivationSuccess} />

        <Button
          variant="outline"
          className="w-full rounded-lg"
          onClick={() => extendTrialMutation.mutate(7)}
          disabled={extendTrialMutation.isPending}
        >
          <Calendar className="mr-2 h-4 w-4" /> Extend Trial (+7 days)
        </Button>

        {sub.isDashboardLocked || sub.isLocked ? (
          <Button
            variant="outline"
            className="w-full rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            onClick={() => unlockMutation.mutate()}
            disabled={unlockMutation.isPending}
          >
            <Unlock className="mr-2 h-4 w-4" /> Unlock Dashboard
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full rounded-lg border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => lockMutation.mutate()}
            disabled={lockMutation.isPending}
          >
            <Lock className="mr-2 h-4 w-4" /> Lock Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
