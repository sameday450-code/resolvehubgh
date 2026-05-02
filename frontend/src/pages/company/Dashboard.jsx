import { useQuery } from '@tanstack/react-query';
import { complaintAPI } from '../../lib/api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoading, ErrorState } from '../../components/shared';
import TrialStatusBanner from '../../components/billing/TrialStatusBanner';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  MessageSquareWarning,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts';

const STATUS_COLORS = {
  NEW: '#f59e0b',
  ACKNOWLEDGED: '#3b82f6',
  IN_REVIEW: '#8b5cf6',
  ASSIGNED: '#6366f1',
  RESOLVED: '#10b981',
  CLOSED: '#6b7280',
  REJECTED: '#ef4444',
  ARCHIVED: '#9ca3af',
};

const STATUS_LABELS = {
  NEW: 'New',
  ACKNOWLEDGED: 'Acknowledged',
  IN_REVIEW: 'In Review',
  ASSIGNED: 'Assigned',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-popover/95 backdrop-blur-sm px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm text-muted-foreground mt-0.5">
          {entry.name || 'Count'}: <span className="font-semibold text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-popover/95 backdrop-blur-sm px-4 py-3 shadow-xl">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full" style={{ background: payload[0].payload.fill }} />
        <p className="text-sm font-semibold text-foreground">{payload[0].name}</p>
      </div>
      <p className="text-sm text-muted-foreground mt-0.5">
        Count: <span className="font-semibold text-foreground">{payload[0].value}</span>
      </p>
    </div>
  );
}

function MiniStatCard({ title, value, icon: Icon, color, accent, description, className = '' }) {
  const styles = {
    blue: {
      card: 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/60 dark:from-blue-950/40 dark:to-blue-900/20 dark:border-blue-800/40',
      icon: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30',
      value: 'text-blue-950 dark:text-blue-100',
      ring: 'bg-blue-500/10',
    },
    green: {
      card: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/60 dark:from-emerald-950/40 dark:to-emerald-900/20 dark:border-emerald-800/40',
      icon: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
      value: 'text-emerald-950 dark:text-emerald-100',
      ring: 'bg-emerald-500/10',
    },
    amber: {
      card: 'bg-gradient-to-br from-amber-50 to-orange-100/50 border-amber-200/60 dark:from-amber-950/40 dark:to-orange-900/20 dark:border-amber-800/40',
      icon: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30',
      value: 'text-amber-950 dark:text-amber-100',
      ring: 'bg-amber-500/10',
    },
    purple: {
      card: 'bg-gradient-to-br from-violet-50 to-purple-100/50 border-violet-200/60 dark:from-violet-950/40 dark:to-purple-900/20 dark:border-violet-800/40',
      icon: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30',
      value: 'text-violet-950 dark:text-violet-100',
      ring: 'bg-violet-500/10',
    },
    red: {
      card: 'bg-gradient-to-br from-red-50 to-rose-100/50 border-red-200/60 dark:from-red-950/40 dark:to-rose-900/20 dark:border-red-800/40',
      icon: 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30',
      value: 'text-red-950 dark:text-red-100',
      ring: 'bg-red-500/10',
    },
    cyan: {
      card: 'bg-gradient-to-br from-cyan-50 to-sky-100/50 border-cyan-200/60 dark:from-cyan-950/40 dark:to-sky-900/20 dark:border-cyan-800/40',
      icon: 'bg-gradient-to-br from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-500/30',
      value: 'text-cyan-950 dark:text-cyan-100',
      ring: 'bg-cyan-500/10',
    },
    rose: {
      card: 'bg-gradient-to-br from-rose-50 to-pink-100/50 border-rose-200/60 dark:from-rose-950/40 dark:to-pink-900/20 dark:border-rose-800/40',
      icon: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30',
      value: 'text-rose-950 dark:text-rose-100',
      ring: 'bg-rose-500/10',
    },
  };
  const s = styles[color] || styles.blue;

  return (
    <div className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${s.card} ${className}`}>
      {/* Decorative background ring */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${s.ring} transition-transform duration-500 group-hover:scale-150`} />
      <div className={`absolute -bottom-8 -left-8 w-20 h-20 rounded-full ${s.ring} opacity-50`} />

      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-muted-foreground/80 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-extrabold tracking-tight ${s.value}`}>{value}</p>
            {accent && (
              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${accent > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {accent > 0 ? '↑' : '↓'} {Math.abs(accent)}%
              </span>
            )}
          </div>
          {description && <p className="text-xs text-muted-foreground/70 font-medium">{description}</p>}
        </div>
        {Icon && (
          <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${s.icon} transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
            <Icon className="h-5.5 w-5.5" strokeWidth={2.2} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { socket } = useSocket();
  const { user } = useAuth();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['company', 'dashboard-stats'],
    queryFn: () => complaintAPI.getDashboardStats(),
    refetchInterval: 60000,
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

  const greeting = useMemo(() => getGreeting(), []);
  const firstName = user?.name?.split(' ')[0] || 'there';

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  const stats = data?.data?.data;
  if (!stats) return <ErrorState message="No data available" onRetry={refetch} />;

  const pieData = stats.byStatus?.map((s) => ({
    name: STATUS_LABELS[s.status] || s.status.replace('_', ' '),
    value: s.count,
    fill: STATUS_COLORS[s.status] || '#6b7280',
  })) || [];

  const totalPie = pieData.reduce((sum, d) => sum + d.value, 0);

  const resolvedRate = stats.totalComplaints > 0
    ? Math.round(((stats.resolvedComplaints || 0) / stats.totalComplaints) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-muted-foreground">{greeting}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{firstName}'s Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your complaints today</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5 self-start sm:self-auto">
          <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
          Live data
        </div>
      </div>

      {/* Trial Status Banner */}
      <TrialStatusBanner />

      {/* Primary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStatCard
          title="Total Complaints"
          value={stats.totalComplaints || 0}
          icon={MessageSquareWarning}
          color="blue"
          description="All time"
        />
        <MiniStatCard
          title="Open"
          value={stats.openComplaints || 0}
          icon={AlertCircle}
          color="amber"
          description="Requiring attention"
        />
        <MiniStatCard
          title="Resolved"
          value={stats.resolvedComplaints || 0}
          icon={CheckCircle}
          color="green"
          description={`${resolvedRate}% resolution rate`}
        />
        <MiniStatCard
          title="Today"
          value={stats.complaintsToday || 0}
          icon={Clock}
          color="purple"
          description="Received today"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStatCard
          title="Feedback Received"
          value={stats.feedbackCount || 0}
          icon={MessageSquare}
          color="cyan"
          description="Total feedback"
        />
        <MiniStatCard
          title="Urgent"
          value={stats.urgentCount || 0}
          icon={AlertTriangle}
          color="red"
          description="High priority unresolved"
          className={stats.urgentCount > 0 ? 'ring-1 ring-red-500/20' : ''}
        />
        <MiniStatCard
          title="Avg. Resolution"
          value={stats.avgResolutionHours ? `${stats.avgResolutionHours}h` : 'N/A'}
          icon={TrendingUp}
          color="rose"
          description="Average time to resolve"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart - Complaints by Branch */}
        <Card className="overflow-hidden border-0 shadow-sm bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Complaints by Branch</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Distribution across locations</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BarChart className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {stats.byBranch?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.byBranch} barSize={32}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="branch" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] flex-col items-center justify-center text-muted-foreground">
                <MessageSquareWarning className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">No branch data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donut Chart - Status Distribution */}
        <Card className="overflow-hidden border-0 shadow-sm bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Status Distribution</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{totalPie} total complaints</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-violet-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {pieData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} className="transition-opacity hover:opacity-80" />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 min-w-[120px]">
                  {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: entry.fill }} />
                      <span className="text-muted-foreground truncate text-xs">{entry.name}</span>
                      <span className="ml-auto font-semibold text-xs">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-[280px] flex-col items-center justify-center text-muted-foreground">
                <Activity className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">No complaint data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Categories */}
        <Card className="overflow-hidden border-0 shadow-sm bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Top Categories</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Most common complaint types</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {stats.byCategory?.length > 0 ? (
              <div className="space-y-4">
                {stats.byCategory.map((cat, i) => {
                  const max = stats.byCategory[0].count;
                  const pct = max > 0 ? (cat.count / max) * 100 : 0;
                  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500', 'bg-cyan-500'];
                  const bgColors = ['bg-blue-500/10', 'bg-violet-500/10', 'bg-amber-500/10', 'bg-emerald-500/10', 'bg-rose-500/10', 'bg-cyan-500/10'];
                  return (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-6 w-6 rounded-md ${bgColors[i % bgColors.length]} flex items-center justify-center text-xs font-bold text-muted-foreground`}>
                            {i + 1}
                          </div>
                          <span className="font-medium">{cat.category}</span>
                        </div>
                        <span className="font-semibold tabular-nums">{cat.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-500 ease-out`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Sparkles className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">No category data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Complaints */}
        <Card className="overflow-hidden border-0 shadow-sm bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Complaints</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Latest incoming complaints</p>
            </div>
            <Link
              to="/dashboard/complaints"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentComplaints?.length > 0 ? (
              <div className="space-y-1">
                {stats.recentComplaints.map((c) => (
                  <Link
                    key={c.id}
                    to={`/dashboard/complaints/${c.id}`}
                    className="group flex items-start gap-3 rounded-xl p-3 -mx-1 hover:bg-muted/60 transition-all duration-200"
                  >
                    <div className={`mt-1.5 h-2.5 w-2.5 rounded-full ring-4 shrink-0 ${
                      c.status === 'NEW' ? 'bg-amber-500 ring-amber-500/20' :
                      c.status === 'RESOLVED' ? 'bg-emerald-500 ring-emerald-500/20' :
                      c.status === 'REJECTED' ? 'bg-red-500 ring-red-500/20' :
                      'bg-blue-500 ring-blue-500/20'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{c.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-muted-foreground truncate">
                          {c.branch?.name}
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {c.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={c.priority === 'URGENT' || c.priority === 'HIGH' ? 'destructive' : 'secondary'}
                      className="text-[10px] shrink-0 font-semibold"
                    >
                      {c.priority}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">No complaints yet</p>
                <p className="text-xs mt-1 text-muted-foreground/60">New complaints will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
