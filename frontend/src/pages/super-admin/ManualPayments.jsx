import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  Filter,
  Hash,
  Phone,
  RefreshCw,
  Search,
  Smartphone,
  X,
  XCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';

const STATUS_LABELS = {
  PENDING_REVIEW: {
    label: 'Pending Review',
    class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    Icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    Icon: XCircle,
  },
};

function Badge({ status }) {
  const cfg = STATUS_LABELS[status] || {
    label: status,
    class: 'bg-gray-100 text-gray-700',
    Icon: Clock,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.class}`}>
      <cfg.Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function ProofModal({ url, open, onClose }) {
  if (!url) return null;
  const isPdf = url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('/pdf');
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Proof of Payment</DialogTitle>
        </DialogHeader>
        <div className="rounded-lg overflow-hidden border bg-muted min-h-48 flex items-center justify-center">
          {isPdf ? (
            <iframe src={url} className="w-full h-[500px]" title="Proof of payment PDF" />
          ) : (
            <img
              src={url}
              alt="Proof of payment"
              className="max-h-[500px] w-auto mx-auto object-contain"
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApproveDialog({ request, open, onClose, onConfirm, isLoading }) {
  if (!request) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <BadgeCheck className="h-5 w-5" />
            Approve Payment & Activate Subscription
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            You are about to approve this payment request. This will:
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>Mark the payment as approved</li>
            <li>Activate the company&apos;s subscription</li>
            <li>
              Set the plan to{' '}
              <strong className="text-foreground">{request.selectedPlan}</strong>
            </li>
            <li>Grant full access for 30 days</li>
            <li>Notify the company</li>
          </ul>
          <div className="rounded-lg border p-3 bg-muted/40 text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Company:</span>{' '}
              <strong>{request.company?.name}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Amount:</span>{' '}
              <strong>GHS {request.amountPaid}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Method:</span>{' '}
              <strong>
                {request.paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : 'Bank Transfer'}
              </strong>
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Approving...' : 'Approve & Activate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({ request, open, onClose, onConfirm, isLoading }) {
  const [reason, setReason] = useState('');
  if (!request) return null;
  const handleConfirm = () => {
    if (!reason.trim()) return toast.error('Rejection reason is required');
    onConfirm(reason);
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Reject Payment Request
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Please provide a reason for rejecting this payment. The company will be notified
            and allowed to resubmit.
          </p>
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Rejection Reason
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Incorrect amount, invalid reference number, etc."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Rejecting...' : 'Reject Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ManualPaymentRequests() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [proofModal, setProofModal] = useState({ open: false, url: null });
  const [approveModal, setApproveModal] = useState({ open: false, request: null });
  const [rejectModal, setRejectModal] = useState({ open: false, request: null });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-activation-requests', statusFilter, page],
    queryFn: () =>
      subscriptionAPI.getAllActivationRequests({
        status: statusFilter || undefined,
        page,
        limit: 20,
      }),
    retry: 1,
  });

  const requests = data?.data?.data || data?.data?.requests || [];
  const pagination = data?.data?.pagination || {};

  // Filter by search locally
  const filtered = search
    ? requests.filter(
        (r) =>
          r.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
          r.paymentReference?.toLowerCase().includes(search.toLowerCase())
      )
    : requests;

  const approveMutation = useMutation({
    mutationFn: (requestId) => subscriptionAPI.approveActivationRequest(requestId),
    onSuccess: () => {
      toast.success('Payment approved. Subscription activated!');
      setApproveModal({ open: false, request: null });
      queryClient.invalidateQueries({ queryKey: ['admin-activation-requests'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to approve payment'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }) =>
      subscriptionAPI.rejectActivationRequest(requestId, reason),
    onSuccess: () => {
      toast.success('Payment request rejected.');
      setRejectModal({ open: false, request: null });
      queryClient.invalidateQueries({ queryKey: ['admin-activation-requests'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to reject payment'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manual Payment Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review, approve, or reject company payment submissions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name or transaction ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm min-w-[160px]"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', status: 'PENDING_REVIEW', color: 'text-amber-600' },
          { label: 'Approved', status: 'APPROVED', color: 'text-green-600' },
          { label: 'Rejected', status: 'REJECTED', color: 'text-red-600' },
        ].map(({ label, status, color }) => {
          const count = requests.filter((r) => r.status === status).length;
          return (
            <Card
              key={status}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
            >
              <CardContent className="pt-4 pb-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{count}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Payment Requests
            {filtered.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filtered.length} shown)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              Loading payment requests...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payment requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-xl p-4 space-y-3 hover:border-primary/40 transition-colors"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">{request.company?.name}</p>
                        <p className="text-xs text-muted-foreground">{request.company?.email}</p>
                      </div>
                    </div>
                    <Badge status={request.status} />
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="font-medium">{request.selectedPlan}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-medium">GHS {request.amountPaid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Method</p>
                      <p className="font-medium">
                        {request.paymentMethod === 'MOBILE_MONEY'
                          ? 'Mobile Money'
                          : 'Bank Transfer'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="font-medium">
                        {new Date(request.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {request.paymentMethod === 'MOBILE_MONEY' ? (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">Network</p>
                          <p className="font-medium">{request.network || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone Number</p>
                          <p className="font-medium font-mono">
                            {request.paymentPhoneNumber || '—'}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-muted-foreground">Transaction ID</p>
                          <p className="font-medium font-mono">
                            {request.transactionId || request.paymentReference || '—'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">Bank</p>
                          <p className="font-medium">{request.bankName || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Account Name Used</p>
                          <p className="font-medium">{request.accountNameUsed || '—'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-muted-foreground">Reference Number</p>
                          <p className="font-medium font-mono">{request.paymentReference}</p>
                        </div>
                      </>
                    )}

                    <div>
                      <p className="text-xs text-muted-foreground">Payment Date</p>
                      <p className="font-medium">
                        {new Date(request.paymentDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {request.note && (
                      <div className="md:col-span-3">
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className="font-medium">{request.note}</p>
                      </div>
                    )}
                  </div>

                  {request.rejectionReason && (
                    <Alert variant="destructive" className="mt-1">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Rejection reason:</strong> {request.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {request.proofOfPaymentUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setProofModal({ open: true, url: request.proofOfPaymentUrl })
                        }
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View Proof
                      </Button>
                    )}

                    {request.status === 'PENDING_REVIEW' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => setApproveModal({ open: true, request })}
                        >
                          <BadgeCheck className="h-3.5 w-3.5 mr-1.5" />
                          Approve & Activate
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRejectModal({ open: true, request })}
                        >
                          <X className="h-3.5 w-3.5 mr-1.5" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ProofModal
        url={proofModal.url}
        open={proofModal.open}
        onClose={() => setProofModal({ open: false, url: null })}
      />

      <ApproveDialog
        request={approveModal.request}
        open={approveModal.open}
        onClose={() => setApproveModal({ open: false, request: null })}
        onConfirm={() => approveMutation.mutate(approveModal.request.id)}
        isLoading={approveMutation.isPending}
      />

      <RejectDialog
        request={rejectModal.request}
        open={rejectModal.open}
        onClose={() => setRejectModal({ open: false, request: null })}
        onConfirm={(reason) =>
          rejectMutation.mutate({ requestId: rejectModal.request.id, reason })
        }
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
