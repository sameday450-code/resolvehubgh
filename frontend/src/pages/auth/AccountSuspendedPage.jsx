import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../lib/api';
import {
  AlertTriangle,
  Mail,
  Phone,
  Globe,
  LogOut,
  RefreshCw,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';

export default function AccountSuspendedPage() {
  const navigate = useNavigate();
  const { logout, refreshUser } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:resolvehub3@gmail.com?subject=Account%20Suspension%20-%20Reactivation%20Request';
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      await refreshUser();
      toast.success('Access restored! Redirecting to your dashboard…');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'ACCOUNT_SUSPENDED') {
        toast.error('Your account is still suspended. Please contact support.');
      } else {
        toast.error('Unable to verify status. Please try again later.');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-red-950/30 to-gray-950 px-4 py-12 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-orange-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-900/5 blur-3xl" />
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[560px] rounded-2xl border border-red-500/20 bg-gray-900/80 backdrop-blur-xl shadow-2xl shadow-red-950/40 overflow-hidden"
        style={{ animation: 'suspendedFadeIn 0.5s ease-out' }}
      >
        {/* Top danger strip */}
        <div className="h-1 w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />

        <div className="px-8 py-10 sm:px-10">

          {/* Icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <ShieldAlert className="w-10 h-10 text-red-400" strokeWidth={1.5} />
              </div>
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full border border-red-500/30 animate-ping opacity-40" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Account Suspended
              </h1>
            </div>
            <p className="text-sm text-red-400/80 font-medium uppercase tracking-widest">
              Access Restricted
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5 mb-6" />

          {/* Message */}
          <div className="rounded-xl bg-red-950/40 border border-red-500/15 p-5 mb-6 space-y-3">
            <p className="text-gray-200 text-sm leading-relaxed">
              Your company account has been{' '}
              <span className="text-red-400 font-semibold">temporarily suspended</span> by
              ResolveHub. For security and compliance reasons, access to your dashboard, branches,
              QR codes, complaints, analytics, billing, and settings has been restricted.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              To reactivate your account, please contact the{' '}
              <span className="text-orange-400 font-semibold">ResolveHub Support Team</span> using
              the details below.
            </p>
          </div>

          {/* Contact details */}
          <div className="rounded-xl bg-gray-800/50 border border-white/5 divide-y divide-white/5 mb-8">
            <a
              href="mailto:resolvehub3@gmail.com"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-sm text-gray-200 group-hover:text-white transition-colors font-medium">
                  resolvehub3@gmail.com
                </p>
              </div>
            </a>

            <a
              href="tel:+233594345424"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                <p className="text-sm text-gray-200 group-hover:text-white transition-colors font-medium">
                  +233 59 434 5424
                </p>
              </div>
            </a>

            <a
              href="https://getresolvehub.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Website</p>
                <p className="text-sm text-gray-200 group-hover:text-white transition-colors font-medium">
                  getresolvehub.com
                </p>
              </div>
            </a>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleContactSupport}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold h-11 transition-all duration-200 shadow-lg shadow-red-900/30"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCheckStatus}
                disabled={checking}
                variant="outline"
                className="h-10 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
              >
                {checking ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Check Status
              </Button>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="h-10 border-white/10 bg-white/5 text-gray-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-gray-600 leading-relaxed">
            Suspension ID is logged for compliance. If you believe this is an error, quote your
            company email when contacting support.
          </p>
        </div>
      </div>

      {/* Keyframe style */}
      <style>{`
        @keyframes suspendedFadeIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}
