import { useQuery } from '@tanstack/react-query';
import { superAdminAPI } from '../../lib/api';
import { PageLoading, ErrorState } from '../../components/shared';
import { BarChart3, PieChart as PieIcon, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#7c3aed', '#0891b2'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl bg-background/95 backdrop-blur-sm border shadow-lg p-3">
        <p className="text-xs font-semibold text-foreground mb-1">{label || payload[0]?.name}</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{payload[0]?.value}</span>
          {' '}{payload[0]?.dataKey || ''}
        </p>
      </div>
    );
  }
  return null;
};

export default function SAAnalytics() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sa-analytics'],
    queryFn: superAdminAPI.getAnalytics,
  });

  if (isLoading) return <PageLoading />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  const analytics = data?.data || {};

  const statusData = [
    { name: 'Active', value: analytics.activeCompanies || 0 },
    { name: 'Pending', value: analytics.pendingCompanies || 0 },
    { name: 'Suspended', value: analytics.suspendedCompanies || 0 },
    { name: 'Rejected', value: analytics.rejectedCompanies || 0 },
  ].filter((d) => d.value > 0);

  const complaintStatusData = [
    { name: 'Open', value: analytics.openComplaints || 0 },
    { name: 'In Progress', value: analytics.inProgressComplaints || 0 },
    { name: 'Resolved', value: analytics.resolvedComplaints || 0 },
    { name: 'Closed', value: analytics.closedComplaints || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Analytics</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide metrics, trends, and insights</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Company Status Distribution */}
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 p-5 border-b bg-gradient-to-r from-blue-500/5 to-transparent">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10">
              <PieIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Company Status</h2>
              <p className="text-xs text-muted-foreground">Distribution overview</p>
            </div>
          </div>
          <div className="p-5">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value" strokeWidth={0} label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <PieIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Complaint Status Distribution */}
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 p-5 border-b bg-gradient-to-r from-amber-500/5 to-transparent">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10">
              <PieIcon className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Complaint Status</h2>
              <p className="text-xs text-muted-foreground">Resolution breakdown</p>
            </div>
          </div>
          <div className="p-5">
            {complaintStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={complaintStatusData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value" strokeWidth={0} label={({ name, value }) => `${name}: ${value}`}>
                    {complaintStatusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <PieIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Registration Trend */}
        {analytics.monthlyRegistrations?.length > 0 && (
          <div className="lg:col-span-2 rounded-2xl border bg-card overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 p-5 border-b bg-gradient-to-r from-emerald-500/5 to-transparent">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Monthly Registrations</h2>
                <p className="text-xs text-muted-foreground">Company registration trend over time</p>
              </div>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlyRegistrations} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Companies by Complaints */}
        {analytics.topCompanies?.length > 0 && (
          <div className="lg:col-span-2 rounded-2xl border bg-card overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 p-5 border-b bg-gradient-to-r from-violet-500/5 to-transparent">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/10">
                <Award className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Top Companies</h2>
                <p className="text-xs text-muted-foreground">By number of complaints received</p>
              </div>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topCompanies} layout="vertical" barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={150} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="complaints" fill="#7c3aed" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
