import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchAPI } from '../../lib/api';
import { PageLoading, ErrorState, EmptyState, BillingLockedBanner } from '../../components/shared';
import { useBillingErrorHandler } from '../../hooks/useBillingError';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { GitBranch, Plus, MapPin, Edit, Trash2, MoreHorizontal, Layers, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

export default function Branches() {
  const queryClient = useQueryClient();
  const { billingError, clearError } = useBillingErrorHandler();
  const { canAccess, isBillingRequired, subscriptionStatus } = useAuth();
  
  const [showCreate, setShowCreate] = useState(false);
  const [showPoints, setShowPoints] = useState(null);
  const [editBranch, setEditBranch] = useState(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    name: '', address: '', city: '', region: '', country: 'Ghana',
    contactPhone: '', contactEmail: '', managerName: '',
  });
  const [pointName, setPointName] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchAPI.getAll({ limit: 100 }),
    onError: (err) => {
      if (err.response?.status === 402) {
        // Billing error will be handled by banner
      }
    },
  });

  const canCreateBranch = canAccess('write');
  const canDeleteBranch = canAccess('delete');

  const createMutation = useMutation({
    mutationFn: (data) => branchAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['branches']);
      setShowCreate(false);
      resetForm();
      setFormError('');
    },
    onError: (error) => {
      setFormError(error.response?.data?.message || 'Failed to create branch');
      console.error('Create branch error:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => branchAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['branches']);
      setEditBranch(null);
      resetForm();
      setFormError('');
    },
    onError: (error) => {
      setFormError(error.response?.data?.message || 'Failed to update branch');
      console.error('Update branch error:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => branchAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['branches']),
  });

  // Complaint points
  const { data: pointsData, refetch: refetchPoints } = useQuery({
    queryKey: ['complaint-points', showPoints],
    queryFn: () => branchAPI.getComplaintPoints(showPoints),
    enabled: !!showPoints,
  });

  const createPointMutation = useMutation({
    mutationFn: ({ branchId, name }) => branchAPI.createComplaintPoint(branchId, { name }),
    onSuccess: () => {
      refetchPoints();
      setPointName('');
      queryClient.invalidateQueries(['branches']);
    },
  });

  const deletePointMutation = useMutation({
    mutationFn: ({ branchId, pointId }) => branchAPI.deleteComplaintPoint(branchId, pointId),
    onSuccess: () => {
      refetchPoints();
      queryClient.invalidateQueries(['branches']);
    },
  });

  const resetForm = () => {
    setForm({ name: '', address: '', city: '', region: '', country: 'Ghana', contactPhone: '', contactEmail: '', managerName: '' });
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editBranch) {
      updateMutation.mutate({ id: editBranch.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const openEdit = (branch) => {
    setForm({
      name: branch.name, address: branch.address || '', city: branch.city || '',
      region: branch.region || '', country: branch.country || 'Ghana',
      contactPhone: branch.contactPhone || '', contactEmail: branch.contactEmail || '',
      managerName: branch.managerName || '',
    });
    setEditBranch(branch);
    setShowCreate(true);
  };

  const handleDelete = (branch) => {
    if (window.confirm(`Delete branch "${branch.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(branch.id);
    }
  };

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  const branches = data?.data?.data || [];

  return (
    <div className="space-y-6">
      {/* Billing Locked Banner */}
      {(billingError || isBillingRequired) && (
        <BillingLockedBanner
          reason={billingError?.reason || (isBillingRequired ? 'BILLING_REQUIRED' : null)}
          message={billingError?.message}
          actionBlocked={billingError?.actionBlocked}
          status={subscriptionStatus}
          onUpgrade={() => window.location.href = '/company/billing'}
          onRetry={clearError}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground mt-1">Manage your locations and complaint points</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setEditBranch(null); setShowCreate(true); }} 
          disabled={!canCreateBranch}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {branches.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No branches yet"
          description="Create your first branch to start generating QR codes and receiving complaints."
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Branch
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <Card key={branch.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-800/40">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                      <GitBranch className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm truncate">{branch.name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono bg-muted/60 inline-block px-1.5 py-0.5 rounded mt-0.5">{branch.code}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(branch)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowPoints(branch.id)}>
                        <Layers className="h-4 w-4 mr-2" /> Complaint Points
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(branch)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {(branch.city || branch.address) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3 text-violet-400" />
                    <span className="truncate">{[branch.city, branch.region].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <Badge variant={branch.status === 'ACTIVE' ? 'default' : 'secondary'} className={`text-[10px] ${branch.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0' : ''}`}>
                    {branch.status}
                  </Badge>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    {branch._count?.complaints || 0} complaints
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    {branch._count?.qrCodes || 0} QR codes
                  </span>
                </div>
                {branch.managerName && (
                  <p className="text-xs text-muted-foreground mt-2.5 pt-2.5 border-t border-border/30">👤 {branch.managerName}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{editBranch ? 'Edit Branch' : 'Add New Branch'}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {editBranch ? 'Update branch information' : 'Add a new branch or location'}
                </p>
              </div>
              <button
                onClick={() => { setShowCreate(false); setEditBranch(null); resetForm(); }}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-700 dark:text-red-200">{formError}</p>
                </div>
              )}
              <div>
                <Label>Branch Name *</Label>
                <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <Label>Region / State</Label>
                  <Input value={form.region} onChange={(e) => setForm(f => ({ ...f, region: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Phone</Label>
                  <Input value={form.contactPhone} onChange={(e) => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input type="email" value={form.contactEmail} onChange={(e) => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Manager Name</Label>
                <Input value={form.managerName} onChange={(e) => setForm(f => ({ ...f, managerName: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setShowCreate(false); setEditBranch(null); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? 'Loading...' : (editBranch ? 'Update' : 'Create')} Branch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Points Modal */}
      {showPoints && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Complaint Points</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Add specific stations/desks/areas within this branch
                </p>
              </div>
              <button
                onClick={() => setShowPoints(null)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Front Desk, Pump 1, Table 5..."
                  value={pointName}
                  onChange={(e) => setPointName(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (pointName.trim()) {
                      createPointMutation.mutate({ branchId: showPoints, name: pointName.trim() });
                    }
                  }}
                  disabled={!pointName.trim() || createPointMutation.isPending}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(pointsData?.data?.data || []).map((point) => (
                  <div key={point.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{point.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {point._count?.complaints || 0} complaints · {point._count?.qrCodes || 0} QR codes
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deletePointMutation.mutate({ branchId: showPoints, pointId: point.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!pointsData?.data?.data || pointsData.data.data.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No complaint points yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
