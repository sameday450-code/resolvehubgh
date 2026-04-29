import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../../lib/api';
import { useSocket } from '../../contexts/SocketContext';
import { PageLoading, ErrorState, EmptyState } from '../../components/shared';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
  Bell, BellOff, CheckCheck, AlertTriangle, MessageSquare,
  GitBranch, QrCode, Users, Clock,
} from 'lucide-react';
import { useEffect } from 'react';

const iconMap = {
  NEW_COMPLAINT: AlertTriangle,
  COMPLAINT_UPDATED: MessageSquare,
  COMPLAINT_ASSIGNED: Users,
  COMPLAINT_RESOLVED: CheckCheck,
  NEW_BRANCH: GitBranch,
  QR_GENERATED: QrCode,
};

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getAll({ limit: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      queryClient.invalidateQueries(['notifications']);
    };
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, [socket, queryClient]);

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  const notifications = data?.data?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-[10px] font-bold text-white px-1.5">{unreadCount}</span>
                unread notification{unreadCount > 1 ? 's' : ''}
              </span>
            ) : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="border-slate-200 dark:border-slate-800 hover:bg-muted/60"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No notifications"
          description="You're all caught up! Notifications will appear here when there's activity."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = iconMap[notification.type] || Bell;
            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-0 shadow-sm ${
                  !notification.isRead ? 'bg-gradient-to-r from-indigo-50/80 to-white dark:from-indigo-950/30 dark:to-slate-900 ring-1 ring-indigo-200/50 dark:ring-indigo-800/30' : 'bg-gradient-to-r from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/30'
                }`}
                onClick={() => {
                  if (!notification.isRead) markReadMutation.mutate(notification.id);
                }}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      !notification.isRead 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                        : 'bg-muted/80 text-muted-foreground'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'text-foreground/80'}`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          {!notification.isRead && (
                            <Badge className="h-5 text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-sm">New</Badge>
                          )}
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      {notification.message && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
