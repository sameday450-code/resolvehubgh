import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { superAdminAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import {
  Building2, Users, MessageSquareWarning, Clock, CheckCircle2,
  AlertTriangle, ArrowUpRight, TrendingUp, Activity, ExternalLink,
} from 'lucide-react';
import { StatsCard, PageLoading, ErrorState } from '../../components/shared';

export default function SADashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sa-dashboard'],
    queryFn: superAdminAPI.getDashboard,
  });

  // Refresh dashboard stats when a new company registers
  useEffect(() => {
    if (!socket) return;
    const handleNewRegistration = () => {
      queryClient.invalidateQueries({ queryKey: ['sa-dashboard'] });
    };
    socket.on('notification:new', handleNewRegistration);
    return () => socket.off('notification:new', handleNewRegistration);
  }, [socket, queryClient]);

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  const stats = data?.data?.data;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-xl shadow-blue-600/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJILTEweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-blue-200" />
            <span className="text-blue-200 text-sm font-medium">Platform Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {greeting}, {user?.name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="mt-2 text-blue-100 text-sm max-w-lg">
            Here&apos;s what&apos;s happening across the ResolveHub platform today.
          </p>
        </div>
      </div>

      {/* Key Stats - Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Companies" value={stats?.totalCompanies ?? 0} icon={Building2} description="registered companies" color="blue" />
        <StatsCard title="Active Companies" value={stats?.activeCompanies ?? 0} icon={CheckCircle2} description="currently active" color="green" />
        <StatsCard title="Pending Approval" value={stats?.pendingCompanies ?? 0} icon={Clock} description="awaiting review" color="amber" />
        <StatsCard title="Total Users" value={stats?.totalUsers ?? 0} icon={Users} description="across all companies" color="purple" />
      </div>

      {/* Key Stats - Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Complaints" value={stats?.totalComplaints ?? 0} icon={MessageSquareWarning} color="cyan" />
        <StatsCard title="Open Complaints" value={stats?.openComplaints ?? 0} icon={AlertTriangle} color="amber" />
        <StatsCard title="Resolved" value={stats?.resolvedComplaints ?? 0} icon={CheckCircle2} color="green" />
        <StatsCard title="Total Branches" value={stats?.totalBranches ?? 0} icon={Building2} color="purple" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent pending companies */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-amber-500/5 to-transparent">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Pending Approvals
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Companies waiting for your review</p>
            </div>
            <Link
              to="/super-admin/approvals"
              className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {stats?.recentPendingCompanies?.length > 0 ? (
            <div className="divide-y">
              {stats.recentPendingCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10">
                      <Building2 className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.industry} · {company.email}</p>
                    </div>
                  </div>
                  <Link
                    to={`/super-admin/companies/${company.id}`}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Review <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500/50 mb-2" />
              <p className="text-sm text-muted-foreground">All caught up! No pending reviews.</p>
            </div>
          )}
        </div>

        {/* Recent companies */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-blue-500/5 to-transparent">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Recently Registered
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Latest companies on the platform</p>
            </div>
            <Link
              to="/super-admin/companies"
              className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {stats?.recentCompanies?.length > 0 ? (
            <div className="divide-y">
              {stats.recentCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.industry}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                    company.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' :
                    company.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' :
                    company.status === 'SUSPENDED' ? 'bg-red-500/10 text-red-600' :
                    'bg-gray-500/10 text-gray-600'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      company.status === 'ACTIVE' ? 'bg-emerald-500' :
                      company.status === 'PENDING' ? 'bg-amber-500' :
                      company.status === 'SUSPENDED' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                    {company.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No companies registered yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
