import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qrCodeAPI, branchAPI } from '../../lib/api';
import { PageLoading, ErrorState, EmptyState } from '../../components/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { QrCode, Plus, Download, Copy, MoreHorizontal, Eye, EyeOff, RefreshCw, Printer, Search, ExternalLink, X } from 'lucide-react';

export default function QRCodes() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [previewQR, setPreviewQR] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ branchId: '', complaintPointId: '', label: '' });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['qrcodes', filter],
    queryFn: () => qrCodeAPI.getAll({ limit: 100, status: filter !== 'all' ? filter : undefined }),
  });

  const { data: branchesData } = useQuery({
    queryKey: ['branches-list'],
    queryFn: () => branchAPI.getAll({ limit: 100 }),
  });

  const { data: pointsData } = useQuery({
    queryKey: ['branch-points', form.branchId],
    queryFn: () => branchAPI.getComplaintPoints(form.branchId),
    enabled: !!form.branchId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => qrCodeAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['qrcodes']);
      setShowCreate(false);
      setForm({ branchId: '', complaintPointId: '', label: '' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) =>
      status === 'ACTIVE' ? qrCodeAPI.disable(id) : qrCodeAPI.enable(id),
    onSuccess: () => queryClient.invalidateQueries(['qrcodes']),
  });

  const regenerateMutation = useMutation({
    mutationFn: (id) => qrCodeAPI.regenerate(id),
    onSuccess: () => queryClient.invalidateQueries(['qrcodes']),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({
      branchId: form.branchId,
      complaintPointId: form.complaintPointId || undefined,
      label: form.label || undefined,
    });
  };

  const handleDownloadPNG = async (qr) => {
    try {
      const res = await qrCodeAPI.downloadSVG(qr.id);
      const svgData = res.data?.data || res.data;
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${qr.code}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open QR image URL
      if (qr.qrImageUrl) window.open(qr.qrImageUrl, '_blank');
    }
  };

  const copyLink = (qr) => {
    const url = `${window.location.origin}/portal/${qr.slug}`;
    navigator.clipboard.writeText(url);
  };

  const printQR = (qr) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>QR Code - ${qr.label || qr.code}</title>
      <style>
        body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
        img { max-width: 300px; }
        h2 { margin-top: 20px; }
        p { color: #666; }
      </style></head>
      <body>
        ${qr.qrImageUrl ? `<img src="${qr.qrImageUrl}" alt="QR Code" />` : '<p>No QR image</p>'}
        <h2>${qr.label || qr.code}</h2>
        <p>${qr.branch?.name || ''}</p>
        <p style="font-size:12px;">Scan to submit feedback</p>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `);
  };

  if (isLoading) return <PageLoading />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  const qrcodes = (data?.data?.data || []).filter((q) =>
    search ? (q.label || q.code).toLowerCase().includes(search.toLowerCase()) || q.branch?.name?.toLowerCase().includes(search.toLowerCase()) : true
  );
  const branches = branchesData?.data?.data || [];
  const points = pointsData?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
          <p className="text-muted-foreground mt-1">Generate and manage complaint QR codes</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 border-0">
          <Plus className="h-4 w-4 mr-2" />
          Generate QR Code
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search QR codes..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="ACTIVE">Active</TabsTrigger>
            <TabsTrigger value="DISABLED">Disabled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {qrcodes.length === 0 ? (
        <EmptyState
          icon={QrCode}
          title="No QR codes found"
          description="Generate QR codes to start collecting complaints and feedback."
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {qrcodes.map((qr) => (
            <Card key={qr.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-0 shadow-sm bg-gradient-to-br from-white to-cyan-50/30 dark:from-slate-900 dark:to-cyan-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-16 w-16 rounded-xl border-2 border-cyan-100 dark:border-cyan-900/50 overflow-hidden shrink-0 bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      {qr.qrImageUrl ? (
                        <img src={qr.qrImageUrl} alt="QR" className="h-full w-full object-contain p-1" />
                      ) : (
                        <QrCode className="h-8 w-8 text-cyan-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm truncate">{qr.label || qr.code}</CardTitle>
                      <p className="text-xs text-muted-foreground truncate">{qr.branch?.name}</p>
                      {qr.complaintPoint && (
                        <p className="text-xs text-muted-foreground truncate">{qr.complaintPoint.name}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPreviewQR(qr)}>
                        <Eye className="h-4 w-4 mr-2" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadPNG(qr)}>
                        <Download className="h-4 w-4 mr-2" /> Download SVG
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyLink(qr)}>
                        <Copy className="h-4 w-4 mr-2" /> Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => printQR(qr)}>
                        <Printer className="h-4 w-4 mr-2" /> Print
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleMutation.mutate({ id: qr.id, status: qr.status })}>
                        {qr.status === 'ACTIVE' ? (
                          <><EyeOff className="h-4 w-4 mr-2" /> Disable</>
                        ) : (
                          <><Eye className="h-4 w-4 mr-2" /> Enable</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => regenerateMutation.mutate(qr.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <Badge variant={qr.status === 'ACTIVE' ? 'default' : 'secondary'} className={`text-[10px] ${qr.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0' : ''}`}>
                    {qr.status}
                  </Badge>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    {qr.scanCount || 0} scans
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    {qr._count?.complaints || 0} complaints
                  </span>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-border/30">
                  <a
                    href={`/portal/${qr.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open Portal Link
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Generate QR Code</h2>
                <p className="text-sm text-muted-foreground mt-1">Create a new QR code for a branch or complaint point</p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <Label>Branch *</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.branchId}
                  onChange={(e) => setForm(f => ({ ...f, branchId: e.target.value, complaintPointId: '' }))}
                  required
                >
                  <option value="">Select a branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              {points.length > 0 && (
                <div>
                  <Label>Complaint Point (optional)</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.complaintPointId}
                    onChange={(e) => setForm(f => ({ ...f, complaintPointId: e.target.value }))}
                  >
                    <option value="">General (no specific point)</option>
                    {points.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <Label>Label (optional)</Label>
                <Input
                  placeholder="e.g. Main Entrance, Table 5"
                  value={form.label}
                  onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>Generate</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-lg shadow-lg max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{previewQR.label || previewQR.code}</h2>
                <p className="text-sm text-muted-foreground mt-1">{previewQR.branch?.name}</p>
              </div>
              <button
                onClick={() => setPreviewQR(null)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              {previewQR.qrImageUrl ? (
                <img src={previewQR.qrImageUrl} alt="QR Code" className="w-64 h-64 border rounded-lg p-2 bg-white" />
              ) : (
                <div className="w-64 h-64 border rounded-lg flex items-center justify-center bg-muted">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <p className="text-xs text-muted-foreground font-mono">{previewQR.slug}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleDownloadPNG(previewQR)}>
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyLink(previewQR)}>
                  <Copy className="h-4 w-4 mr-1" /> Copy Link
                </Button>
                <Button size="sm" variant="outline" onClick={() => printQR(previewQR)}>
                  <Printer className="h-4 w-4 mr-1" /> Print
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
