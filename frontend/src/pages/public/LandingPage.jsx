import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  QrCode,
  BarChart3,
  Bell,
  Shield,
  Building2,
  Zap,
  Star,
  ChevronRight,
  Check,
  ArrowRight,
  MessageSquareWarning,
  Globe,
  HelpCircle,
  Sparkles,
  Mail,
  Plus,
  Minus,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/accordion';

const features = [
  { icon: QrCode, title: 'QR Code Generation', description: 'Generate unique QR codes for each branch and complaint point. Customers simply scan to submit feedback.' },
  { icon: MessageSquareWarning, title: 'Real-Time Complaints', description: 'Receive complaints instantly with real-time notifications. Never miss critical customer feedback.' },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'Visualize complaint trends, resolution times, peak hours, and branch performance with rich dashboards.' },
  { icon: Bell, title: 'Instant Notifications', description: 'Get notified the moment a complaint arrives. Assign, escalate, and resolve faster than ever.' },
  { icon: Building2, title: 'Multi-Branch Support', description: 'Manage multiple branches and complaint points from a single dashboard. Perfect for growing businesses.' },
  { icon: Shield, title: 'Enterprise Security', description: 'Role-based access control, tenant isolation, encrypted data, and full audit trails for compliance.' },
];

const plans = [
  {
    name: 'Starter Trial',
    planType: 'starter_trial',
    price: '0',
    period: '/14 days',
    description: 'Free trial — no credit card required',
    features: [
      'Up to 2 branches',
      'Up to 10 QR codes',
      'Up to 5 staff accounts',
      'Basic analytics',
      'Email notifications',
      'Community support',
    ],
    cta: 'Start 14-Day Free Trial',
    popular: false,
    trialBadge: true,
  },
  {
    name: 'Enterprise Monthly',
    planType: 'enterprise_monthly',
    price: '299',
    period: '/month',
    priceCurrency: 'GHS',
    description: 'For growing businesses that need full power',
    features: [
      'Up to 50 branches',
      'Up to 200 QR codes',
      'Up to 100 staff accounts',
      'Advanced analytics & export',
      'Real-time notifications',
      'Priority support',
      'Custom branding',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Custom Enterprise',
    planType: 'custom_enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored for large organizations with unique requirements',
    features: [
      'Unlimited branches',
      'Unlimited QR codes & staff',
      'Full analytics suite',
      'Real-time notifications',
      '24/7 dedicated support',
      'White-label branding',
      'API access & SLA guarantee',
      'Bespoke onboarding',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const faqs = [
  { q: 'How does the QR complaint system work?', a: 'You generate unique QR codes for your branches and complaint points. Place them in your physical locations. When customers scan the QR code, they are taken to a branded complaint form where they can submit feedback with photos and details. You receive the complaint in real-time on your dashboard.' },
  { q: 'Can customers submit complaints anonymously?', a: 'Yes. Customers can choose to submit complaints anonymously or provide their contact information for follow-up. Anonymous complaints are tracked with reference numbers.' },
  { q: 'How long does setup take?', a: 'After your company is approved by our team (usually within 24 hours), you can set up branches, generate QR codes, and start receiving complaints immediately. The entire process takes less than 30 minutes.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use enterprise-grade security including encrypted data transmission, tenant isolation, role-based access control, and regular security audits. Your data is never shared with third parties.' },
  { q: 'Can I manage multiple branches?', a: 'Yes. ResolveHub is designed for multi-branch businesses. Each branch can have its own complaint points, QR codes, and staff assignments. Analytics can be viewed per-branch or company-wide.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/60 to-transparent dark:from-background/90 dark:via-background/70 dark:to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-white/40 dark:from-background/60 dark:via-transparent dark:to-background/40" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium backdrop-blur-sm bg-white/70 dark:bg-background/70 border border-primary/10 shadow-sm">
              <Zap className="mr-1.5 h-3 w-3 text-primary" />
              Trusted by 500+ businesses worldwide
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Real-Time{' '}
              <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">QR Complaint</span>{' '}
              &amp; Feedback Reporting
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed">
              Transform how your business handles customer complaints. Generate QR codes, receive instant feedback, 
              and resolve issues faster with ResolveHub's intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button size="lg" className="shadow-lg shadow-primary/25 px-8 h-12 text-base" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="backdrop-blur-sm bg-white/50 dark:bg-background/50 h-12 px-8 text-base" asChild>
                <a href="#features">
                  See How It Works
                </a>
              </Button>
            </div>

            {/* Stats bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '20K+', label: 'Complaints Resolved' },
                { value: '50+', label: 'Active Companies' },
                { value: '1K+', label: 'QR Codes Active' },
                { value: '< 1hr', label: 'Avg Resolution' },
              ].map((stat) => (
                <div key={stat.label} className="backdrop-blur-sm bg-white/50 dark:bg-background/50 rounded-xl px-4 py-3 border border-white/60 dark:border-border/30 shadow-sm">
                  <p className="text-xl md:text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/[0.02] to-blue-400/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="text-center mb-16 md:mb-20">
            <Badge variant="secondary" className="mb-5 px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-primary/5 border-primary/10 text-primary">
              <Zap className="mr-1.5 h-3 w-3" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Succeed</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              A complete platform for managing complaints across all your locations with powerful tools, real-time insights, and enterprise-grade security.
            </p>
          </div>

          {/* Bento grid layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-6xl mx-auto auto-rows-[minmax(220px,auto)]">
            {features.map((feature, index) => {
              const isLarge = index === 0 || index === 3;
              const gradients = [
                'from-primary/15 via-blue-500/10 to-indigo-500/5',
                'from-emerald-500/15 via-teal-500/10 to-cyan-500/5',
                'from-violet-500/15 via-purple-500/10 to-fuchsia-500/5',
                'from-amber-500/15 via-orange-500/10 to-red-500/5',
                'from-sky-500/15 via-blue-500/10 to-indigo-500/5',
                'from-rose-500/15 via-pink-500/10 to-fuchsia-500/5',
              ];
              const iconColors = [
                'text-primary',
                'text-emerald-500',
                'text-violet-500',
                'text-amber-500',
                'text-sky-500',
                'text-rose-500',
              ];
              const iconBgColors = [
                'bg-primary/10 ring-primary/20 group-hover:bg-primary/20',
                'bg-emerald-500/10 ring-emerald-500/20 group-hover:bg-emerald-500/20',
                'bg-violet-500/10 ring-violet-500/20 group-hover:bg-violet-500/20',
                'bg-amber-500/10 ring-amber-500/20 group-hover:bg-amber-500/20',
                'bg-sky-500/10 ring-sky-500/20 group-hover:bg-sky-500/20',
                'bg-rose-500/10 ring-rose-500/20 group-hover:bg-rose-500/20',
              ];

              return (
                <div
                  key={feature.title}
                  className={`group relative rounded-3xl border border-border/40 bg-card/60 backdrop-blur-sm p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 overflow-hidden ${
                    isLarge ? 'lg:col-span-2 lg:row-span-1' : ''
                  }`}
                >
                  {/* Animated gradient background on hover */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  {/* Corner glow */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700" />
                  {/* Bottom border glow */}
                  <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className={`relative h-full flex flex-col ${isLarge ? 'lg:flex-row lg:items-center lg:gap-8' : ''}`}>
                    {/* Icon container */}
                    <div className={`relative mb-5 ${isLarge ? 'lg:mb-0' : ''}`}>
                      <div className={`relative inline-flex rounded-2xl p-4 ring-1 transition-all duration-500 ${iconBgColors[index]}`}>
                        <feature.icon className={`h-6 w-6 ${iconColors[index]} transition-transform duration-500 group-hover:scale-110`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold mb-2.5 tracking-tight group-hover:text-foreground transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className={`text-sm text-muted-foreground leading-relaxed ${isLarge ? 'max-w-md' : ''}`}>
                        {feature.description}
                      </p>

                      {/* Feature highlights for large cards */}
                      {isLarge && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {(index === 0
                            ? ['Unique codes', 'Instant scan', 'Custom branding']
                            : ['Real-time alerts', 'Assign staff', 'Escalation rules']
                          ).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-background/80 border border-border/50 text-muted-foreground"
                            >
                              <Check className="h-3 w-3 text-primary" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Arrow indicator */}
                      <div className="mt-auto pt-5">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border/50 bg-background/50 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom stat bar */}
          <div className="mt-16 md:mt-20 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {[
                  { value: '99.9%', label: 'Uptime SLA' },
                  { value: '<2s', label: 'Notification Speed' },
                  { value: '20+', label: 'Companies Trust Us' },
                  { value: '25k+', label: 'Complaints Resolved' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-muted/30" />
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-20">
            <Badge variant="secondary" className="mb-5 px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-primary/5 border-primary/10 text-primary">
              <Zap className="mr-1.5 h-3 w-3" />
              Simple Process
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              How It{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Get started in three simple steps and start receiving customer feedback within minutes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
            {[
              { step: '1', title: 'Register & Setup', description: 'Create your company account, add branches, and configure your complaint categories. Our team approves you within 24 hours.' },
              { step: '2', title: 'Generate QR Codes', description: 'Generate unique QR codes for each branch and complaint point. Print and place them in your physical locations.' },
              { step: '3', title: 'Receive & Resolve', description: 'Customers scan the QR code and submit complaints. You receive them instantly and can assign, track, and resolve from your dashboard.' },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-xl mb-6 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-20">
            <Badge variant="secondary" className="mb-5 px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-primary/5 border-primary/10 text-primary">
              <Zap className="mr-1.5 h-3 w-3" />
              Pricing
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              Simple, Transparent{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Pricing</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Choose the plan that fits your business. All plans include a 14-day free trial.
            </p>
            {/* Toggle (visual only) */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-muted/50 border border-border/40 p-1.5">
              <span className="px-4 py-2 text-sm font-medium rounded-full bg-background shadow-sm">Monthly</span>
              <span className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-full">Yearly <span className="text-primary text-xs font-semibold ml-1">-20%</span></span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto items-start">
            {plans.map((plan, planIdx) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl transition-all duration-500 hover:-translate-y-1 ${
                  plan.popular
                    ? 'border-2 border-primary bg-card shadow-2xl shadow-primary/15 ring-1 ring-primary/10 scale-[1.02] md:scale-105 z-10'
                    : 'border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-primary/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white border-0 px-5 py-1.5 text-xs font-semibold shadow-lg shadow-primary/25">
                      <Sparkles className="mr-1.5 h-3 w-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Card content */}
                <div className="p-8 md:p-10">
                  {/* Plan header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${
                        plan.popular ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted ring-1 ring-border/40'
                      }`}>
                        {planIdx === 0 && <Zap className="h-5 w-5 text-muted-foreground" />}
                        {planIdx === 1 && <Star className="h-5 w-5 text-primary" />}
                        {planIdx === 2 && <Shield className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{plan.name}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      {plan.planType === 'custom_enterprise' ? (
                        <span className="text-5xl md:text-6xl font-bold tracking-tight">Custom</span>
                      ) : (
                        <>
                          <span className="text-sm text-muted-foreground font-medium">
                            {plan.priceCurrency || 'GHS'}
                          </span>
                          <span className="text-5xl md:text-6xl font-bold tracking-tight">{plan.price}</span>
                          <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                        </>
                      )}
                    </div>
                    {plan.planType === 'enterprise_monthly' && (
                      <p className="text-xs text-primary font-medium mt-2">Contact us for yearly billing discounts</p>
                    )}
                    {plan.trialBadge && (
                      <p className="text-xs text-emerald-600 font-medium mt-2">No credit card required</p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

                  {/* Features list */}
                  <ul className="space-y-3.5 mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <div className={`mt-0.5 rounded-full p-0.5 shrink-0 ${plan.popular ? 'bg-primary/15' : 'bg-primary/10'}`}>
                          <Check className={`h-3 w-3 ${plan.popular ? 'text-primary' : 'text-primary/80'}`} />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    className={`w-full h-12 text-sm font-medium rounded-xl ${
                      plan.popular
                        ? 'shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => {
                      if (plan.planType === 'starter_trial') {
                        navigate('/register?plan=starter_trial');
                      } else if (plan.planType === 'enterprise_monthly') {
                        navigate('/register/enterprise');
                      } else {
                        navigate('/contact?type=sales');
                      }
                    }}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Money-back guarantee */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted/50 border border-border/40">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">14-day free trial · No credit card required · Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-muted/30" />
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-20">
            <Badge variant="secondary" className="mb-5 px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-primary/5 border-primary/10 text-primary">
              <Star className="mr-1.5 h-3 w-3" />
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              Loved by Businesses{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Worldwide</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              See how companies are transforming their feedback management with ResolveHub.
            </p>
          </div>

          {/* Featured testimonial */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.02] p-10 md:p-14 shadow-xl shadow-primary/5">
              <div className="absolute top-8 right-10 text-8xl font-serif text-primary/10 leading-none select-none">&ldquo;</div>
              <div className="relative">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 font-medium">
                  &ldquo;ResolveHub completely transformed our customer feedback process. We went from chaotic email threads to a streamlined system that gives us real-time visibility across all 45 locations. Resolution time dropped 60% in the first month.&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-bold ring-4 ring-primary/10">
                    SJ
                  </div>
                  <div>
                    <p className="font-semibold text-base">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Operations Manager, RetailCo</p>
                    <p className="text-xs text-primary font-medium mt-0.5">45 branches · Enterprise plan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial cards grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {[
              { name: 'Ahmed Al-Rashid', role: 'CEO, FoodChain Group', text: 'The QR code system is brilliant. Our customers love the simplicity, and we love the real-time insights across all our branches. Setup took less than 20 minutes.', initials: 'AA', metric: '40% more feedback collected' },
              { name: 'Maria Garcia', role: 'Quality Director, HotelPrime', text: 'The analytics dashboard gives us incredible visibility into complaint patterns. We can now proactively address issues before they escalate.', initials: 'MG', metric: '3x faster response times' },
              { name: 'James Chen', role: 'COO, TechRetail', text: 'Multi-branch management is seamless. Each location manager gets their own view while we maintain oversight of everything from HQ.', initials: 'JC', metric: '25 branches managed' },
              { name: 'Fatima Hassan', role: 'CX Lead, ServiceFirst', text: 'Anonymous feedback option means we get honest, actionable insights. Our customer satisfaction scores improved by 35% in three months.', initials: 'FH', metric: '+35% satisfaction scores' },
              { name: 'David Kim', role: 'Founder, QuickBites', text: 'As a small chain, the free tier was perfect to start. We upgraded within two weeks because the value was immediately obvious.', initials: 'DK', metric: 'Free to Pro in 2 weeks' },
              { name: 'Lisa Thompson', role: 'VP Operations, MegaStore', text: 'The notification system is incredible. Staff can acknowledge and respond to issues within minutes. Our customers feel heard.', initials: 'LT', metric: '<5 min avg response' },
            ].map((t, idx) => (
              <div key={t.name} className="group relative rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-7 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.03] to-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                  {/* Metric badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-medium text-primary mb-5">
                    <Zap className="h-3 w-3" />
                    {t.metric}
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust logos bar */}
          <div className="mt-16 text-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6">Trusted by teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-50">
              {['ZenPertroluemLtd','OceanicResort', 'FoodChain', 'HotelPrime', 'TechRetail', 'MegaStore'].map((name) => (
                <span key={name} className="text-lg md:text-xl font-bold text-muted-foreground/60">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 md:py-32 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 md:mb-20">
            <Badge variant="secondary" className="mb-5 px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-primary/5 border-primary/10 text-primary">
              <HelpCircle className="mr-1.5 h-3 w-3" />
              Support
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Everything you need to know about ResolveHub. Can&apos;t find what you&apos;re looking for? Reach out to our support team.
            </p>
          </div>

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 max-w-6xl mx-auto items-start">
            {/* Left: sticky sidebar */}
            <div className="lg:col-span-2 lg:sticky lg:top-28">
              <div className="rounded-3xl border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-8 space-y-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-2">Still have questions?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our support team is here to help. Get in touch and we&apos;ll respond as soon as we can.
                  </p>
                </div>
                <Button className="w-full h-11 gap-2" asChild>
                  <a href="mailto:support@resolvehub.com">
                    <Mail className="h-4 w-4" />
                    Contact Support
                  </a>
                </Button>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className="flex -space-x-2">
                    {['bg-blue-500', 'bg-emerald-500', 'bg-amber-500'].map((bg, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full ${bg} ring-2 ring-background flex items-center justify-center text-white text-[10px] font-bold`}>
                        {['S', 'A', 'R'][i]}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Average response time: <span className="font-semibold text-foreground">under 2 hours</span></p>
                </div>
              </div>
            </div>

            {/* Right: accordion */}
            <div className="lg:col-span-3">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`faq-${idx}`}
                    className="group rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm px-6 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 data-[state=open]:border-primary/30 data-[state=open]:bg-card/80 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5"
                  >
                    <AccordionTrigger className="py-5 text-[15px] font-medium hover:no-underline gap-4 [&>svg]:hidden">
                      <span className="flex items-center gap-4 text-left">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0 transition-colors group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        {faq.q}
                      </span>
                      <span className="flex items-center justify-center w-7 h-7 rounded-full border border-border/60 shrink-0 transition-all duration-300 group-data-[state=open]:bg-primary group-data-[state=open]:border-primary group-data-[state=open]:rotate-0">
                        <Plus className="h-3.5 w-3.5 text-muted-foreground transition-all duration-300 group-data-[state=open]:hidden" />
                        <Minus className="h-3.5 w-3.5 hidden text-primary-foreground transition-all duration-300 group-data-[state=open]:block" />
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5 pl-12">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto text-center rounded-3xl overflow-hidden px-8 py-16 md:py-20">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-primary" />
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-6 ring-1 ring-white/20">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white tracking-tight">Ready to Transform Your Feedback?</h2>
              <p className="text-white/75 mb-10 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
                Join hundreds of businesses already using ResolveHub to manage complaints and improve customer satisfaction.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base shadow-xl" asChild>
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="h-12 px-8 text-base text-white border border-white/20 hover:bg-white/10 hover:text-white" asChild>
                  <a href="#pricing">
                    View Pricing
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
