import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '../../lib/api';
import { PageLoading, ErrorState, EmptyState } from '../../components/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Users, Plus, UserCheck, UserX, Mail, Search } from 'lucide-react';

export default function Staff() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['staff'],
    queryFn: () => settingsAPI.getStaff(),
  });

  const addMutation = useMutation({
    mutationFn: (data) => settingsAPI.addStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff']);
      setShowAdd(false);
      setForm({ firstName: '', lastName: '', email: '', password: '' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => settingsAPI.updateStaffStatus(id, !isActive),
    onSuccess: () => queryClient.invalidateQueries(['staff']),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addMutation.mutate(form);
  };

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  const staff = (data?.data?.data || []).filter((s) =>
    search
      ? `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Add and manage team members</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 border-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search staff..."
          className="pl-9 bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {staff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff members"
          description="Add team members to help manage complaints and respond to feedback."
          action={
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <Card key={member.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-0 shadow-sm bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                    {member.firstName?.[0]}{member.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{member.firstName} {member.lastName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5">
                      <Badge variant={member.role === 'COMPANY_ADMIN' ? 'default' : 'secondary'} className="text-[10px]">
                        {member.role === 'COMPANY_ADMIN' ? 'Admin' : 'Staff'}
                      </Badge>
                      <Badge variant={member.isActive ? 'default' : 'outline'} className={`text-[10px] ${member.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0' : ''}`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                {member.role !== 'COMPANY_ADMIN' && (
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <Button
                      variant={member.isActive ? 'outline' : 'default'}
                      size="sm"
                      className={`w-full ${!member.isActive ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0' : ''}`}
                      onClick={() => toggleMutation.mutate({ id: member.id, isActive: member.isActive })}
                      disabled={toggleMutation.isPending}
                    >
                      {member.isActive ? (
                        <><UserX className="h-4 w-4 mr-1" /> Deactivate</>
                      ) : (
                        <><UserCheck className="h-4 w-4 mr-1" /> Activate</>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Staff Dialog */}
      <Dialog open={showAdd} onOpenChange={(o) => { if (!o) setShowAdd(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>Create a new account for a team member</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                minLength={8}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
            </div>
            {addMutation.isError && (
              <p className="text-sm text-destructive">
                {addMutation.error?.response?.data?.message || 'Failed to add staff member'}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Adding...' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
