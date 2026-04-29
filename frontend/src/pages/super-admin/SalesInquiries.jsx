import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactSalesAPI } from '../../lib/api';
import { MessageSquareWarning, Search, Filter, MoreHorizontal, Mail, Phone, Globe, MapPin, Users, Calendar, ChevronLeft, ChevronRight, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { PageLoading, ErrorState, EmptyState } from '../../components/shared';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'CLOSED', label: 'Closed' },
];

const statusConfig = {
  NEW: { bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-500' },
  CONTACTED: { bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500' },
  IN_PROGRESS: { bg: 'bg-purple-500/10', text: 'text-purple-600', dot: 'bg-purple-500' },
  CONVERTED: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  CLOSED: { bg: 'bg-gray-500/10', text: 'text-gray-600', dot: 'bg-gray-400' },
};

export default function SASalesInquiries() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sa-sales-inquiries', { search, status, page }],
    queryFn: () => contactSalesAPI.getInquiries({ page, limit: 10, status: status === 'ALL' ? '' : status }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }) => contactSalesAPI.updateInquiry(id, { status: newStatus }),
    onSuccess: () => {
      toast.success('Inquiry status updated');
      queryClient.invalidateQueries({ queryKey: ['sa-sales-inquiries'] });
      setShowDetailModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const addNotesMutation = useMutation({
    mutationFn: ({ id, notes }) => contactSalesAPI.updateInquiry(id, { adminNotes: notes }),
    onSuccess: () => {
      toast.success('Notes updated');
      queryClient.invalidateQueries({ queryKey: ['sa-sales-inquiries'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const inquiries = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  const handleViewDetail = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Inquiries</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage custom plan inquiries from potential customers</p>
        </div>
        {pagination.total > 0 && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <MessageSquareWarning className="h-3.5 w-3.5" />
            {pagination.total} total
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Search by company, email, or contact name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-10 rounded-xl border-muted-foreground/15 focus-visible:ring-primary/20"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[180px] h-10 rounded-xl border-muted-foreground/15">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground/50" />
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {inquiries.length === 0 ? (
        <EmptyState icon={MessageSquareWarning} title="No inquiries found" description="No sales inquiries match your current filters." />
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const sc = statusConfig[inquiry.status] || statusConfig.NEW;
            return (
              <div
                key={inquiry.id}
                className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Main info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="mt-1 flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors shrink-0">
                        <MessageSquareWarning className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base leading-tight">{inquiry.companyName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{inquiry.contactName}</p>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-13">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <a href={`mailto:${inquiry.contactEmail}`} className="hover:text-primary transition-colors truncate">
                          {inquiry.contactEmail}
                        </a>
                      </div>
                      {inquiry.contactPhone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <a href={`tel:${inquiry.contactPhone}`} className="hover:text-primary transition-colors">
                            {inquiry.contactPhone}
                          </a>
                        </div>
                      )}
                      {inquiry.country && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          {inquiry.country}
                        </div>
                      )}
                      {inquiry.industry && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4 flex-shrink-0" />
                          {inquiry.industry}
                        </div>
                      )}
                    </div>

                    {/* Requirements preview */}
                    {inquiry.requirements && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Requirements</p>
                        <p className="text-sm text-foreground line-clamp-2">{inquiry.requirements}</p>
                      </div>
                    )}
                  </div>

                  {/* Right side: Status and actions */}
                  <div className="flex items-start gap-3 md:flex-col md:items-end">
                    <div className="flex-1 md:flex-none">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {inquiry.status}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground md:text-right">
                      <Calendar className="h-3.5 w-3.5 hidden md:block" />
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </div>

                    {/* Action menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-70 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 rounded-xl p-1">
                        <DropdownMenuItem onClick={() => handleViewDetail(inquiry)} className="rounded-lg cursor-pointer">
                          <ExternalLink className="mr-2 h-4 w-4" /> View Full Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {inquiry.status !== 'CONVERTED' && inquiry.status !== 'CLOSED' && (
                          <>
                            {inquiry.status !== 'CONTACTED' && (
                              <DropdownMenuItem
                                onClick={() => updateStatusMutation.mutate({ id: inquiry.id, newStatus: 'CONTACTED' })}
                                className="rounded-lg cursor-pointer"
                              >
                                <Phone className="mr-2 h-4 w-4" /> Mark Contacted
                              </DropdownMenuItem>
                            )}
                            {inquiry.status !== 'IN_PROGRESS' && (
                              <DropdownMenuItem
                                onClick={() => updateStatusMutation.mutate({ id: inquiry.id, newStatus: 'IN_PROGRESS' })}
                                className="rounded-lg cursor-pointer text-purple-600"
                              >
                                <Users className="mr-2 h-4 w-4" /> Mark In Progress
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ id: inquiry.id, newStatus: 'CONVERTED' })}
                              className="rounded-lg cursor-pointer text-emerald-600"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Converted
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => updateStatusMutation.mutate({ id: inquiry.id, newStatus: 'CLOSED' })}
                          className="rounded-lg cursor-pointer"
                        >
                          Close Inquiry
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.pages} • {pagination.total} total
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl border border-border/40 bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-card/95 backdrop-blur-sm">
              <h2 className="text-lg font-bold">{selectedInquiry.companyName}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg"
              >
                ✕
              </Button>
            </div>

            {/* Modal content */}
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contact Name</p>
                    <p className="text-sm font-medium">{selectedInquiry.contactName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <a href={`mailto:${selectedInquiry.contactEmail}`} className="text-sm font-medium text-primary hover:underline">
                      {selectedInquiry.contactEmail}
                    </a>
                  </div>
                  {selectedInquiry.contactPhone && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Phone</p>
                      <a href={`tel:${selectedInquiry.contactPhone}`} className="text-sm font-medium text-primary hover:underline">
                        {selectedInquiry.contactPhone}
                      </a>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Country</p>
                    <p className="text-sm font-medium">{selectedInquiry.country || '—'}</p>
                  </div>
                  {selectedInquiry.industry && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Industry</p>
                      <p className="text-sm font-medium">{selectedInquiry.industry}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Scale */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Scale & Requirements</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedInquiry.estimatedBranches && (
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                      <p className="text-xs text-muted-foreground mb-1">Expected Branches</p>
                      <p className="text-lg font-bold">{selectedInquiry.estimatedBranches}</p>
                    </div>
                  )}
                  {selectedInquiry.estimatedUsers && (
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                      <p className="text-xs text-muted-foreground mb-1">Expected Users</p>
                      <p className="text-lg font-bold">{selectedInquiry.estimatedUsers}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Requirements */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Requirements & Custom Needs</h3>
                <div className="p-4 rounded-lg bg-muted/40 border border-border/40">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedInquiry.requirements}</p>
                </div>
              </div>

              {/* Status & Timeline */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Status & Timeline</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Status</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig[selectedInquiry.status]?.bg} ${statusConfig[selectedInquiry.status]?.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig[selectedInquiry.status]?.dot}`} />
                        {selectedInquiry.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                    <p className="text-sm font-medium">{new Date(selectedInquiry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Admin Notes</h3>
                <textarea
                  defaultValue={selectedInquiry.adminNotes || ''}
                  placeholder="Add internal notes about this inquiry..."
                  rows={4}
                  onChange={(e) => {
                    // Allow editing
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
                />
              </div>

              {/* Status update buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {selectedInquiry.status !== 'CONTACTED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: selectedInquiry.id, newStatus: 'CONTACTED' })}
                    disabled={updateStatusMutation.isPending}
                    className="rounded-lg"
                  >
                    Mark Contacted
                  </Button>
                )}
                {selectedInquiry.status !== 'IN_PROGRESS' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: selectedInquiry.id, newStatus: 'IN_PROGRESS' })}
                    disabled={updateStatusMutation.isPending}
                    className="rounded-lg"
                  >
                    Mark In Progress
                  </Button>
                )}
                {selectedInquiry.status !== 'CONVERTED' && selectedInquiry.status !== 'CLOSED' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: selectedInquiry.id, newStatus: 'CONVERTED' })}
                    disabled={updateStatusMutation.isPending}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                  >
                    Mark Converted
                  </Button>
                )}
                {selectedInquiry.status !== 'CLOSED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: selectedInquiry.id, newStatus: 'CLOSED' })}
                    disabled={updateStatusMutation.isPending}
                    className="rounded-lg ml-auto"
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
