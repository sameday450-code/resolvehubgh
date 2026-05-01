import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Shield, Lock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import toast from 'react-hot-toast';

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { superAdminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      await superAdminLogin(email, password);
      toast.success('Welcome, Super Admin');
      navigate('/super-admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/auth-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50" />

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 hover:bg-white/15 transition-all duration-300">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Shield Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full">
                <Shield className="h-7 w-7 text-white" />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-2">Super Admin</h1>
            <p className="text-white/70 text-sm">Secure Access Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90 font-medium">
                Email Address
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@resolvehub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-lg focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-blue-400/50 transition-all pl-4 py-2.5"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90 font-medium">
                Password
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-lg focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-blue-400/50 transition-all pl-4 py-2.5 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="h-5 w-5" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          {/* Footer Note */}
          <p className="text-center text-white/50 text-xs mt-6">
            🔐 This is a restricted area for administrators only
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
