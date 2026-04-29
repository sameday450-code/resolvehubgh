import { useAuth } from '../../contexts/AuthContext';
import { Settings, User, Shield, Mail, KeyRound } from 'lucide-react';

export default function SASettings() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Settings</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your admin profile and platform configuration</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Admin Profile Card */}
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 p-5 border-b bg-gradient-to-r from-blue-500/5 to-transparent">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Admin Profile</h2>
              <p className="text-xs text-muted-foreground">Your personal information</p>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20 text-white text-xl font-bold">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <p className="text-lg font-semibold">{user?.name || 'Super Admin'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { icon: User, label: 'Full Name', value: user?.name || '—' },
                { icon: Mail, label: 'Email Address', value: user?.email || '—' },
                { icon: Shield, label: 'Role', value: 'Super Admin' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-background">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 p-5 border-b bg-gradient-to-r from-violet-500/5 to-transparent">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/10">
              <KeyRound className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Security</h2>
              <p className="text-xs text-muted-foreground">Account security settings</p>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-background">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">Last changed: Unknown</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">••••••••</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
