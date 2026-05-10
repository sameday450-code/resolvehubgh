import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactAPI } from '../../lib/api';
import { useSocket } from '../../contexts/SocketContext';
import {
  Mail,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Clock,
  Building2,
  User,
  Send,
  Archive,
  Eye,
  CheckCircle2,
  X,
  Inbox,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { PageLoading, EmptyState } from '../../components/shared';
import toast from 'react-hot-toast';

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig = {
  NEW: { bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-500', label: 'New' },
  READ: { bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500', label: 'Read' },
  REPLIED: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'Replied' },
  ARCHIVED: { bg: 'bg-gray-500/10', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Archived' },
};

const statusOptions = [
  { value: 'ALL', label: 'All Messages' },
  { value: 'NEW', label: 'New' },
  { value: 'READ', label: 'Read' },
  { value: 'REPLIED', label: 'Replied' },
  { value: 'ARCHIVED', label: 'Archived' },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.NEW;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Format date ─────────────────────────────────────────────────────────────
function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Message Detail Modal ─────────────────────────────────────────────────────
function MessageDetailModal({ message, onClose, onStatusChange, onReplySuccess }) {
  const [replyText, setReplyText] = useState('');
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const queryClient = useQueryClient();

  const replyMutation = useMutation({
    mutationFn: ({ id, replyMessage }) => contactAPI.reply(id, replyMessage),
    onSuccess: (res) => {
      toast.success('Reply sent successfully.');
      setReplyText('');
      setShowReplyEditor(false);
      onReplySuccess(res.data?.data || res.data);
      queryClient.invalidateQueries({ queryKey: ['sa-contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sa-contact-stats'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send reply'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => contactAPI.updateStatus(id, status),
    onSuccess: (res, vars) => {
      toast.success('Status updated');
      onStatusChange(vars.status);
      queryClient.invalidateQueries({ queryKey: ['sa-contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sa-contact-stats'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  const handleReplySubmit = () => {
    if (!replyText.trim() || replyText.trim().length < 10) {
      toast.error('Reply must be at least 10 characters');
      return;
    }
    replyMutation.mutate({ id: message.id, replyMessage: replyText.trim() });
  };

  const handleArchive = () => {
    statusMutation.mutate({ id: message.id, status: 'ARCHIVED' });
    setShowArchiveConfirm(false);
    onClose();
  };

  const currentStatus = message.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-border/50 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border/50 shrink-0">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0 mt-0.5">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-lg leading-tight truncate">{message.subject}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge status={currentStatus} />
                <span className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 ml-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Customer info */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/30">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="text-sm font-semibold truncate">{message.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/30">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
                <Mail className="h-4 w-4 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-semibold truncate">{message.email}</p>
              </div>
            </div>
            {message.company && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/30">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10">
                  <Building2 className="h-4 w-4 text-purple-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="text-sm font-semibold truncate">{message.company}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/30">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
                <Clock className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="text-sm font-semibold">{new Date(message.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Message body */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Message</p>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/40 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {message.message}
            </div>
          </div>

          {/* Previous reply (if any) */}
          {message.adminReply && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Your Reply
                {message.repliedAt && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground/60">
                    — {new Date(message.repliedAt).toLocaleString()}
                  </span>
                )}
              </p>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {message.adminReply}
              </div>
              {message.repliedByAdmin && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Sent by {message.repliedByAdmin.fullName}
                </p>
              )}
            </div>
          )}

          {/* Reply editor */}
          {showReplyEditor && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Write Reply
              </p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={6}
                placeholder={`Hello ${message.fullName},\n\n`}
                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This reply will be sent to <strong>{message.email}</strong>
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleReplySubmit}
                  disabled={replyMutation.isPending || replyText.trim().length < 10}
                  className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                  <Send className="h-4 w-4" />
                  {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                </Button>
                <Button variant="outline" onClick={() => setShowReplyEditor(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Archive confirm */}
          {showArchiveConfirm && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 font-medium">Archive this message?</p>
              </div>
              <p className="text-sm text-muted-foreground">Archived messages won't appear in the default view.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-700 hover:bg-amber-500/10" onClick={handleArchive}>
                  Yes, Archive
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowArchiveConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-border/50 shrink-0 flex-wrap">
          <div className="flex gap-2">
            {!showReplyEditor && currentStatus !== 'ARCHIVED' && (
              <Button
                onClick={() => setShowReplyEditor(true)}
                className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-sm"
                size="sm"
              >
                <Send className="h-4 w-4" />
                {message.adminReply ? 'Send Another Reply' : 'Reply'}
              </Button>
            )}
            {currentStatus !== 'ARCHIVED' && !showArchiveConfirm && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-muted-foreground"
                onClick={() => setShowArchiveConfirm(true)}
                disabled={statusMutation.isPending}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SAContactMessages() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [localStatuses, setLocalStatuses] = useState({});
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  // Real-time: listen for new contact messages
  useEffect(() => {
    if (!socket) return;
    const handleNew = (data) => {
      toast.success(`New message from ${data.fullName}`, {
        icon: '✉️',
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ['sa-contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sa-contact-stats'] });
    };
    const handleStatusChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['sa-contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sa-contact-stats'] });
    };
    socket.on('contact:new', handleNew);
    socket.on('contact:statusChanged', handleStatusChanged);
    socket.on('contact:replied', handleStatusChanged);
    return () => {
      socket.off('contact:new', handleNew);
      socket.off('contact:statusChanged', handleStatusChanged);
      socket.off('contact:replied', handleStatusChanged);
    };
  }, [socket, queryClient]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sa-contact-messages', { search: debouncedSearch, status, page }],
    queryFn: () =>
      contactAPI.getMessages({
        page,
        limit: 15,
        status: status === 'ALL' ? undefined : status,
        search: debouncedSearch || undefined,
      }),
    keepPreviousData: true,
  });

  const { data: statsData } = useQuery({
    queryKey: ['sa-contact-stats'],
    queryFn: () => contactAPI.getStats(),
    refetchInterval: 30000,
  });

  const messages = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};
  const newCount = statsData?.data?.data?.newCount ?? 0;

  const handleOpenMessage = (msg) => {
    setSelectedMessage(msg);
    // Optimistically mark as read in local UI
    if (msg.status === 'NEW') {
      setLocalStatuses((prev) => ({ ...prev, [msg.id]: 'READ' }));
    }
  };

  const handleStatusChange = (newStatus) => {
    if (selectedMessage) {
      setLocalStatuses((prev) => ({ ...prev, [selectedMessage.id]: newStatus }));
      setSelectedMessage((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleReplySuccess = (updatedMsg) => {
    setSelectedMessage(updatedMsg);
    setLocalStatuses((prev) => ({ ...prev, [updatedMsg.id]: 'REPLIED' }));
  };

  const getDisplayStatus = (msg) => localStatuses[msg.id] || msg.status;

  if (isLoading) return <PageLoading />;

  if (error) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
            <p className="text-sm text-muted-foreground mt-1">Messages from the contact form</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Failed to load messages</h3>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
            {newCount > 0 && (
              <span className="flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-blue-500 text-white text-xs font-bold shadow-sm">
                {newCount > 99 ? '99+' : newCount}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Messages submitted from the public contact form
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: pagination.total ?? 0, icon: Inbox, color: 'text-foreground', bg: 'bg-muted/50' },
          { label: 'New', value: newCount, icon: Mail, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Replied', value: null, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'Archived', value: null, icon: Archive, color: 'text-gray-500', bg: 'bg-gray-500/10' },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-3 p-3.5 rounded-xl border border-border/40 ${s.bg}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-background/60`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-lg font-bold leading-none mt-0.5 ${s.color}`}>
                {s.value !== null ? s.value : '—'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Search name, email, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl bg-muted/50 border-border/40 focus:bg-background"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v)}>
          <SelectTrigger className="w-[160px] h-9 rounded-xl bg-muted/50 border-border/40">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Messages list */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border/50 bg-muted/20">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold mb-1">No messages found</h3>
          <p className="text-sm text-muted-foreground">
            {debouncedSearch || status !== 'ALL'
              ? 'Try changing your search or filter'
              : 'Contact form submissions will appear here'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_2fr_1fr_100px] gap-4 px-5 py-3 border-b border-border/40 bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject / Preview</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/30">
            {messages.map((msg) => {
              const displayStatus = getDisplayStatus(msg);
              const isNew = displayStatus === 'NEW';
              return (
                <div
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`group cursor-pointer transition-all duration-150 hover:bg-muted/30 ${isNew ? 'bg-blue-500/[0.03]' : ''}`}
                >
                  {/* Desktop row */}
                  <div className="hidden sm:grid grid-cols-[1fr_1fr_2fr_1fr_100px] gap-4 items-center px-5 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {isNew && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                        <p className={`text-sm truncate ${isNew ? 'font-semibold' : 'font-medium'}`}>
                          {msg.fullName}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.email}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground truncate">
                        {msg.company || <span className="italic text-muted-foreground/40">—</span>}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${isNew ? 'font-semibold' : 'font-medium'}`}>{msg.subject}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {msg.message.substring(0, 80)}{msg.message.length > 80 ? '...' : ''}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(msg.createdAt)}</p>
                    <StatusBadge status={displayStatus} />
                  </div>

                  {/* Mobile card */}
                  <div className="sm:hidden p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {isNew && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />}
                        <div className="min-w-0">
                          <p className={`text-sm truncate ${isNew ? 'font-semibold' : 'font-medium'}`}>{msg.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                        </div>
                      </div>
                      <StatusBadge status={displayStatus} />
                    </div>
                    <p className={`text-sm ${isNew ? 'font-semibold' : 'font-medium'}`}>{msg.subject}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{msg.message}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * pagination.limit) + 1}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">{page} / {pagination.pages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onStatusChange={handleStatusChange}
          onReplySuccess={handleReplySuccess}
        />
      )}
    </div>
  );
}
