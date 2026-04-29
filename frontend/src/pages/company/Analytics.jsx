import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../../lib/api';
import { PageLoading, ErrorState } from '../../components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, Clock, CheckCircle, Users, AlertTriangle,
  BarChart3, Timer, GitBranch,
} from 'lucide-react';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

export default function Analytics() {
  const [period, setPeriod] = useState('30d');

  const periodMap = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['company-analytics', period],
    queryFn: () => analyticsAPI.getCompanyAnalytics({ days: periodMap[period] }),
  });

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  const analytics = data?.data?.data || {};
  const {
    complaintsOverTime = [],
    resolutionRate = 0,
    avgResponseTime = 0,
    avgClosureTime = 0,
    topCategories = [],
    peakHours = [],
    anonymousVsIdentified = { anonymous: 0, identified: 0 },
    branchPerformance = [],
    statusDistribution = {},
    priorityDistribution = {},
    totalComplaints = 0,
    pendingComplaints = 0,
  } = analytics;

  const statusData = Object.entries(statusDistribution).map(([name, value]) => ({ name, value }));
  const priorityData = Object.entries(priorityDistribution).map(([name, value]) => ({ name, value }));
  const anonData = [
    { name: 'Anonymous', value: anonymousVsIdentified.anonymous },
    { name: 'Identified', value: anonymousVsIdentified.identified },
  ];

  const formatHours = (hours) => {
    if (!hours || hours === 0) return 'N/A';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Insights and performance metrics</p>
        </div>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="bg-muted/60">
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
            <TabsTrigger value="90d">90 days</TabsTrigger>
            <TabsTrigger value="365d">1 year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-muted-foreground/80 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-extrabold tracking-tight">{totalComplaints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-muted-foreground/80 uppercase tracking-wider">Resolution</p>
                <p className="text-2xl font-extrabold tracking-tight">{resolutionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-950/40 dark:to-orange-900/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Timer className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-muted-foreground/80 uppercase tracking-wider">Avg Response</p>
                <p className="text-2xl font-extrabold tracking-tight">{formatHours(avgResponseTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-sky-100/50 dark:from-blue-950/40 dark:to-sky-900/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-muted-foreground/80 uppercase tracking-wider">Avg Closure</p>
                <p className="text-2xl font-extrabold tracking-tight">{formatHours(avgClosureTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaints Over Time */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
            Complaints Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complaintsOverTime}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={false} fill="url(#lineGradient)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {priorityData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCategories.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="name" type="category" fontSize={12} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" fontSize={12} tickFormatter={(h) => `${h}:00`} />
                  <YAxis fontSize={12} />
                  <Tooltip labelFormatter={(h) => `${h}:00 - ${h}:59`} />
                  <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Anonymous vs Identified */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-violet-600" />
              </div>
              Anonymous vs Identified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={anonData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#06b6d4" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Branch Performance */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <GitBranch className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              Branch Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {branchPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No branch data available</p>
              ) : (
                branchPerformance.slice(0, 8).map((branch, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/40 transition-colors border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{branch.name}</p>
                        <p className="text-xs text-muted-foreground">{branch.totalComplaints} complaints</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">{(branch.resolutionRate || 0).toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">resolution</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
