import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionAPI, authAPI } from '../../lib/api';
import {
  Lock,
  Mail,
  Phone,
  Globe,
  LogOut,
  RefreshCw,
  Loader2,
  Upload,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  FileText,
  X,
  ChevronRight,
  Smartphone,
  Building2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import toast from 'react-hot-toast';

// ─── Payment submission form ────────────────────────────────────────────────

const NETWORKS = [
  { value: 'MTN', label: 'MTN Mobile Money' },
  { value: 'TELECEL', label: 'Telecel Cash' },
  { value: 'AIRTELTIGO', label: 'AirtelTigo Money' },
  { value: 'BANK', label: 'Bank Transfer' },
];

function PaymentForm({ onClose, onSuccess }) {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [form, setForm] = useState({
    companyName: user?.company?.name || '',
    amountPaid: '',
    transactionId: '',
    paymentPhoneNumber: '',
    network: 'MTN',
    paymentMethod: 'MOBILE_MONEY',
    paymentDate: new Date().toISOString().split('T')[0],
    note: '',
  });
  const [file, setFile] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5 MB');
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amountPaid || !form.transactionId) {
      toast.error('Amount and Transaction ID are required');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('selectedPlan', 'ENTERPRISE');
      if (file) fd.append('proofOfPayment', file);

      await subscriptionAPI.submitActivationRequestMultipart(fd);
      toast.success('Payment proof submitted! ResolveHub will review and activate your account.');
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes('already have a pending')) {
        toast.error('You already have a pending request. Please wait for admin review.');
      } else {
        toast.error(msg || 'Failed to submit. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'formSlideIn 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gray-800/50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-400" />
            <h2 className="text-white font-semibold">Submit Payment Proof</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Company name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Company Name</label>
            <Input
              value={form.companyName}
              onChange={set('companyName')}
              placeholder="Your registered company name"
              className="bg-gray-800 border-white/10 text-white placeholder-gray-500 h-10"
            />
          </div>

          {/* Amount + date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Amount Paid (GHS) <span className="text-red-400">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.amountPaid}
                onChange={set('amountPaid')}
                placeholder="299.00"
                required
                className="bg-gray-800 border-white/10 text-white placeholder-gray-500 h-10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Payment Date</label>
              <Input
                type="date"
                value={form.paymentDate}
                onChange={set('paymentDate')}
                className="bg-gray-800 border-white/10 text-white h-10"
              />
            </div>
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Transaction ID <span className="text-red-400">*</span>
            </label>
            <Input
              value={form.transactionId}
              onChange={set('transactionId')}
              placeholder="e.g. GH240501XXXXXX"
              required
              className="bg-gray-800 border-white/10 text-white placeholder-gray-500 h-10"
            />
          </div>

          {/* Network type */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Network / Payment Type
            </label>
            <select
              value={form.network}
              onChange={(e) => {
                const val = e.target.value;
                setForm((f) => ({
                  ...f,
                  network: val,
                  paymentMethod: val === 'BANK' ? 'BANK_TRANSFER' : 'MOBILE_MONEY',
                }));
              }}
              className="w-full h-10 px-3 rounded-lg bg-gray-800 border border-white/10 text-white text-sm focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 outline-none"
            >
              {NETWORKS.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          {/* Phone number (only for mobile money) */}
          {form.paymentMethod === 'MOBILE_MONEY' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Payment Phone Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={form.paymentPhoneNumber}
                  onChange={set('paymentPhoneNumber')}
                  placeholder="0XXXXXXXXX"
                  className="bg-gray-800 border-white/10 text-white placeholder-gray-500 h-10 pl-9"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Additional Notes
            </label>
            <textarea
              value={form.note}
              onChange={set('note')}
              rows={2}
              placeholder="Any additional information for the admin..."
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm resize-none placeholder-gray-500 focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 outline-none"
            />
          </div>

          {/* Proof upload */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Proof of Payment (Image / PDF, max 5 MB)
            </label>
            {previewUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-white/10 bg-gray-800">
                <img
                  src={previewUrl}
                  alt="Payment proof preview"
                  className="w-full max-h-40 object-contain"
                />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreviewUrl(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-24 rounded-lg border-2 border-dashed border-white/10 bg-gray-800/50 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-orange-500/40 hover:text-orange-400 transition-all"
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs">Click to upload receipt</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold shadow-lg shadow-orange-900/30 transition-all"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</>
            ) : (
              <><FileText className="w-4 h-4 mr-2" /> Submit Payment Proof</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Main locked page ────────────────────────────────────────────────────────

const FEATURES = [
  'Dashboard Access',
  'Complaint Management',
  'QR Code Services',
  'Branch Management',
  'Analytics & Reports',
  'Customer Feedback System',
];

const STEPS = [
  'Send payment via Mobile Money or Bank Transfer',
  'Use your registered company name as payment reference',
  'Take a screenshot or photo of the payment receipt',
  'Submit your Transaction ID, Payment Number, Network Type, and receipt image using the form below',
  'Wait for ResolveHub Admin to review and approve your payment',
  'Your account will automatically reactivate after approval',
];

export default function SubscriptionLockedPage() {
  const navigate = useNavigate();
  const { logout, refreshUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleContactSupport = () => {
    window.location.href =
      'mailto:resolvehub3@gmail.com?subject=Subscription%20Access%20Locked%20-%20Payment%20Assistance';
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      await refreshUser();
      toast.success('Access restored! Redirecting to your dashboard…');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'SUBSCRIPTION_LOCKED') {
        toast.error('Your subscription is still locked. Please contact support.');
      } else if (code === 'ACCOUNT_SUSPENDED') {
        navigate('/account-suspended', { replace: true });
      } else {
        toast.error('Unable to verify status. Please try again later.');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      {/* Payment form modal */}
      {showForm && (
        <PaymentForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            setSubmitted(true);
          }}
        />
      )}

      <div
        className="min-h-screen bg-gradient-to-br from-gray-950 via-orange-950/20 to-gray-950 px-4 py-10 overflow-auto"
        style={{ animation: 'lockedFadeIn 0.45s ease-out' }}
      >
        {/* Ambient glows */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-orange-600/8 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-red-600/8 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">

          {/* ── Top warning banner ── */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Subscription Access Locked — Action Required
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_360px] gap-6">

            {/* ── LEFT COLUMN ── */}
            <div className="space-y-5">

              {/* Lock card */}
              <div className="rounded-2xl border border-orange-500/15 bg-gray-900/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-orange-950/30">
                <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" />
                <div className="p-7">
                  {/* Icon */}
                  <div className="flex items-start gap-5 mb-6">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-orange-400" strokeWidth={1.5} />
                      </div>
                      <span className="absolute inset-0 rounded-2xl border border-orange-500/20 animate-ping opacity-30" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
                        🔐 Subscription Access Locked
                      </h1>
                      <p className="text-orange-400/80 text-sm font-medium">
                        Payment required to restore access
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-5">
                    Your <span className="text-white font-medium">ResolveHub</span> company account
                    is currently restricted because your subscription payment has not yet been
                    completed or approved. Your data is safe and will be fully available once
                    payment is confirmed.
                  </p>

                  {/* Restricted features */}
                  <div className="rounded-xl bg-gray-800/50 border border-white/5 p-4 mb-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Restricted Features
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {FEATURES.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60 shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submission success state */}
                  {submitted && (
                    <div className="flex items-start gap-3 rounded-xl bg-green-950/40 border border-green-500/20 p-4 mb-5">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-400">Payment Submitted</p>
                        <p className="text-xs text-green-400/70 mt-0.5">
                          Your proof has been submitted. ResolveHub will review and activate your
                          account. Use &quot;Refresh Status&quot; to check.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CTA buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setShowForm(true)}
                      className="flex-1 h-11 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold shadow-lg shadow-orange-900/30 transition-all"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Submit Payment Proof
                    </Button>
                    <Button
                      onClick={handleContactSupport}
                      variant="outline"
                      className="flex-1 h-11 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>

              {/* ── Payment steps ── */}
              <div className="rounded-2xl border border-white/5 bg-gray-900/60 backdrop-blur-xl p-6">
                <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-400" />
                  Manual Payment Procedure
                </h2>
                <ol className="space-y-3">
                  {STEPS.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </span>
                      <span className="text-gray-400 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-5">

              {/* Contact card */}
              <div className="rounded-2xl border border-white/5 bg-gray-900/80 backdrop-blur-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="text-sm font-semibold text-white">Payment Support</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    We typically respond within 2 business hours
                  </p>
                </div>
                <div className="divide-y divide-white/5">
                  <a
                    href="mailto:resolvehub3@gmail.com"
                    className="flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-200 group-hover:text-white font-medium transition-colors">
                        resolvehub3@gmail.com
                      </p>
                    </div>
                  </a>
                  <a
                    href="tel:+233594345424"
                    className="flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm text-gray-200 group-hover:text-white font-medium transition-colors">
                        +233 59 434 5424
                      </p>
                    </div>
                  </a>
                  <a
                    href="https://getresolvehub.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <p className="text-sm text-gray-200 group-hover:text-white font-medium transition-colors">
                        getresolvehub.com
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Quick actions */}
              <div className="rounded-2xl border border-white/5 bg-gray-900/80 backdrop-blur-xl divide-y divide-white/5 overflow-hidden">
                <button
                  onClick={handleCheckStatus}
                  disabled={checking}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    {checking ? (
                      <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-orange-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                        Refresh Status
                      </p>
                      <p className="text-xs text-gray-500">Check if account is unlocked</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-500/5 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-red-400 transition-colors">
                        Logout
                      </p>
                      <p className="text-xs text-gray-500">Sign out and continue later</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                </button>
              </div>

              {/* Info note */}
              <div className="rounded-xl bg-blue-950/30 border border-blue-500/15 p-4">
                <p className="text-xs text-blue-400/80 leading-relaxed">
                  <span className="font-semibold text-blue-400">Your data is safe.</span> All your
                  complaints, QR codes, branches, and analytics remain intact and will be
                  accessible immediately after activation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes lockedFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes formSlideIn {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
