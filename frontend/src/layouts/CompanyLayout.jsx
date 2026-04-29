import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useQuery } from '@tanstack/react-query';
import { notificationAPI } from '../lib/api';
import {
  LayoutDashboard,
  MessageSquareWarning,
  GitBranch,
  QrCode,
  BarChart3,
  Settings,
  Users,
  Bell,
  LogOut,
  Menu,
  ChevronRight,
  X,
  CreditCard,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import TrialBanner from '../components/shared/TrialBanner';
import TrialExpiredModal from '../components/shared/TrialExpiredModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/dashboard/complaints', icon: MessageSquareWarning, label: 'Complaints' },
  { to: '/dashboard/branches', icon: GitBranch, label: 'Branches' },
  { to: '/dashboard/qr-codes', icon: QrCode, label: 'QR Codes' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/staff', icon: Users, label: 'Staff', adminOnly: true },
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { to: '/dashboard/billing', icon: CreditCard, label: 'Billing', adminOnly: true },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings', adminOnly: true },
];

export default function CompanyLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isCompanyAdmin, isBillingRequired } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Routes accessible even when trial is expired
  const BILLING_ALLOWED_PATHS = ['/dashboard/settings', '/dashboard/notifications'];
  const isBillingBlocked =
    isBillingRequired &&
    !BILLING_ALLOWED_PATHS.some((p) => location.pathname.startsWith(p));

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationAPI.getUnreadCount(),
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.data?.count || 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const filteredNav = navItems.filter((item) => !item.adminOnly || isCompanyAdmin);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const Sidebar = ({ mobile = false }) => (
    <div className={`sidebar-container flex flex-col h-full ${mobile ? '' : 'w-64'}`}>
      {/* Logo area */}
      <div className="flex h-16 items-center gap-2.5 px-6 sidebar-logo-area">
        <img src="/public/logo.png" alt="ResolveHub" className="h-6 w-6" />
        <span className="text-lg font-bold text-white tracking-tight">ResolveHub</span>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/60 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar-nav">
        {filteredNav.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`sidebar-nav-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                active
                  ? 'sidebar-nav-active bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                active ? 'bg-white/20' : 'bg-transparent'
              }`}>
                <item.icon className="h-4 w-4" />
              </div>
              {item.label}
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {active && item.label !== 'Notifications' && (
                <ChevronRight className="h-4 w-4 ml-auto text-white/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="sidebar-user-area p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/8 p-3">
          <Avatar className="h-9 w-9 ring-2 ring-white/20">
            <AvatarFallback className="bg-white/15 text-white text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-white/50 truncate">{user?.company?.name || ''}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 sidebar-gradient shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 sidebar-gradient shadow-2xl animate-in slide-in-from-left">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate('/dashboard/notifications')}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <TrialBanner />
        {isBillingBlocked && <TrialExpiredModal />}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
