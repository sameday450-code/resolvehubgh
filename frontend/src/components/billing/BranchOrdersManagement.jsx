import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchOrderAPI } from '../lib/api';
import { PageLoading, ErrorState, EmptyState } from './shared';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ShoppingCart, Check, X, Eye, Calendar, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function BranchOrdersManagement() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-branch-orders'],
    queryFn: () => branchOrderAPI.getAllOrders({ limit: 100, status: '' }),
  });

  const approveMutation = useMutation({
    mutationFn: (data) => branchOrderAPI.approveOrder(data.orderId, { adminNotes: data.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-branch-orders']);
      setSelectedOrder(null);
      setReviewNotes('');
      setShowDetails(false);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (data) => branchOrderAPI.rejectOrder(data.orderId, { 
      rejectionReason: data.reason,
      adminNotes: data.notes,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-branch-orders']);
      setSelectedOrder(null);
      setRejectionReason('');
      setReviewNotes('');
      setShowDetails(false);
    },
  });

  const orders = data?.data?.data || [];
  const pendingOrders = orders.filter(o => o.status === 'PAYMENT_PENDING_APPROVAL' || o.status === 'PENDING_PAYMENT');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const rejectedOrders = orders.filter(o => o.status === 'REJECTED');

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAYMENT_PENDING_APPROVAL':
      case 'PENDING_PAYMENT':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-300';
    }
  };

  const renderOrderCard = (order) => (
    <Card key={order.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
      setSelectedOrder(order);
      setShowDetails(true);
    }}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-semibold">{order.company.name}</p>
              <p className="text-sm text-muted-foreground">{order.company.email}</p>
            </div>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status === 'PAYMENT_PENDING_APPROVAL' ? 'Pending Approval' : order.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4 py-3 border-y border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="text-lg font-bold">{order.quantity}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-lg font-bold">{order.totalCost} GHS</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Payment Method</p>
            <p className="text-sm font-medium">
              {order.paymentMethod === 'MOBILE_MONEY' ? '📱' : '🏦'} {order.paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : 'Bank Transfer'}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(order);
              setShowDetails(true);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Branch Orders</h1>
        <p className="text-muted-foreground mt-1">Manage manual branch payment orders</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingOrders.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-500 text-xs font-bold text-white">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No pending orders"
              description="All branch payment orders have been reviewed."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingOrders.map(renderOrderCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <EmptyState
              icon={Check}
              title="No completed orders"
              description="Completed branch orders will appear here."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedOrders.map(renderOrderCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedOrders.length === 0 ? (
            <EmptyState
              icon={X}
              title="No rejected orders"
              description="Rejected orders will appear here."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rejectedOrders.map(renderOrderCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Branch Order Details</DialogTitle>
            <DialogDescription>
              Review and manage this branch payment order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company Name:</span>
                    <span className="font-medium">{selectedOrder.company.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{selectedOrder.company.email}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status === 'PAYMENT_PENDING_APPROVAL' ? 'Pending Approval' : selectedOrder.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Branches Requested:</span>
                    <span className="font-medium">{selectedOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost per Branch:</span>
                    <span className="font-medium">{selectedOrder.costPerBranch} GHS</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground font-medium">Total Amount:</span>
                    <span className="font-bold text-lg">{selectedOrder.totalCost} GHS</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-medium">
                      {selectedOrder.paymentMethod === 'MOBILE_MONEY' ? '📱 Mobile Money' : '🏦 Bank Transfer'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Date:</span>
                    <span className="font-medium">
                      {new Date(selectedOrder.paymentDate).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedOrder.paymentMethod === 'MOBILE_MONEY' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network:</span>
                        <span className="font-medium">{selectedOrder.network}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone Number:</span>
                        <span className="font-medium">{selectedOrder.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <span className="font-mono">{selectedOrder.mobileMoneyTxnId}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bank:</span>
                        <span className="font-medium">{selectedOrder.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reference:</span>
                        <span className="font-mono">{selectedOrder.bankTxnReference}</span>
                      </div>
                    </>
                  )}
                  {selectedOrder.proofOfPaymentUrl && (
                    <div className="mt-3 pt-3 border-t">
                      <a
                        href={selectedOrder.proofOfPaymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        📎 View Proof of Payment
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Branch Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Branch Details ({selectedOrder.branchRequests.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-48 overflow-y-auto">
                  {selectedOrder.branchRequests.map((req, idx) => (
                    <div key={req.id} className="p-3 bg-muted/50 rounded text-sm">
                      <p className="font-medium mb-1">Branch {idx + 1}: {req.name}</p>
                      {req.city && <p className="text-muted-foreground">📍 {req.city}, {req.region}</p>}
                      {req.contactPhone && <p className="text-muted-foreground">📱 {req.contactPhone}</p>}
                      {req.contactEmail && <p className="text-muted-foreground">✉️ {req.contactEmail}</p>}
                      {req.branchId && <p className="text-green-600 text-xs">✓ Created (ID: {req.branchId})</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              {selectedOrder.status === 'PAYMENT_PENDING_APPROVAL' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="notes">Review Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add any notes about this approval..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => approveMutation.mutate({ orderId: selectedOrder.id, notes: reviewNotes })}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve & Create Branches
                    </Button>
                    <Button
                      onClick={() => {
                        // Show rejection form
                        const reason = prompt('Enter rejection reason:');
                        if (reason) {
                          rejectMutation.mutate({ 
                            orderId: selectedOrder.id, 
                            reason,
                            notes: reviewNotes,
                          });
                        }
                      }}
                      disabled={rejectMutation.isPending}
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
