import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
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
import { superAdminAPI } from '../../lib/api';

const STATUS_LABELS = {
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    Icon: Clock,
  },
  COMPLETED: {
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

const PAYMENT_METHODS = {
  MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Bank Transfer',
};

function StatusBadge({ status }) {
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

function ApproveDialog({ order, open, onClose, onConfirm, isLoading }) {
  if (!order) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <BadgeCheck className="h-5 w-5" />
            Approve Branch Payment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            You are about to approve this branch upgrade payment. This will:
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>Mark the payment as approved</li>
            <li>Increase company's branch limit by {order.branches}</li>
            <li>Allow the company to create additional branches</li>
            <li>Send confirmation email to the company</li>
          </ul>
          <div className="rounded-lg border p-3 bg-muted/40 text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Company:</span>{' '}
              <strong>{order.company?.name}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Branches:</span>{' '}
              <strong>{order.branches}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Amount:</span>{' '}
              <strong>GHS {order.amount}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Method:</span>{' '}
              <strong>{PAYMENT_METHODS[order.paymentMethod] || order.paymentMethod}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Reference:</span>{' '}
              <strong className="break-all">{order.paymentReference}</strong>
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
            {isLoading ? 'Approving...' : 'Approve & Update Limit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({ order, open, onClose, onConfirm, isLoading }) {
  const [reason, setReason] = useState('');
  if (!order) return null;
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
            Please provide a reason for rejecting this payment. The company will be notified.
          </p>
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Rejection Reason
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Incorrect amount, invalid reference number, duplicate submission, etc."
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

export default function BranchPayments() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [approveModal, setApproveModal] = useState({ open: false, order: null });
  const [rejectModal, setRejectModal] = useState({ open: false, order: null });

  // Mock API call - replace with actual API
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-branch-payments', statusFilter, page],
    queryFn: async () => {
      const result = await superAdminAPI.listBranchPayments({
        status: statusFilter || undefined,
        page,
        limit: 20,
      });
      return result.data;
    },
    retry: 1,
  });

  const orders = data?.data || [];
  const pagination = data?.pagination || {};

  // Filter by search locally
  const filtered = search
    ? orders.filter(
        (o) =>
          o.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
          o.id?.toLowerCase().includes(search.toLowerCase()) ||
          o.paymentReference?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const approveMutation = useMutation({
    mutationFn: (orderId) => superAdminAPI.approveBranchPayment(orderId),
    onSuccess: () => {
      toast.success('Branch payment approved and limit updated!');
      setApproveModal({ open: false, order: null });
      queryClient.invalidateQueries({ queryKey: ['admin-branch-payments'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to approve payment'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ orderId, reason }) =>
      superAdminAPI.rejectBranchPayment(orderId, { reason }),
    onSuccess: () => {
      toast.success('Payment request rejected and company notified.');
      setRejectModal({ open: false, order: null });
      queryClient.invalidateQueries({ queryKey: ['admin-branch-payments'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to reject payment'),
  });

  const handleApprove = (order) => {
    setApproveModal({ open: true, order });
  };

  const handleReject = (order) => {
    setRejectModal({ open: true, order });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branch Upgrade Payments</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve branch upgrade payments from companies
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
                placeholder="Search by company name or reference number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm min-w-[160px]"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="COMPLETED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <Alert>
          <AlertDescription>
            {orders.length === 0 ? (
              <>No branch payment requests found. Companies will submit payments when they hit their branch limit.</>
            ) : (
              <>No results match your search.</>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-4 pb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <h3 className="font-semibold truncate">{order.company?.name}</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                        Branches
                      </p>
                      <p className="font-medium">{order.branches}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                        Amount
                      </p>
                      <p className="font-medium">GHS {order.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                        Method
                      </p>
                      <p className="font-medium">
                        {PAYMENT_METHODS[order.paymentMethod] || order.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                        Requested
                      </p>
                      <p className="font-medium">
                        {new Date(order.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Reference: <span className="font-mono text-foreground">{order.paymentReference}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge status={order.status} />
                  {order.status === 'PENDING_APPROVAL' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                        onClick={() => handleReject(order)}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(order)}
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination info */}
      {!isLoading && filtered.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {Math.min((page - 1) * 20 + 1, pagination.total)} to{' '}
          {Math.min(page * 20, pagination.total)} of {pagination.total} payments
        </div>
      )}

      {/* Dialogs */}
      <ApproveDialog
        order={approveModal.order}
        open={approveModal.open}
        onClose={() => setApproveModal({ open: false, order: null })}
        onConfirm={() => {
          approveMutation.mutate(approveModal.order.id);
        }}
        isLoading={approveMutation.isPending}
      />

      <RejectDialog
        order={rejectModal.order}
        open={rejectModal.open}
        onClose={() => setRejectModal({ open: false, order: null })}
        onConfirm={(reason) => {
          rejectMutation.mutate({ orderId: rejectModal.order.id, reason });
        }}
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
