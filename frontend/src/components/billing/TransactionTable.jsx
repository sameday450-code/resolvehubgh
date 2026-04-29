import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  ChevronDown,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { formatDate } from '../../lib/dateUtils';

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    label: 'Pending',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  SUCCESS: {
    icon: CheckCircle,
    label: 'Successful',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  FAILED: {
    icon: AlertCircle,
    label: 'Failed',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
  REFUNDED: {
    icon: RefreshCw,
    label: 'Refunded',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
};

const GATEWAY_LABELS = {
  PAYSTACK: '🟢 Paystack',
  STRIPE: '🔵 Stripe',
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export default function TransactionTable({ transactions = [], isLoading = false, onRetry }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg border-dashed bg-muted/30">
        <p className="text-muted-foreground">No transactions yet</p>
        <p className="text-sm text-muted-foreground">
          Your payment transactions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.map((tx) => (
              <div key={tx.id}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() =>
                    setExpandedRow(expandedRow === tx.id ? null : tx.id)
                  }
                >
                  <TableCell className="font-medium">
                    {formatDate(new Date(tx.createdAt), 'MMM dd, yyyy')}
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatDate(new Date(tx.createdAt), 'hh:mm a')}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="font-semibold">
                      ₵{(tx.amount / 100).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {tx.currency}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm">
                    {GATEWAY_LABELS[tx.gateway] || tx.gateway}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={tx.status} />
                  </TableCell>

                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {tx.providerReference.substring(0, 12)}...
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedRow(
                              expandedRow === tx.id ? null : tx.id
                            );
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>

                        {tx.status === 'FAILED' && onRetry && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onRetry(tx);
                            }}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Payment
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // Trigger download receipt
                            window.open(
                              `/receipts/${tx.id}`,
                              '_blank'
                            );
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Receipt
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {/* Expanded Details Row */}
                {expandedRow === tx.id && (
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell colSpan="6" className="py-4">
                      <div className="space-y-4">
                        {/* Transaction Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              Transaction ID
                            </p>
                            <p className="text-sm font-mono text-foreground mt-1">
                              {tx.id}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              Provider Reference
                            </p>
                            <p className="text-sm font-mono text-foreground mt-1">
                              {tx.providerReference}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              Status
                            </p>
                            <p className="mt-1">
                              <StatusBadge status={tx.status} />
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              Gateway
                            </p>
                            <p className="text-sm text-foreground mt-1">
                              {GATEWAY_LABELS[tx.gateway] || tx.gateway}
                            </p>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="border-t pt-4">
                          <p className="text-xs font-medium text-muted-foreground uppercase mb-3">
                            Timeline
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Created
                              </span>
                              <span className="font-mono">
                                {formatDate(
                                  new Date(tx.createdAt),
                                  'MMM dd, yyyy hh:mm a'
                                )}
                              </span>
                            </div>

                            {tx.paidAt && (
                              <div className="flex justify-between text-green-700 dark:text-green-400">
                                <span>Paid</span>
                                <span className="font-mono">
                                  {formatDate(
                                    new Date(tx.paidAt),
                                    'MMM dd, yyyy hh:mm a'
                                  )}
                                </span>
                              </div>
                            )}

                            {tx.failedAt && (
                              <div className="flex justify-between text-red-700 dark:text-red-400">
                                <span>Failed</span>
                                <span className="font-mono">
                                  {formatDate(
                                    new Date(tx.failedAt),
                                    'MMM dd, yyyy hh:mm a'
                                  )}
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Updated
                              </span>
                              <span className="font-mono">
                                {formatDate(
                                  new Date(tx.updatedAt),
                                  'MMM dd, yyyy hh:mm a'
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Failure Reason */}
                        {tx.failureReason && (
                          <div className="border-t pt-4">
                            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                              Failure Reason
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-200/30">
                              {tx.failureReason}
                            </p>
                          </div>
                        )}

                        {/* Metadata */}
                        {tx.metadata && Object.keys(tx.metadata).length > 0 && (
                          <div className="border-t pt-4">
                            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                              Additional Info
                            </p>
                            <div className="bg-muted/30 p-2 rounded text-sm font-mono text-muted-foreground">
                              <pre>{JSON.stringify(tx.metadata, null, 2)}</pre>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {tx.status === 'FAILED' && onRetry && (
                          <div className="border-t pt-4">
                            <Button
                              onClick={() => onRetry(tx)}
                              variant="destructive"
                              size="sm"
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Retry Payment
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </div>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
