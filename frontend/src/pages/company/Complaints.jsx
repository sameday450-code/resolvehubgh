import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintAPI } from '../../lib/api';
import { PageLoading, ErrorState, EmptyState } from '../../components/shared';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  MessageSquareWarning,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { useEffect } from 'react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REJECTED', label: 'Rejected' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'COMPLAINT', label: 'Complaint' },
  { value: 'FEEDBACK', label: 'Feedback' },
];

const statusVariant = (s) => {
  if (s === 'NEW') return 'default';
  if (s === 'RESOLVED' || s === 'CLOSED') return 'secondary';
  if (s === 'REJECTED') return 'destructive';
  return 'outline';
};

const priorityVariant = (p) => {
  if (p === 'URGENT') return 'destructive';
  if (p === 'HIGH') return 'destructive';
  return 'secondary';
};

export default function Complaints() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', type: '' });

  const params = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(filters.status && { status: filters.status }),
    ...(filters.priority && { priority: filters.priority }),
    ...(filters.type && { type: filters.type }),
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['complaints', params],
    queryFn: () => complaintAPI.getAll(params),
  });

  useEffect(() => {
    if (!socket) return;
    const handler = () => refetch();
    socket.on('complaint:new', handler);
    socket.on('complaint:updated', handler);
    return () => {
      socket.off('complaint:new', handler);
      socket.off('complaint:updated', handler);
    };
  }, [socket, refetch]);

  const complaints = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', type: '' });
    setSearch('');
    setSearchInput('');
    setPage(1);
  };

  const hasActiveFilters = filters.status || filters.priority || filters.type || search;

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complaints & Feedback</h1>
          <p className="text-muted-foreground mt-1">Manage all incoming complaints and feedback</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {pagination ? `${pagination.total} total` : 'Loading...'}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50/80 to-white dark:from-slate-900/40 dark:to-slate-900/20">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, reference, customer..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                />
              </div>
            </form>
            <div className="flex flex-wrap gap-2">
              <Select value={filters.status} onValueChange={(v) => handleFilter('status', v)}>
                <SelectTrigger className="w-[150px] bg-white dark:bg-slate-900/60">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value || '_all'}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.priority} onValueChange={(v) => handleFilter('priority', v)}>
                <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900/60">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value || '_all'}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.type} onValueChange={(v) => handleFilter('type', v)}>
                <SelectTrigger className="w-[130px] bg-white dark:bg-slate-900/60">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value || '_all'}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="No complaints found"
          description={hasActiveFilters ? 'Try adjusting your filters.' : 'When customers submit complaints via QR codes, they will appear here.'}
          action={hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Clear filters</Button>}
        />
      ) : (
        <div className="space-y-2">
          {/* Table-style on desktop, cards on mobile */}
          <div className="hidden md:block">
            <div className="rounded-2xl border-0 bg-card shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/60 dark:to-slate-800/30">
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Reference</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Branch</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/40 transition-colors group">
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">{c.referenceNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[250px]">
                          <p className="text-sm font-medium truncate">{c.title}</p>
                          {c.type === 'FEEDBACK' && (
                            <Badge variant="outline" className="text-[10px] mt-0.5">Feedback</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{c.branch?.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{c.category?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(c.status)} className="text-[11px]">
                          {c.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={priorityVariant(c.priority)} className="text-[11px]">
                          {c.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link to={`/dashboard/complaints/${c.id}`}>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {complaints.map((c) => (
              <Link key={c.id} to={`/dashboard/complaints/${c.id}`}>
                <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-800/40">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm font-semibold truncate">{c.title}</p>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5 bg-muted/60 inline-block px-1.5 py-0.5 rounded">{c.referenceNumber}</p>
                      </div>
                      <Badge variant={priorityVariant(c.priority)} className="text-[10px] shrink-0">
                        {c.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={statusVariant(c.status)} className="text-[10px]">{c.status.replace('_', ' ')}</Badge>
                      <span className="text-[11px] text-muted-foreground">{c.branch?.name}</span>
                      <span className="text-[11px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 px-1">
              <p className="text-[13px] text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-semibold text-foreground">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-semibold text-foreground">{pagination.total}</span>
              </p>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-8 w-8 p-0 border-slate-200 dark:border-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center px-3 text-[13px] font-medium text-muted-foreground bg-muted/40 rounded-md">
                  {pagination.page} / {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 w-8 p-0 border-slate-200 dark:border-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
