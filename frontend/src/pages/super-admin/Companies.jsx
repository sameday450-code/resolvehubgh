import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { superAdminAPI } from '../../lib/api';
import { Building2, Search, Filter, MoreHorizontal, CheckCircle, XCircle, Pause, Play, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
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
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'REJECTED', label: 'Rejected' },
];

const statusConfig = {
  ACTIVE: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500' },
  SUSPENDED: { bg: 'bg-red-500/10', text: 'text-red-600', dot: 'bg-red-500' },
  REJECTED: { bg: 'bg-gray-500/10', text: 'text-gray-600', dot: 'bg-gray-400' },
};

export default function SACompanies() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sa-companies', { search, status, page }],
    queryFn: () => superAdminAPI.getCompanies({ search, status: status === 'ALL' ? '' : status, page, limit: 10 }),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => superAdminAPI.approveCompany(id),
    onSuccess: () => { toast.success('Company approved'); queryClient.invalidateQueries({ queryKey: ['sa-companies'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => superAdminAPI.rejectCompany(id, reason),
    onSuccess: () => { toast.success('Company rejected'); queryClient.invalidateQueries({ queryKey: ['sa-companies'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }) => superAdminAPI.suspendCompany(id, reason),
    onSuccess: () => { toast.success('Company suspended'); queryClient.invalidateQueries({ queryKey: ['sa-companies'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const reactivateMutation = useMutation({
    mutationFn: (id) => superAdminAPI.reactivateCompany(id),
    onSuccess: () => { toast.success('Company reactivated'); queryClient.invalidateQueries({ queryKey: ['sa-companies'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const companies = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all registered companies on the platform</p>
        </div>
        {pagination.total > 0 && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Building2 className="h-3.5 w-3.5" />
            {pagination.total} total
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Search companies..."
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
      {companies.length === 0 ? (
        <EmptyState icon={Building2} title="No companies found" description="No companies match your current filters." />
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Company</th>
                  <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Industry</th>
                  <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-center p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Branches</th>
                  <th className="text-center p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Complaints</th>
                  <th className="text-right p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {companies.map((company) => {
                  const sc = statusConfig[company.status] || statusConfig.REJECTED;
                  return (
                    <tr key={company.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{company.name}</p>
                            <p className="text-xs text-muted-foreground">{company.contactEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">{company.industry || '—'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {company.status}
                        </span>
                      </td>
                      <td className="p-4 text-center text-muted-foreground hidden lg:table-cell">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-muted/60 text-xs font-medium">
                          {company._count?.branches ?? 0}
                        </span>
                      </td>
                      <td className="p-4 text-center text-muted-foreground hidden lg:table-cell">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-muted/60 text-xs font-medium">
                          {company._count?.complaints ?? 0}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-70 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                              <Link to={`/super-admin/companies/${company.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {company.status === 'PENDING' && (
                              <>
                                <DropdownMenuItem onClick={() => approveMutation.mutate(company.id)} className="text-emerald-600 cursor-pointer rounded-lg">
                                  <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => rejectMutation.mutate({ id: company.id, reason: 'Does not meet requirements' })} className="text-destructive cursor-pointer rounded-lg">
                                  <XCircle className="mr-2 h-4 w-4" /> Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {company.status === 'ACTIVE' && (
                              <DropdownMenuItem onClick={() => suspendMutation.mutate({ id: company.id, reason: 'Policy violation' })} className="text-destructive cursor-pointer rounded-lg">
                                <Pause className="mr-2 h-4 w-4" /> Suspend
                              </DropdownMenuItem>
                            )}
                            {company.status === 'SUSPENDED' && (
                              <DropdownMenuItem onClick={() => reactivateMutation.mutate(company.id)} className="text-emerald-600 cursor-pointer rounded-lg">
                                <Play className="mr-2 h-4 w-4" /> Reactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Showing page <span className="font-semibold text-foreground">{pagination.page}</span> of <span className="font-semibold text-foreground">{pagination.totalPages}</span>
                <span className="hidden sm:inline"> — {pagination.total} companies total</span>
              </p>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-8 px-3 rounded-lg">
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                </Button>
                <Button size="sm" variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="h-8 px-3 rounded-lg">
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
