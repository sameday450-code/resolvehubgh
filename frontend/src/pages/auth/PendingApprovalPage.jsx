import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, CheckCircle, Mail, Building2, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';
import { authAPI } from '../../lib/api';

export default function PendingApprovalPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [checking, setChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  const companyName = searchParams.get('company') || 'Your company';
  const email = searchParams.get('email') || '';

  // If somehow user is authenticated and approved, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.company?.status === 'APPROVED') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleCheckStatus = async () => {
    if (!email) return;
    setChecking(true);
    try {
      const response = await authAPI.login({ email, password: 'check' });
      // If login succeeds, company is approved
      toast.success('Your company has been approved! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const message = err.response?.data?.message || '';
      if (message.includes('pending approval')) {
        toast.error('Your company is still pending approval. Please check back soon.');
      } else if (message.includes('rejected')) {
        toast.error('Your company registration has been rejected.');
        setTimeout(() => navigate('/'), 3000);
      } else {
        // For any other error, show generic message
        toast.error('Company still pending approval.');
      }
      setCheckCount(c => c + 1);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8 px-4">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img src="/auth-bg.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="w-full max-w-[520px] relative z-10 animate-scale-in">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Glass card */}
        <div className="login-glass-card rounded-2xl p-8 sm:p-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
          {/* Header with icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-gray-900 dark:text-white mb-2">
            Waiting for Approval
          </h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            Thank you for registering with ResolveHub
          </p>

          {/* Status message */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5 mb-8">
            <div className="flex gap-3">
              <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {companyName}
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                  Registration under review by our admin team
                </p>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="space-y-4 mb-8">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              What happens next:
            </p>

            <div className="space-y-3">
              {[
                {
                  icon: Clock,
                  title: '1-2 Business Days',
                  desc: 'Our team reviews your registration details',
                },
                {
                  icon: Mail,
                  title: 'Approval Email',
                  desc: 'You\'ll receive an email when your account is approved',
                },
                {
                  icon: CheckCircle,
                  title: 'Dashboard Access',
                  desc: 'Access your dashboard and start managing complaints',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-xs text-blue-900 dark:text-blue-200">
              <strong>Need help?</strong> If you have questions about your registration, contact us at{' '}
              <a href="mailto:support@resolvehub.com" className="underline font-semibold hover:text-blue-700 dark:hover:text-blue-100">
                support@resolvehub.com
              </a>
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleCheckStatus}
              disabled={checking || !email}
              className="w-full h-11 font-semibold rounded-xl"
            >
              {checking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Checking Status...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Approval Status
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full h-11 font-medium rounded-xl"
            >
              Go to Login Page
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              You'll receive an email notification as soon as your account is approved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
