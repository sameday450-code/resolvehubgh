import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, ArrowLeft, Shield, BarChart3, Zap, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('trial') === 'activated') {
      toast.success('Your 14-day free trial is active! Log in to get started.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const result = await googleLogin(tokenResponse.access_token);
        toast.success('Welcome back!');
        if (result.user.role === 'SUPER_ADMIN') {
          navigate('/super-admin');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google sign-in failed');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error('Google sign-in failed');
      setGoogleLoading(false);
    },
  });

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <img src="/auth-bg.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Left side - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-[420px] animate-scale-in">
          {/* Home button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          {/* Glass card */}
          <div className="login-glass-card rounded-2xl p-8 sm:p-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <img src="/logo.png" alt="ResolveHub" className="h-6 w-6" />
              <span className="text-lg font-bold tracking-tight">ResolveHub</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Sign in to access your company dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className={`login-input-wrapper ${focused === 'email' ? 'login-input-focused' : ''}`}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    required
                    autoComplete="email"
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className={`login-input-wrapper ${focused === 'password' ? 'login-input-focused' : ''}`}>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      required
                      autoComplete="current-password"
                      className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-11 pr-10"
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

              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold rounded-xl login-btn-primary relative overflow-hidden"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">or continue with</span>
              </div>
            </div>

            {/* Google sign-in */}
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

            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-primary font-semibold hover:underline underline-offset-4">
                  Register your company
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10">
        <div className="max-w-lg p-12 animate-fade-up">
          {/* Floating decorative icon */}
          <div className="relative mb-10">
            <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl animate-pulse-glow" />
            <div className="relative bg-gradient-to-br from-primary via-primary/90 to-blue-600 p-5 rounded-2xl w-fit shadow-2xl shadow-primary/25 animate-float">
              <img src="/public/logo.png" alt="ResolveHub" className="h-10 w-10" />
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">
            Manage Complaints
            <span className="block text-blue-400">Smarter & Faster</span>
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-10">
            Access your dashboard to track complaints, manage branches, and gain real-time insights — all from one place.
          </p>

          {/* Feature highlights */}
          <div className="space-y-5">
            {[
              { icon: Shield, label: 'Secure & reliable platform', delay: '0.1s' },
              { icon: BarChart3, label: 'Real-time analytics & reports', delay: '0.2s' },
              { icon: Zap, label: 'Instant notifications & updates', delay: '0.3s' },
            ].map(({ icon: Icon, label, delay }) => (
              <div
                key={label}
                className="flex items-center gap-3 opacity-0 animate-fade-up"
                style={{ animationDelay: delay }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-sm font-medium text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
