import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { qrCodeAPI, complaintAPI, uploadAPI } from '../../lib/api';
import { PageLoading } from '../../components/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { MessageSquare, Upload, X, AlertCircle, Send, ShieldCheck, ShieldX } from 'lucide-react';

const DEFAULT_COLOR = '#2563eb';

const getBackendSocketUrl = () => {
  const url = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || window.location.origin;
  return url;
};

export default function ComplaintPortal() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState(null);
  const [branding, setBranding] = useState({ logoUrl: null, brandColor: DEFAULT_COLOR });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  const socketRef = useRef(null);
  // 'pending' | 'accepted' | 'declined'
  const [consentStatus, setConsentStatus] = useState('pending');
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'COMPLAINT',
    categoryId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    isAnonymous: false,
  });

  useEffect(() => {
    const resolveQR = async () => {
      try {
        const res = await qrCodeAPI.resolve(publicId);
        const data = res.data?.data;
        if (!data) {
          navigate('/portal/invalid', { replace: true });
          return;
        }
        setQrData(data);
        setBranding({
          logoUrl: data.company?.logoUrl || null,
          brandColor: data.company?.brandColor || DEFAULT_COLOR,
        });
      } catch (err) {
        const message = err.response?.data?.message || undefined;
        navigate('/portal/invalid', { replace: true, state: { message } });
      } finally {
        setLoading(false);
      }
    };
    resolveQR();
  }, [publicId, navigate]);

  // Real-time branding updates via Socket.IO (unauthenticated public connection)
  useEffect(() => {
    if (!qrData?.qrCode?.id) return;
    const companyId = qrData?.company?.id || qrData?.qrCode?.companyId;
    if (!companyId) return;

    const socket = io(getBackendSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      socket.emit('join:public:company', companyId);
    });

    socket.on('company:branding-updated', (payload) => {
      setBranding({
        logoUrl: payload.logoUrl || null,
        brandColor: payload.brandColor || DEFAULT_COLOR,
      });
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, [qrData?.qrCode?.id]);

  const color = branding.brandColor || DEFAULT_COLOR;
  // Cache-busted logo URL using updatedAt from branding event or static
  const logoSrc = branding.logoUrl ? branding.logoUrl : null;

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (files.length + newFiles.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    const valid = newFiles.filter((f) => f.size <= maxSize);
    if (valid.length < newFiles.length) {
      setError('Some files exceed 10MB limit and were skipped');
    }
    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate QR context before submitting
    if (!publicId || !qrData?.qrCode?.id || !qrData?.qrCode?.branchId) {
      setError('Invalid QR portal. Please scan a valid QR code.');
      return;
    }

    setSubmitting(true);

    try {
      // Upload attachments first if any; upload service returns array of objects
      let attachments = [];
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        const uploadRes = await uploadAPI.uploadComplaintFiles(formData);
        attachments = uploadRes.data?.data || [];
      }

      // Build payload — only include defined, non-empty values
      const payload = {
        publicSlug: publicId,
        title: form.title,
        description: form.description,
        type: form.type,
        isAnonymous: form.isAnonymous,
      };

      if (form.categoryId) payload.categoryId = form.categoryId;
      if (attachments.length > 0) payload.attachments = attachments;

      if (!form.isAnonymous) {
        if (form.customerName) payload.customerName = form.customerName;
        if (form.customerEmail) payload.customerEmail = form.customerEmail;
        if (form.customerPhone) payload.customerPhone = form.customerPhone;
      }

      const res = await complaintAPI.submitPublic(payload);
      const refNumber = res.data?.data?.referenceNumber || '';
      navigate(`/portal/success?ref=${refNumber}`, { replace: true });
    } catch (err) {
      const serverMsg = err.response?.data?.message || '';
      if (serverMsg.toLowerCase().includes('invalid') && serverMsg.toLowerCase().includes('qr')) {
        setError('Invalid QR code.');
      } else if (serverMsg.toLowerCase().includes('disabled') || serverMsg.toLowerCase().includes('unavailable')) {
        setError('This QR code is disabled.');
      } else if (serverMsg.toLowerCase().includes('company') || serverMsg.toLowerCase().includes('not active')) {
        setError('This company account is currently inactive.');
      } else if (serverMsg.toLowerCase().includes('validation') || serverMsg.toLowerCase().includes('required')) {
        setError('Please complete all required fields.');
      } else if (serverMsg.toLowerCase().includes('too many')) {
        setError(serverMsg);
      } else {
        setError('Unable to submit feedback. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoading />;

  const company = qrData?.company;
  const categories = qrData?.categories || [];
  const branch = qrData?.qrCode?.branch;
  const point = qrData?.qrCode?.complaintPoint;

  // ── Privacy Consent Modal ──────────────────────────────────────────────────
  if (consentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Company branding above modal */}
          <div className="text-center mb-6">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={company?.name}
                className="h-16 w-16 mx-auto rounded-xl mb-3 object-contain border border-border shadow-sm bg-white p-1"
              />
            ) : (
              <div
                className="h-16 w-16 mx-auto rounded-xl mb-3 flex items-center justify-center border border-border"
                style={{ backgroundColor: `${color}1a` }}
              >
                <span className="text-2xl font-bold" style={{ color }}>
                  {company?.name?.charAt(0) || 'R'}
                </span>
              </div>
            )}
            <h1 className="text-xl font-bold">{company?.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {branch?.name}{point ? ` · ${point.name}` : ''}
            </p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4 text-center">
              <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${color}1a` }}>
                <ShieldCheck className="h-6 w-6" style={{ color }} />
              </div>
              <CardTitle className="text-lg">Privacy Notice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                To submit feedback or a complaint, ResolveHub may collect the information you
                choose to provide, including your name, phone number, email address, complaint
                details, and any uploaded attachments. This information will be shared with{' '}
                <span className="font-semibold text-foreground">{company?.name}</span> who is
                responsible for resolving your issue.
              </p>
              <p className="text-xs text-muted-foreground">
                You may submit anonymously if you prefer not to share personal details.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  className="w-full h-10 rounded-md text-sm font-medium text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: color }}
                  onClick={() => setConsentStatus('accepted')}
                >
                  <ShieldCheck className="h-4 w-4" />
                  I Agree, Continue
                </button>
                <Button
                  variant="outline"
                  className="w-full text-muted-foreground"
                  onClick={() => setConsentStatus('declined')}
                >
                  <ShieldX className="h-4 w-4 mr-2" />
                  I Do Not Agree
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
            <img src="/logo.png" alt="ResolveHub" className="h-4 w-4 inline opacity-60" />
            Powered by <span className="font-semibold">ResolveHub</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Consent Declined ──────────────────────────────────────────────────────
  if (consentStatus === 'declined') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mx-auto mb-4" >
            <ShieldX className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Privacy Notice Not Accepted</h2>
          <p className="text-sm text-muted-foreground mb-6">
            You need to accept the privacy notice before submitting feedback. No data has been
            collected or stored.
          </p>
          <Button variant="outline" onClick={() => setConsentStatus('pending')}>
            Review Privacy Notice
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-8 flex items-center justify-center gap-1.5">
            <img src="/logo.png" alt="ResolveHub" className="h-4 w-4 inline opacity-60" />
            Powered by <span className="font-semibold">ResolveHub</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Complaint Form (consent accepted) ────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Company Header */}
        <div className="text-center mb-8">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={company?.name}
              className="h-20 w-20 mx-auto rounded-xl mb-3 object-contain border border-border shadow-sm bg-white p-1"
            />
          ) : (
            <div
              className="h-20 w-20 mx-auto rounded-xl mb-3 flex items-center justify-center border border-border shadow-sm"
              style={{ backgroundColor: `${color}1a` }}
            >
              <span className="text-3xl font-bold" style={{ color }}>
                {company?.name?.charAt(0) || 'R'}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-bold">{company?.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {branch?.name}{point ? ` · ${point.name}` : ''}
          </p>
          {company?.welcomeMessage && (
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto italic">
              "{company.welcomeMessage}"
            </p>
          )}
        </div>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5" style={{ color }} />
              Submit Complaint / Feedback
            </CardTitle>
            <CardDescription>
              Your feedback helps us improve. All submissions are reviewed by the team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Selection */}
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                  Submission Type
                </Label>
                <div className="flex flex-wrap gap-2">
                  {['COMPLAINT', 'FEEDBACK', 'SUGGESTION'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type }))}
                      className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
                      style={
                        form.type === type
                          ? { backgroundColor: color, color: '#fff', borderColor: color }
                          : {}
                      }
                    >
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form.categoryId}
                    onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subject */}
              <div>
                <Label htmlFor="title">Subject <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  placeholder="Brief description of your feedback"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  maxLength={200}
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Details <span className="text-destructive">*</span></Label>
                <textarea
                  id="description"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Please provide as much detail as possible..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {form.description.length}/5000
                </p>
              </div>

              {/* File Upload */}
              <div>
                <Label>Attachments <span className="text-xs font-normal text-muted-foreground">(optional, max 5 files)</span></Label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/40 transition-colors mt-1">
                  <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Click to upload (images, PDF, DOC — max 10MB each)</span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {files.map((file, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 py-1 text-xs">
                        {file.name.length > 22 ? file.name.slice(0, 22) + '…' : file.name}
                        <button type="button" onClick={() => removeFile(i)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Anonymous Toggle */}
              {(qrData?.company?.allowAnonymous ?? true) && (
                <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.isAnonymous}
                    onChange={(e) => setForm((f) => ({ ...f, isAnonymous: e.target.checked }))}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm font-medium">Submit anonymously</span>
                  <span className="text-xs text-muted-foreground ml-auto">Your identity won't be shared</span>
                </label>
              )}

              {/* Contact Information */}
              {!form.isAnonymous && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/40 border border-border/50">
                  <p className="text-sm font-medium">
                    Contact Information <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="customerName" className="text-xs">Name</Label>
                      <Input
                        id="customerName"
                        placeholder="Your name"
                        value={form.customerName}
                        onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone" className="text-xs">Phone</Label>
                      <Input
                        id="customerPhone"
                        placeholder="Your phone number"
                        value={form.customerPhone}
                        onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customerEmail" className="text-xs">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={form.customerEmail}
                      onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 text-base font-semibold rounded-md text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: color }}
                disabled={submitting}
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting…' : 'Submit Feedback'}
              </button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
          <img src="/logo.png" alt="ResolveHub" className="h-4 w-4 inline opacity-60" />
          Powered by <span className="font-semibold">ResolveHub</span>
        </p>
      </div>
    </div>
  );
}
