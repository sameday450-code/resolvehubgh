import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, ArrowLeft, Building2, UserCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    companyName: '',
    industry: '',
    contactEmail: '',
    contactPhone: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planType = (searchParams.get('plan') || 'starter_trial').toUpperCase().replace(/-/g, '_');
  const isStarterTrial = planType === 'STARTER_TRIAL';

  // Redirect enterprise_monthly to the dedicated registration page
  if (planType === 'ENTERPRISE_MONTHLY') {
    return <Navigate to="/register/enterprise" replace />;
  }

  const update = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (!form.agreeToTerms) return toast.error('You must agree to the terms');

    setLoading(true);
    try {
      const result = await register({
        companyName: form.companyName,
        email: form.email,
        adminFullName: form.name,
        adminPhone: form.contactPhone,
        password: form.password,
        confirmPassword: form.confirmPassword,
        industry: form.industry || undefined,
        agreeToTerms: form.agreeToTerms,
        planType,
      });
      if (result?.isTrialActivated) {
        toast.success('Your 14-day free trial is active! You can log in now.');
        navigate('/login?trial=activated');
      } else {
        toast.success('Registration successful! Your company is pending approval.');
        navigate('/login');
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        data.errors.forEach((e) => toast.error(e.message));
      } else {
        toast.error(data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-11 text-gray-900 dark:text-white placeholder:text-gray-400";

  const handleGoogleClick = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const result = await googleLogin(tokenResponse.access_token);
        if (result.isNewUser) {
          toast.success('Registration successful! Your company is pending approval.');
          navigate('/login');
        } else {
          toast.success('Welcome back!');
          navigate('/dashboard');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google sign-up failed');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error('Google sign-up failed');
      setGoogleLoading(false);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8 px-4">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <img src="/auth-bg.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="w-full max-w-[820px] relative z-10 animate-scale-in">
        {/* Home button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Glass card */}
        <div className="login-glass-card rounded-2xl p-8 sm:p-10 bg-white/90 dark:bg-gray-900/90">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-6">
            <img src="/logo.png" alt="ResolveHub" className="h-6 w-6" />
            <span className="text-lg font-bold tracking-tight">ResolveHub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Register your company and start managing complaints in minutes
          </p>
          {isStarterTrial && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
              <span className="text-emerald-600 text-lg leading-none mt-0.5">🎉</span>
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">14-Day Free Trial</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">No credit card required. You'll get instant access after registration.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* ─── Company Details Column ─── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company Details</h3>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 dark:text-gray-200">Company Name</Label>
                  <div className={`login-input-wrapper ${focused === 'companyName' ? 'login-input-focused' : ''}`}>
                    <Input
                      id="companyName"
                      placeholder="Acme Inc."
                      value={form.companyName}
                      onChange={update('companyName')}
                      onFocus={() => setFocused('companyName')}
                      onBlur={() => setFocused(null)}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="industry" className="text-sm font-medium text-gray-700 dark:text-gray-200">Industry</Label>
                    <div className={`login-input-wrapper ${focused === 'industry' ? 'login-input-focused' : ''}`}>
                      <Input
                        id="industry"
                        placeholder="e.g. Retail"
                        value={form.industry}
                        onChange={update('industry')}
                        onFocus={() => setFocused('industry')}
                        onBlur={() => setFocused(null)}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactPhone" className="text-sm font-medium text-gray-700 dark:text-gray-200">Phone</Label>
                    <div className={`login-input-wrapper ${focused === 'contactPhone' ? 'login-input-focused' : ''}`}>
                      <Input
                        id="contactPhone"
                        placeholder="+1234567890"
                        value={form.contactPhone}
                        onChange={update('contactPhone')}
                        onFocus={() => setFocused('contactPhone')}
                        onBlur={() => setFocused(null)}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700 dark:text-gray-200">Company Email</Label>
                  <div className={`login-input-wrapper ${focused === 'contactEmail' ? 'login-input-focused' : ''}`}>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="info@company.com"
                      value={form.contactEmail}
                      onChange={update('contactEmail')}
                      onFocus={() => setFocused('contactEmail')}
                      onBlur={() => setFocused(null)}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* ─── Admin Account Column ─── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <UserCircle className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin Account</h3>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-200">Full Name</Label>
                  <div className={`login-input-wrapper ${focused === 'name' ? 'login-input-focused' : ''}`}>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={update('name')}
                      onFocus={() => setFocused('name')}
                      onBlur={() => setFocused(null)}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</Label>
                  <div className={`login-input-wrapper ${focused === 'email' ? 'login-input-focused' : ''}`}>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={form.email}
                      onChange={update('email')}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      required
                      autoComplete="email"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">Password</Label>
                  <div className={`login-input-wrapper ${focused === 'password' ? 'login-input-focused' : ''}`}>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        value={form.password}
                        onChange={update('password')}
                        onFocus={() => setFocused('password')}
                        onBlur={() => setFocused(null)}
                        required
                        autoComplete="new-password"
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-200">Confirm Password</Label>
                  <div className={`login-input-wrapper ${focused === 'confirmPassword' ? 'login-input-focused' : ''}`}>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={form.confirmPassword}
                        onChange={update('confirmPassword')}
                        onFocus={() => setFocused('confirmPassword')}
                        onBlur={() => setFocused(null)}
                        required
                        autoComplete="new-password"
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer area spanning full width */}
            <div className="mt-8 pt-6 border-t border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={form.agreeToTerms}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, agreeToTerms: checked }))}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-500 dark:text-gray-400 leading-tight cursor-pointer">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline underline-offset-4">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary hover:underline underline-offset-4">Privacy Policy</a>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="h-11 px-8 text-sm font-semibold rounded-xl login-btn-primary relative overflow-hidden sm:min-w-[200px]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    'Register Company'
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-3 text-gray-400">or continue with</span>
            </div>
          </div>

          {/* Google sign-up */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl font-medium gap-3"
            disabled={googleLoading}
            onClick={() => handleGoogleClick()}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="mt-6 pt-5 border-t border-border/30">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
