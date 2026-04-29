import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintAPI, settingsAPI } from '../../lib/api';
import { PageLoading, ErrorState } from '../../components/shared';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  ArrowLeft,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Paperclip,
  MessageSquare,
  Send,
  ExternalLink,
} from 'lucide-react';

const STATUS_STEPS = ['NEW', 'ACKNOWLEDGED', 'IN_REVIEW', 'ASSIGNED', 'RESOLVED', 'CLOSED'];
const STATUSES = [
  { value: 'NEW', label: 'New' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REJECTED', label: 'Rejected' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const statusColor = (s) => {
  const map = {
    NEW: 'bg-amber-500',
    ACKNOWLEDGED: 'bg-blue-500',
    IN_REVIEW: 'bg-violet-500',
    ASSIGNED: 'bg-indigo-500',
    RESOLVED: 'bg-emerald-500',
    CLOSED: 'bg-gray-500',
    REJECTED: 'bg-red-500',
    ARCHIVED: 'bg-gray-400',
  };
  return map[s] || 'bg-gray-500';
};

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintAPI.getById(id),
  });

  const { data: staffData } = useQuery({
    queryKey: ['staff'],
    queryFn: () => settingsAPI.getStaff(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status }) => complaintAPI.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries(['complaint', id]); },
  });

  const priorityMutation = useMutation({
    mutationFn: ({ priority }) => complaintAPI.updatePriority(id, priority),
    onSuccess: () => { queryClient.invalidateQueries(['complaint', id]); },
  });

  const assignMutation = useMutation({
    mutationFn: ({ assignedToId }) => complaintAPI.assign(id, assignedToId),
    onSuccess: () => { queryClient.invalidateQueries(['complaint', id]); },
  });

  const noteMutation = useMutation({
    mutationFn: ({ content }) => complaintAPI.addNote(id, content, true),
    onSuccess: () => {
      setNoteContent('');
      queryClient.invalidateQueries(['complaint', id]);
    },
  });

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  const complaint = data?.data?.data;
  if (!complaint) return <ErrorState message="Complaint not found" />;

  const staff = staffData?.data?.data || [];
  const currentStepIndex = STATUS_STEPS.indexOf(complaint.status);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    noteMutation.mutate({ content: noteContent });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/complaints')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold">{complaint.title}</h1>
            <Badge variant={complaint.type === 'FEEDBACK' ? 'outline' : 'default'}>
              {complaint.type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-mono">{complaint.referenceNumber}</p>
        </div>
      </div>

      {/* Status Progress */}
      {currentStepIndex >= 0 && (
        <Card>
          <CardContent className="p-4 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {STATUS_STEPS.map((step, i) => {
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-3 rounded-full border-2 ${
                          isCurrent
                            ? `${statusColor(step)} border-transparent`
                            : isCompleted
                            ? 'bg-primary border-primary'
                            : 'bg-background border-muted-foreground/30'
                        }`}
                      />
                      <span className={`text-[10px] mt-1 ${isCurrent ? 'font-semibold' : 'text-muted-foreground'}`}>
                        {step.replace('_', ' ')}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`h-0.5 w-8 mx-1 ${isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{complaint.description}</p>
            </CardContent>
          </Card>

          {/* Attachments */}
          {complaint.attachments?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachments ({complaint.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {complaint.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      {att.fileType.startsWith('image') ? (
                        <img src={att.fileUrl} alt="" className="h-12 w-12 rounded object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                          <Paperclip className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{att.fileName}</p>
                        <p className="text-xs text-muted-foreground">{(att.fileSize / 1024).toFixed(1)} KB</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Internal Notes ({complaint.notes?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.notes?.map((note) => (
                <div key={note.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">
                      {note.user?.fullName?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{note.user?.fullName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                  </div>
                </div>
              ))}

              <Separator />

              <form onSubmit={handleAddNote}>
                <Textarea
                  placeholder="Add an internal note..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button type="submit" size="sm" disabled={!noteContent.trim() || noteMutation.isPending}>
                    <Send className="h-4 w-4 mr-1" />
                    Add Note
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                <Select
                  value={complaint.status}
                  onValueChange={(v) => statusMutation.mutate({ status: v })}
                  disabled={statusMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
                <Select
                  value={complaint.priority}
                  onValueChange={(v) => priorityMutation.mutate({ priority: v })}
                  disabled={priorityMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Assign To</label>
                <Select
                  value={complaint.assignedToId || ''}
                  onValueChange={(v) => assignMutation.mutate({ assignedToId: v })}
                  disabled={assignMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.filter((s) => s.isActive).map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{complaint.branch?.name}{complaint.complaintPoint ? ` – ${complaint.complaintPoint.name}` : ''}</span>
              </div>
              {complaint.category && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{complaint.category.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
              {complaint.assignedTo && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Assigned to {complaint.assignedTo.fullName}</span>
                </div>
              )}
              {complaint.resolvedAt && (
                <div className="text-xs text-muted-foreground">
                  Resolved: {new Date(complaint.resolvedAt).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {complaint.isAnonymous ? (
                <p className="text-muted-foreground italic">Submitted anonymously</p>
              ) : (
                <>
                  {complaint.customerName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{complaint.customerName}</span>
                    </div>
                  )}
                  {complaint.customerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${complaint.customerEmail}`} className="text-primary hover:underline">
                        {complaint.customerEmail}
                      </a>
                    </div>
                  )}
                  {complaint.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${complaint.customerPhone}`} className="text-primary hover:underline">
                        {complaint.customerPhone}
                      </a>
                    </div>
                  )}
                  {!complaint.customerName && !complaint.customerEmail && !complaint.customerPhone && (
                    <p className="text-muted-foreground italic">No contact info provided</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
