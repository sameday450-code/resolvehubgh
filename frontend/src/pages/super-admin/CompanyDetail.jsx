import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminAPI } from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import {
  ArrowLeft, Building2, Mail, Phone, Globe, Calendar, Users, GitBranch,
  MessageSquareWarning, QrCode, CheckCircle, XCircle, Pause, Play, MapPin,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { PageLoading, ErrorState } from '../../components/shared';
import SubscriptionPanel from '../../components/billing/SubscriptionPanel';
import toast from 'react-hot-toast';

const statusConfig = {
  ACTIVE: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'Active' },
  PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500', label: 'Pending' },
  SUSPENDED: { bg: 'bg-red-500/10', text: 'text-red-600', dot: 'bg-red-500', label: 'Suspended' },
  REJECTED: { bg: 'bg-gray-500/10', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Rejected' },
};

export default function SACompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sa-company', id],
    queryFn: () => superAdminAPI.getCompanyDetail(id),
  });

  const approveMutation = useMutation({
    mutationFn: () => superAdminAPI.approveCompany(id),
    onSuccess: () => { toast.success('Company approved'); queryClient.invalidateQueries({ queryKey: ['sa-company', id] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: () => superAdminAPI.rejectCompany(id, 'Does not meet platform requirements'),
    onSuccess: () => { toast.success('Company rejected'); queryClient.invalidateQueries({ queryKey: ['sa-company', id] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const suspendMutation = useMutation({
    mutationFn: () => superAdminAPI.suspendCompany(id, 'Policy violation'),
    onSuccess: () => { toast.success('Company suspended'); queryClient.invalidateQueries({ queryKey: ['sa-company', id] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const reactivateMutation = useMutation({
    mutationFn: () => superAdminAPI.reactivateCompany(id),
    onSuccess: () => { toast.success('Company reactivated'); queryClient.invalidateQueries({ queryKey: ['sa-company', id] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  const company = data?.data;
  if (!company) return <ErrorState title="Company not found" />;
  const sc = statusConfig[company.status] || statusConfig.REJECTED;

  const statCards = [
    { icon: Users, label: 'Users', value: company._count?.users ?? company.users?.length ?? 0, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { icon: GitBranch, label: 'Branches', value: company._count?.branches ?? company.branches?.length ?? 0, color: 'text-violet-600', bg: 'bg-violet-500/10' },
    { icon: MessageSquareWarning, label: 'Complaints', value: company._count?.complaints ?? 0, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { icon: QrCode, label: 'QR Codes', value: company._count?.qrCodes ?? 0, color: 'text-cyan-600', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate('/super-admin/companies')} className="rounded-xl -ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies
      </Button>

      {/* Header card */}
      <div className="relative rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-violet-600/5" />
        <div className="relative p-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20 shrink-0">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                  {company.industry && (
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">{company.industry}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {company.status === 'PENDING' && (
                <>
                  <Button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20">
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                  </Button>
                  <Button variant="destructive" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending} className="rounded-xl shadow-md shadow-red-600/20">
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </>
              )}
              {company.status === 'ACTIVE' && (
                <Button variant="destructive" onClick={() => suspendMutation.mutate()} disabled={suspendMutation.isPending} className="rounded-xl">
                  <Pause className="mr-2 h-4 w-4" /> Suspend
                </Button>
              )}
              {company.status === 'SUSPENDED' && (
                <Button onClick={() => reactivateMutation.mutate()} disabled={reactivateMutation.isPending} className="rounded-xl">
                  <Play className="mr-2 h-4 w-4" /> Reactivate
                </Button>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {statCards.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 rounded-xl bg-muted/30 border border-border/50 p-3">
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold leading-none">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Company Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold mb-5">Company Information</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { icon: Mail, label: 'Contact Email', value: company.contactEmail },
                { icon: Phone, label: 'Contact Phone', value: company.contactPhone || '—' },
                { icon: Globe, label: 'Website', value: company.website || '—' },
                { icon: Calendar, label: 'Registered', value: formatDateTime(company.createdAt) },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 group">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted/60 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors shrink-0">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{item.label}</dt>
                    <dd className="text-sm font-medium mt-0.5">{item.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            {company.address && (
              <>
                <Separator className="my-5" />
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted/60 text-muted-foreground shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Address</p>
                    <p className="text-sm font-medium mt-0.5">{company.address}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Admin User */}
          {company.users?.length > 0 && (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-base font-semibold mb-4">Team Members</h2>
              <div className="space-y-2">
                {company.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-600/10 to-indigo-600/10 text-primary text-xs font-bold">
                        {user.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant={user.role === 'COMPANY_ADMIN' ? 'default' : 'secondary'} className="rounded-lg">
                      {user.role === 'COMPANY_ADMIN' ? 'Admin' : 'Staff'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Branches */}
          {company.branches?.length > 0 && (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-base font-semibold mb-4">Branches</h2>
              <div className="space-y-2">
                {company.branches.map((branch) => (
                  <div key={branch.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/10">
                        <GitBranch className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{branch.name}</p>
                        <p className="text-xs text-muted-foreground">{branch.address || branch.code}</p>
                      </div>
                    </div>
                    <Badge variant={branch.status === 'ACTIVE' ? 'default' : 'secondary'} className="rounded-lg">
                      {branch.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity sidebar */}
        <div className="space-y-4">
          {/* Subscription Panel */}
          <SubscriptionPanel companyId={id} />

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Quick Stats</h3>
            <div className="space-y-4">
              {statCards.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                    </div>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className="text-lg font-bold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-gradient-to-br from-blue-600/5 to-indigo-600/5 p-5">
            <h3 className="text-sm font-semibold mb-2">Registration Date</h3>
            <p className="text-xs text-muted-foreground">{formatDateTime(company.createdAt)}</p>
            {company.status === 'PENDING' && (
              <p className="text-xs text-amber-600 mt-2 font-medium">⏳ Awaiting approval</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
