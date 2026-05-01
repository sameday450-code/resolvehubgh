import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { notificationAPI } from '../lib/api';
import {
  LayoutDashboard,
  Building2,
  CheckCircle2,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  Bell,
  Search,
  MessageSquareWarning,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const navItems = [
  { to: '/super-admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/super-admin/approvals', icon: CheckCircle2, label: 'Approvals', priority: true },
  { to: '/super-admin/companies', icon: Building2, label: 'Companies' },
  { to: '/super-admin/sales-inquiries', icon: MessageSquareWarning, label: 'Sales Inquiries' },
  { to: '/super-admin/notifications', icon: Bell, label: 'Notifications', showBadge: true },
  { to: '/super-admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/super-admin/settings', icon: Settings, label: 'Settings' },
];

export default function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch initial unread count
  useEffect(() => {
    notificationAPI.getUnreadCount()
      .then((res) => setUnreadCount(res.data?.data?.count ?? 0))
      .catch(() => {});
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;
    const handleNew = () => {
      setUnreadCount((prev) => prev + 1);
    };
    socket.on('notification:new', handleNew);
    return () => socket.off('notification:new', handleNew);
  }, [socket]);

  // Reset unread count when navigating to notifications page
  useEffect(() => {
    if (location.pathname === '/super-admin/notifications') {
      notificationAPI.getUnreadCount()
        .then((res) => setUnreadCount(res.data?.data?.count ?? 0))
        .catch(() => {});
    }
  }, [location.pathname]);

  const resetUnreadCount = () => setUnreadCount(0);

  const handleLogout = () => {
    logout();
    navigate('/super-admin/login');
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-[260px]'}`}>
      {/* Logo area */}
      <div className="flex h-16 items-center gap-3 px-5">
        <img src="/logo.png" alt="ResolveHub" className="h-5 w-5" />
        <div className="flex flex-col">
          <span className="text-[15px] font-bold tracking-tight">ResolveHub</span>
          <span className="text-[10px] text-muted-foreground font-medium -mt-0.5 uppercase tracking-wider">Admin Panel</span>
        </div>
        {mobile && (
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Menu</p>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => mobile && setSidebarOpen(false)}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
              isActive(item)
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
              isActive(item) ? 'bg-white/20' : 'bg-muted/50 group-hover:bg-muted'
            }`}>
              <item.icon className="h-4 w-4" />
            </div>
            {item.label}
            {item.showBadge && unreadCount > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* User card */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold">
              {user?.name?.charAt(0) || 'S'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name || 'Super Admin'}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r bg-background/80 backdrop-blur-xl">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-[260px] bg-background shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-xl px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search bar */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-muted/50 border-0 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-muted/80 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground relative"
              onClick={() => navigate('/super-admin/notifications')}
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-xl p-0">
                  <Avatar className="h-9 w-9 ring-2 ring-border">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold">
                      {user?.name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-1">
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/super-admin/settings')} className="rounded-lg cursor-pointer py-2">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer rounded-lg py-2">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet context={{ resetUnreadCount }} />
        </main>
      </div>
    </div>
  );
}
