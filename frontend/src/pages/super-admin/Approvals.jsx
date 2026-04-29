import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminAPI } from '../../lib/api';
import {
  Building2, Search, CheckCircle2, XCircle, Clock, Calendar, Mail, MapPin,
  AlertCircle, ArrowRight, Loader2, X,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { PageLoading, ErrorState, EmptyState } from '../../components/shared';
import toast from 'react-hot-toast';
import { formatDateTime } from '../../lib/utils';

export default function SAPendingApprovals() {
  const [search, setSearch] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sa-approvals', search],
    queryFn: () => superAdminAPI.getCompanies({ status: 'PENDING', search, limit: 50 }),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => superAdminAPI.approveCompany(id),
    onSuccess: () => {
      toast.success('✓ Company approved! Email notification sent.');
      queryClient.invalidateQueries({ queryKey: ['sa-approvals'] });
      setApprovingId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to approve company');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => superAdminAPI.rejectCompany(id, reason || 'Does not meet platform requirements'),
    onSuccess: () => {
      toast.success('✓ Company rejected! Notification sent.');
      queryClient.invalidateQueries({ queryKey: ['sa-approvals'] });
      setRejectingId(null);
      setRejectReason('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reject company');
    },
  });

  const companies = data?.data?.data || [];

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  const pendingCount = companies.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Approvals</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and approve pending company registrations</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-200/50">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-600">{pendingCount} pending</span>
          </div>
        )}
      </div>

      {/* Search */}
      {pendingCount > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      )}

      {/* Empty state */}
      {pendingCount === 0 ? (
        <EmptyState
          title="No pending approvals"
          description="All company registrations have been reviewed. Great work!"
          icon={CheckCircle2}
        />
      ) : (
        <>
          {/* Approvals list */}
          <div className="space-y-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className="relative rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md hover:border-border/80 transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  {/* Company avatar */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Company info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-foreground truncate">{company.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{company.industry || 'Industry not specified'}</p>
                      </div>
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 shrink-0">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>

                    {/* Company details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {/* Email */}
                      <div className="flex items-start gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs mb-0.5">Registration Email</p>
                          <p className="text-foreground truncate font-medium">{company.email}</p>
                        </div>
                      </div>

                      {/* Location */}
                      {company.city && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-muted-foreground text-xs mb-0.5">Location</p>
                            <p className="text-foreground truncate font-medium">
                              {company.city}{company.country ? `, ${company.country}` : ''}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Registration date */}
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs mb-0.5">Registered</p>
                          <p className="text-foreground font-medium">{formatDateTime(company.createdAt)}</p>
                        </div>
                      </div>

                      {/* Branch count */}
                      <div className="flex items-start gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-xs mb-0.5">Branches</p>
                          <p className="text-foreground font-medium">{company.branchCount || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2 border-t border-border/50">
                      <Button
                        onClick={() => setApprovingId(company.id)}
                        disabled={approveMutation.isPending}
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/10 text-white"
                      >
                        {approveMutation.isPending && approvingId === company.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => setRejectingId(company.id)}
                        disabled={rejectMutation.isPending}
                        variant="outline"
                        className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                      >
                        {rejectMutation.isPending && rejectingId === company.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info banner */}
          <div className="rounded-xl border border-blue-200/50 bg-blue-50 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Approval Workflow</p>
              <p className="text-blue-800">
                Once approved, a confirmation email will be sent to the company within 3 minutes. They'll then be able to log in and access their dashboard.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Approval confirmation dialog */}
      <Dialog open={!!approvingId} onOpenChange={(open) => !open && setApprovingId(null)}>
        <DialogContent className="rounded-2xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Approve Company Registration?</DialogTitle>
            <DialogDescription>
              <div className="space-y-3 mt-3">
                <p>
                  This company will be approved and gain access to their dashboard. A confirmation email will be sent to their registration email address.
                </p>
                <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Company</p>
                  <p className="font-medium text-foreground">
                    {companies.find((c) => c.id === approvingId)?.name}
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setApprovingId(null)}
              disabled={approveMutation.isPending}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() => approveMutation.mutate(approvingId)}
              disabled={approveMutation.isPending}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection dialog */}
      <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent className="rounded-2xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Company Registration?</DialogTitle>
            <DialogDescription>
              <div className="space-y-3 mt-3">
                <p>This company will be rejected and a notification will be sent to their email address.</p>
                <div className="bg-muted/50 rounded-lg p-3 border border-border/50 mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Company</p>
                  <p className="font-medium text-foreground">
                    {companies.find((c) => c.id === rejectingId)?.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Reason (optional)</label>
                  <textarea
                    placeholder="Enter reason for rejection (will be sent to company)..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setRejectingId(null)}
              disabled={rejectMutation.isPending}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                rejectMutation.mutate({ id: rejectingId, reason: rejectReason })
              }
              disabled={rejectMutation.isPending}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
