import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { qrCodeAPI, complaintAPI, uploadAPI } from '../../lib/api';
import { PageLoading } from '../../components/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { MessageSquare, Upload, X, AlertCircle, Send, Building2 } from 'lucide-react';

export default function ComplaintPortal() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
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
        const res = await qrCodeAPI.resolve(slug);
        const data = res.data?.data;
        if (!data) {
          navigate('/portal/invalid', { replace: true });
          return;
        }
        setQrData(data);
      } catch {
        navigate('/portal/invalid', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    resolveQR();
  }, [slug, navigate]);

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
    setSubmitting(true);

    try {
      // Upload attachments first if any
      let attachmentUrls = [];
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        const uploadRes = await uploadAPI.uploadComplaintFiles(formData);
        attachmentUrls = uploadRes.data?.data?.urls || [];
      }

      // Submit complaint
      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        categoryId: form.categoryId || undefined,
        qrCodeId: qrData.qrCode.id,
        branchId: qrData.qrCode.branchId,
        complaintPointId: qrData.qrCode.complaintPointId || undefined,
        isAnonymous: form.isAnonymous,
        attachments: attachmentUrls,
      };

      if (!form.isAnonymous) {
        payload.customerName = form.customerName || undefined;
        payload.customerEmail = form.customerEmail || undefined;
        payload.customerPhone = form.customerPhone || undefined;
      }

      const res = await complaintAPI.submitPublic(payload);
      const refNumber = res.data?.data?.referenceNumber || '';
      navigate(`/portal/success?ref=${refNumber}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoading />;

  const company = qrData?.company;
  const categories = qrData?.categories || [];
  const branch = qrData?.qrCode?.branch;
  const point = qrData?.qrCode?.complaintPoint;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Company Header */}
        <div className="text-center mb-8">
          {company?.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="h-16 w-16 mx-auto rounded-lg mb-3 object-contain" />
          ) : (
            <img src="/public/logo.png" alt="ResolveHub" className="h-16 w-16 mx-auto mb-3 object-contain" />
          )}
          <h1 className="text-2xl font-bold">{company?.name}</h1>
          <p className="text-muted-foreground mt-1">
            {branch?.name}{point ? ` · ${point.name}` : ''}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Submit Feedback
            </CardTitle>
            <CardDescription>
              Your feedback helps us improve. All complaints are reviewed by our team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Selection */}
              <div>
                <Label>Type</Label>
                <div className="flex gap-2 mt-1">
                  {['COMPLAINT', 'FEEDBACK', 'SUGGESTION'].map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={form.type === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setForm((f) => ({ ...f, type }))}
                    >
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <Label>Category</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
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

              {/* Title */}
              <div>
                <Label>Subject *</Label>
                <Input
                  placeholder="Brief description of your feedback"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  maxLength={200}
                />
              </div>

              {/* Description */}
              <div>
                <Label>Details *</Label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Please provide as much detail as possible..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {form.description.length}/5000 characters
                </p>
              </div>

              {/* File Upload */}
              <div>
                <Label>Attachments (optional)</Label>
                <div className="mt-1">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-sm text-muted-foreground">Click to upload (max 5 files, 10MB each)</span>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {files.map((file, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 py-1">
                        {file.name.length > 20 ? file.name.slice(0, 20) + '...' : file.name}
                        <button type="button" onClick={() => removeFile(i)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={form.isAnonymous}
                  onChange={(e) => setForm((f) => ({ ...f, isAnonymous: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
                  Submit anonymously
                </Label>
              </div>

              {/* Customer Info */}
              {!form.isAnonymous && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">Contact Information (optional)</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Name</Label>
                      <Input
                        placeholder="Your name"
                        value={form.customerName}
                        onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        placeholder="Your phone number"
                        value={form.customerPhone}
                        onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={form.customerEmail}
                      onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by <span className="font-semibold">ResolveHub</span>
        </p>
      </div>
    </div>
  );
}
