import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Building2,
  UserCircle,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Company & Account', icon: Building2 },
  { id: 2, label: 'Billing Details', icon: CreditCard },
];

const GATEWAYS = [
  {
    id: 'PAYSTACK',
    name: 'Paystack',
    description: 'Pay in GHS — cards, mobile money, bank transfer',
    color: 'border-[#00c3a0] bg-[#00c3a0]/5',
    activeColor: 'border-[#00c3a0] bg-[#00c3a0]/10 ring-2 ring-[#00c3a0]/30',
    dot: 'bg-[#00c3a0]',
  },
  {
    id: 'STRIPE',
    name: 'Stripe',
    description: 'Pay in USD — international cards & wallets',
    color: 'border-[#635bff] bg-[#635bff]/5',
    activeColor: 'border-[#635bff] bg-[#635bff]/10 ring-2 ring-[#635bff]/30',
    dot: 'bg-[#635bff]',
  },
];

const PLAN_FEATURES = [
  'Up to 50 branches',
  'Up to 200 QR codes',
  'Up to 100 staff accounts',
  'Advanced analytics & export',
  'Real-time notifications',
  'Priority support',
  'Custom branding',
];

export default function EnterpriseRegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const { registerEnterprise } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // Step 1 — company + account
    companyName: '',
    industry: '',
    country: 'Ghana',
    adminFullName: '',
    email: '',
    adminPhone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    // Step 2 — billing
    billingName: '',
    billingEmail: '',
    billingPhone: '',
    billingCountry: 'Ghana',
    billingAddress: '',
    gateway: 'PAYSTACK',
  });

  const update = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!form.companyName.trim()) return 'Company name is required';
    if (!form.adminFullName.trim()) return 'Your full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!form.adminPhone.trim()) return 'Phone number is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(form.password)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(form.password)) return 'Password must contain a number';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (!form.agreeToTerms) return 'You must agree to the terms';
    return null;
  };

  const handleNextStep = () => {
    const err = validateStep1();
    if (err) { toast.error(err); return; }
    // Pre-fill billing fields from step 1 if empty
    setForm((prev) => ({
      ...prev,
      billingName: prev.billingName || prev.companyName,
      billingEmail: prev.billingEmail || prev.email,
      billingPhone: prev.billingPhone || prev.adminPhone,
      billingCountry: prev.billingCountry || prev.country,
    }));
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.billingName.trim()) return toast.error('Billing name is required');
    if (!form.billingEmail.trim()) return toast.error('Billing email is required');
    if (!form.billingAddress.trim()) return toast.error('Billing address is required');
    if (!form.gateway) return toast.error('Please select a payment gateway');

    setLoading(true);
    try {
      const result = await registerEnterprise({
        companyName: form.companyName,
        email: form.email,
        adminFullName: form.adminFullName,
        adminPhone: form.adminPhone,
        password: form.password,
        confirmPassword: form.confirmPassword,
        industry: form.industry || undefined,
        country: form.country,
        agreeToTerms: form.agreeToTerms,
        billingName: form.billingName,
        billingEmail: form.billingEmail,
        billingPhone: form.billingPhone,
        billingCountry: form.billingCountry,
        billingAddress: form.billingAddress,
        gateway: form.gateway,
      });

      if (result?.isPendingPayment) {
        toast.success('Account created! Redirecting to payment...');
        navigate('/pending-payment');
      } else {
        toast.success('Registration successful!');
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

  const inputClass =
    'border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-11 text-gray-900 dark:text-white placeholder:text-gray-400';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8 px-4">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img src="/auth-bg.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="w-full max-w-[900px] relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <div className="login-glass-card rounded-2xl p-8 sm:p-10 bg-white/90 dark:bg-gray-900/90">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-2">
            <img src="/public/logo.png" alt="ResolveHub" className="h-6 w-6" />
            <span className="text-lg font-bold tracking-tight">ResolveHub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
            Enterprise Monthly Plan
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            GHS 299/month · 50 branches · 200 QR codes · Priority support
          </p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    step === s.id
                      ? 'bg-primary text-white'
                      : step > s.id
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s.id ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <s.icon className="h-3 w-3" />
                  )}
                  {s.label}
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* ─────────────── STEP 1 ─────────────── */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Company column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Company Details
                  </h3>
                </div>

                {[
                  { id: 'companyName', label: 'Company Name', placeholder: 'Acme Inc.' },
                  { id: 'industry', label: 'Industry (optional)', placeholder: 'e.g. Retail' },
                  { id: 'country', label: 'Country', placeholder: 'Ghana' },
                ].map(({ id, label, placeholder }) => (
                  <div key={id} className="space-y-1.5">
                    <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
                    <div className={`login-input-wrapper ${focused === id ? 'login-input-focused' : ''}`}>
                      <Input
                        id={id}
                        placeholder={placeholder}
                        value={form[id]}
                        onChange={update(id)}
                        onFocus={() => setFocused(id)}
                        onBlur={() => setFocused(null)}
                        required={id !== 'industry'}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Admin column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <UserCircle className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Admin Account
                  </h3>
                </div>

                {[
                  { id: 'adminFullName', label: 'Full Name', placeholder: 'Jane Doe' },
                  { id: 'email', label: 'Email Address', placeholder: 'you@company.com', type: 'email' },
                  { id: 'adminPhone', label: 'Phone Number', placeholder: '+233 XX XXX XXXX' },
                ].map(({ id, label, placeholder, type }) => (
                  <div key={id} className="space-y-1.5">
                    <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
                    <div className={`login-input-wrapper ${focused === id ? 'login-input-focused' : ''}`}>
                      <Input
                        id={id}
                        type={type || 'text'}
                        placeholder={placeholder}
                        value={form[id]}
                        onChange={update(id)}
                        onFocus={() => setFocused(id)}
                        onBlur={() => setFocused(null)}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className={`login-input-wrapper ${focused === 'password' ? 'login-input-focused' : ''} flex items-center pr-3`}>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={update('password')}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      required
                      className={inputClass}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className={`login-input-wrapper ${focused === 'confirmPassword' ? 'login-input-focused' : ''} flex items-center pr-3`}>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={update('confirmPassword')}
                      onFocus={() => setFocused('confirmPassword')}
                      onBlur={() => setFocused(null)}
                      required
                      className={inputClass}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-muted-foreground hover:text-foreground">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="md:col-span-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreeToTerms"
                    checked={form.agreeToTerms}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, agreeToTerms: v }))}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </Label>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="button" onClick={handleNextStep} className="h-12 px-8 gap-2">
                  Next: Billing Details
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ─────────────── STEP 2 ─────────────── */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Billing info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Billing Information
                    </h3>
                  </div>

                  {[
                    { id: 'billingName', label: 'Billing Name / Company', placeholder: 'Acme Inc.' },
                    { id: 'billingEmail', label: 'Billing Email', placeholder: 'billing@company.com', type: 'email' },
                    { id: 'billingPhone', label: 'Billing Phone', placeholder: '+233 XX XXX XXXX' },
                    { id: 'billingCountry', label: 'Country', placeholder: 'Ghana' },
                    { id: 'billingAddress', label: 'Address', placeholder: '123 Main St, Accra' },
                  ].map(({ id, label, placeholder, type }) => (
                    <div key={id} className="space-y-1.5">
                      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
                      <div className={`login-input-wrapper ${focused === id ? 'login-input-focused' : ''}`}>
                        <Input
                          id={id}
                          type={type || 'text'}
                          placeholder={placeholder}
                          value={form[id]}
                          onChange={update(id)}
                          onFocus={() => setFocused(id)}
                          onBlur={() => setFocused(null)}
                          required={id !== 'billingPhone'}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Plan summary + gateway */}
                <div className="space-y-4">
                  {/* Plan summary card */}
                  <div className="rounded-xl border bg-muted/30 p-5">
                    <p className="text-sm font-semibold mb-3">Enterprise Monthly</p>
                    <p className="text-3xl font-bold mb-1">GHS 299<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <ul className="mt-3 space-y-2">
                      {PLAN_FEATURES.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="h-3 w-3 text-primary shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Gateway selection */}
                  <div>
                    <Label className="text-sm font-medium block mb-2">Payment Gateway</Label>
                    <div className="space-y-2">
                      {GATEWAYS.map((gw) => (
                        <button
                          key={gw.id}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, gateway: gw.id }))}
                          className={`w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                            form.gateway === gw.id ? gw.activeColor : `border-border hover:${gw.color}`
                          }`}
                        >
                          <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${gw.dot}`} />
                          <div>
                            <p className="text-sm font-semibold">{gw.name}</p>
                            <p className="text-xs text-muted-foreground">{gw.description}</p>
                          </div>
                          {form.gateway === gw.id && (
                            <Check className="h-4 w-4 text-primary ml-auto shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex items-center justify-between gap-4 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-11 gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="h-11 px-8 gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account & Pay
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
