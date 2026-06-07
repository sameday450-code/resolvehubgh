import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  TrendingUp,
  Rocket,
  Settings,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/accordion';
import SEO, { useStructuredData, generateFAQSchema } from '../../components/seo';
import {
  fadeUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem,
  defaultViewport,
  looseViewport,
} from '../../lib/animations';

const features = [
  { icon: QrCode, title: 'QR Code Generation', description: 'Create unique QR codes for each location. Customers scan and submit complaints instantly, with no signup required.' },
  { icon: MessageSquareWarning, title: 'Real-Time Alerts', description: 'Receive instant notifications when complaints arrive. Your team can act immediately, not after shift change.' },
  { icon: BarChart3, title: 'Clear Analytics', description: 'See complaint trends by location, category, and time. Identify patterns and fix problems before they escalate.' },
  { icon: Bell, title: 'Smart Assignment', description: 'Route complaints to the right team member instantly. Track who handles what and ensure accountability.' },
  { icon: Building2, title: 'Multi-Branch Visibility', description: 'Monitor all your branches from one place. Compare performance, spot inconsistencies, and standardize service quality.' },
  { icon: Shield, title: 'Secure & Compliant', description: 'Your data is encrypted and backed up. Role-based access ensures sensitive information stays within your team.' },
];

const plans = [
  {
    name: 'Starter Plan',
    planType: 'starter plan',
    price: '600',
    period: '/month',
    priceCurrency: 'GHS',
    description: 'Perfect for small businesses or teams starting their complaint management journey. Get essential tools to capture and track customer feedback at your first location.',
    features: [
      '1 branch included',
      '20 QR codes included',
      'Up to 5 team members',
      'Complaint dashboard',
      'Real-time notifications',
      'Email alerts',
      'Basic reports (PDF export)',
      'QR-based submissions',
    ],
    cta: 'Start 14-Day Free Trial',
    popular: false,
    trialNote: 'No payment required',
  },
  {
    name: 'Pro Plan',
    planType: 'pro plan',
    price: '1770',
    period: '/month',
    priceCurrency: 'GHS',
    description: 'Ideal for growing businesses managing multiple branches. Get advanced analytics, team collaboration tools, and API access to scale your complaint management.',
    features: [
      '4 branches included',
      '100 QR codes included',
      'Up to 15 team members',
      'Advanced analytics & reporting',
      'Real-time notifications',
      'Priority email & chat support',
      'Data export (CSV, Excel, PDF)',
      'Custom branding on QR codes',
      'REST API access',
      'Advanced filtering & search',
    ],
    cta: 'Start 14-Day Free Trial',
    popular: true,
    trialNote: 'No payment required',
  },
  {
    name: 'Enterprise Plan',
    planType: 'enterprise plan',
    price: '3544.50',
    period: '/month',
    priceCurrency: 'GHS',
    description: 'For large enterprises requiring unlimited scale, premium support, and custom integrations. Full white-label solution with dedicated account management.',
    features: [
      'Unlimited branches',
      'Unlimited QR codes',
      'Unlimited team members',
      'Advanced analytics & custom reports',
      'Real-time notifications & webhooks',
      '24/7 dedicated support',
      'Custom data export formats',
      'Full white-label capability',
      'REST & GraphQL API access',
      'Custom integrations',
      'SSO & advanced security',
      'Dedicated account manager',
      'Priority feature requests',
      'SLA guarantee',
    ],
    cta: 'Start 14-Day Free Trial',
    popular: false,
  },
  {
    name: 'Custom Plan',
    planType: 'custom plan',
    price: 'Contact Sales',
    period: '',
    description: 'For enterprises with unique workflows or special requirements. Custom builds, specialized integrations, and tailored solutions.',
    features: [
      'Custom feature set',
      'Custom deployment options',
      'Dedicated engineering team',
      'Custom setup & migration',
      'Advanced API customization',
      'Full customization available',
      'On-premise or hybrid options',
      'Custom compliance & security',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const faqs = [
  { q: 'How does the QR complaint system work?', a: 'Each location gets a unique QR code. Customers scan it from their phone and fill out a short form. Complaints appear in your dashboard instantly. No app download needed.' },
  { q: 'Can complaints be anonymous?', a: 'Yes. Customers can choose to share their name and phone, or stay anonymous. You still get their feedback either way, which is what matters.' },
  { q: 'How quickly can we start?', a: 'Register today, we approve within 24 hours, then you print your QR codes and start receiving complaints immediately. Setup takes no technical knowledge.' },
  { q: 'Is our data safe?', a: 'Yes. Your data is encrypted, regularly backed up, and accessed only by authorized team members. We follow standard security practices for SaaS platforms.' },
  { q: 'Does this work for multiple locations?', a: 'Yes. That\'s what we built it for. You can manage 2 branches or 100 from one dashboard. Compare performance across locations in real time.' },
  { q: 'What\'s the difference between Starter, Pro, and Enterprise plans?', a: 'Starter (600 GHS/month) is perfect for 1 branch with 20 QR codes. Pro (1770 GHS/month) supports 4 branches with 100 QR codes and advanced analytics. Enterprise (3544.50 GHS/month) offers unlimited branches, unlimited QR codes, 24/7 support, and custom integrations.' },
  { q: 'Can I upgrade my plan later?', a: 'Yes! You can upgrade anytime. We\'ll prorate your charges, and you\'ll get access to additional features immediately. You can also add individual branches or QR codes as needed.' },
  { q: 'What if I need more branches or QR codes than my plan includes?', a: 'No problem. You can purchase additional branches for 50 GHS each or additional QR codes for 50 GHS each at any time via our manual payment system.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  
  // Set up FAQ structured data
  useStructuredData(generateFAQSchema(faqs));

  return (
    <div>
      <SEO
        title="Get ResolveHub | Smart Complaint & Feedback Management SaaS"
        description="ResolveHub is a QR-based complaint and feedback management SaaS. Choose Starter (600 GHS/month, 1 branch), Pro (1770 GHS/month, 3 branches), or Enterprise (3544.50 GHS/month, unlimited). Start your free trial today."
        keywords="get resolve, getresolvehub, ResolveHub, complaint management system, feedback management SaaS, QR complaint system Ghana, customer feedback system"
        canonical="https://getresolvehub.com"
        ogImage="https://getresolvehub.com/og-image.png"
      />
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.35) 100%), url(\'/herobg.png\')',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-semibold backdrop-blur-md bg-white/15 dark:bg-white/10 border border-white/30 text-white hover:bg-white/25 transition-colors">
                <Zap className="mr-1.5 h-3 w-3" />
                Trusted by growing businesses across Ghana
              </Badge>
            </motion.div>
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-white drop-shadow-lg"
            >
              Capture Every Customer Complaint{' '}
              <span className="text-yellow-300 drop-shadow-lg">Before It Escalates</span>
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={{
                ...fadeUp,
                visible: { ...fadeUp.visible, transition: { ...fadeUp.visible.transition, delay: 0.1 } },
              }}
              className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl leading-relaxed drop-shadow-md font-light"
            >
              Get ResolveHub: A QR-based complaint management system that helps you capture, track, and resolve customer complaints faster. Perfect for multi-branch businesses looking to streamline feedback collection and improve service quality across all locations.
            </motion.p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                ...fadeUp,
                visible: { ...fadeUp.visible, transition: { ...fadeUp.visible.transition, delay: 0.2 } },
              }}
              className="flex flex-col sm:flex-row items-start gap-6 mb-14"
            >
              <Button 
                asChild
                className="!h-14 !px-8 !text-base !font-bold !rounded-lg !bg-gradient-to-r !from-white !to-white/90 !text-primary !shadow-2xl !hover:shadow-white/50 !transition-all !duration-300"
                style={{
                  boxShadow: '0 20px 25px -5px rgba(255, 255, 255, 0.3)',
                }}
              >
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform duration-200"
                  style={{ transform: 'scale(1)' }}
                >
                  <span>Start Free 14-Day Trial</span>
                  <ArrowRight className="h-5 w-5 transition-all duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button 
                asChild
                className="!h-14 !px-8 !text-base !font-bold !rounded-lg !border-2 !border-white !bg-white/10 !text-white !backdrop-blur-md hover:!bg-white/20 !transition-all !duration-300"
                style={{
                  boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
                }}
              >
                <a 
                  href="#features" 
                  className="inline-flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-transform duration-200"
                  style={{ transform: 'scale(1)' }}
                >
                  <span className="text-lg">▶</span>
                  <span>Watch Demo</span>
                </a>
              </Button>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer(0.08, 0.3)}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { icon: TrendingUp, title: 'Real-Time Insights', label: 'Respond to customer issues instantly' },
                { icon: Rocket, title: 'Instant Setup', label: 'Start capturing feedback in minutes' },
                { icon: Building2, title: 'Multi-Branch', label: 'Manage all locations from one place' },
                { icon: Shield, title: '24/7 Availability', label: 'Reliable service when you need it' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={staggerItem}
                  className="backdrop-blur-md bg-white/12 rounded-xl px-4 py-3.5 border border-white/20 shadow-xl hover:bg-white/18 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="h-5 w-5 text-yellow-300" />
                    <p className="font-semibold text-white text-sm">{stat.title}</p>
                  </div>
                  <p className="text-xs text-white/75">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
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
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={staggerContainer(0.08)}
            className="text-center mb-16 md:mb-20"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="secondary" className="mb-5 px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-primary/5 border-primary/10 text-primary">
                <Zap className="mr-1.5 h-3 w-3" />
                Features That Matter
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              ResolveHub: Smart Complaint Management Across Your Branches{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Never Miss Feedback Again</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Stop losing customer complaints at your branches. ResolveHub gives you full visibility into customer issues, helping your team respond faster and improve service quality. Our QR complaint system makes it easy for customers to submit feedback.
            </motion.p>
          </motion.div>

          {/* Bento grid layout */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={looseViewport}
            variants={staggerContainer(0.09)}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-6xl mx-auto auto-rows-[minmax(220px,auto)]"
          >
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
                <motion.div
                  key={feature.title}
                  variants={staggerItem}
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
                </motion.div>
              );
            })}
          </motion.div>

          {/* Bottom stat bar */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeUp}
            className="mt-16 md:mt-20 max-w-4xl mx-auto"
          >
            <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 md:p-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={defaultViewport}
                variants={staggerContainer(0.08)}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
              >
                {[
                  { icon: TrendingUp, title: 'Real-Time Insights', label: 'Respond to customer issues instantly' },
                  { icon: Rocket, title: 'Instant Setup', label: 'Start capturing feedback in minutes' },
                  { icon: Building2, title: 'Multi-Branch Management', label: 'Manage all locations from one place' },
                  { icon: Shield, title: '24/7 Availability', label: 'Reliable service when you need it' },
                ].map((stat) => (
                  <motion.div key={stat.label} variants={staggerItem} className="text-center">
                    <div className="flex justify-center mb-3">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="font-semibold text-foreground text-sm mb-1">{stat.title}</div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-muted/30" />
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={staggerContainer(0.08)}
            className="text-center mb-16 md:mb-20"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="secondary" className="mb-5 px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-primary/5 border-primary/10 text-primary">
                <Zap className="mr-1.5 h-3 w-3" />
                Simple Process
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              How ResolveHub Complaint Management{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Works</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Get ResolveHub up and running in three simple steps—no technical setup needed. Our QR-based complaint system is designed for businesses of all sizes.
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={staggerContainer(0.15)}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative"
          >
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
            {[
              { icon: Settings, title: 'Configure Your Organization', description: 'Set up your company, branches, and team access in minutes. Define roles and permissions to maintain control and security.' },
              { icon: QrCode, title: 'Deploy QR Codes - Our Smart Complaint System', description: 'Generate unique QR codes for each location instantly. Download, print, and place them at your branches—no technical setup. Our QR complaint system works across all devices.' },
              { icon: BarChart3, title: 'Centralize & Resolve Complaints Faster', description: 'Capture feedback in real-time using our QR-based system. Track complaints across all locations, and resolve issues from one unified dashboard. Perfect for multi-branch complaint management.' },
            ].map((item) => (
              <motion.div key={item.icon} variants={staggerItem} className="relative text-center group">
                <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white mb-6 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={staggerContainer(0.08)}
            className="text-center mb-16 md:mb-20"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="secondary" className="mb-5 px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-primary/5 border-primary/10 text-primary">
                <Zap className="mr-1.5 h-3 w-3" />
                Pricing
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              Get ResolveHub Pricing Built for Your Scale{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Not Your Size</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Start with a free trial of our complaint management SaaS. No credit card required. Upgrade or downgrade anytime as your business grows.
            </motion.p>
            {/* Global pricing message */}
            <motion.div variants={fadeUp} className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">All plans include a 14-day free trial. No upfront payment required.</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={staggerContainer(0.12)}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 max-w-7xl mx-auto items-stretch"
          >
            {plans.map((plan, planIdx) => (
              <motion.div
                key={plan.name}
                variants={staggerItem}
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
                    <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      {plan.planType === 'custom' ? (
                        <span className="text-5xl md:text-6xl font-bold tracking-tight">Contact Sales</span>
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
                    {plan.trialNote && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">{plan.trialNote} • Manual activation after</p>
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
                      if (plan.planType === 'starter plan') {
                        navigate('/register?plan=starter_plan');
                      } else if (plan.planType === 'pro plan') {
                        navigate('/register?plan=pro_plan');
                      } else if (plan.planType === 'enterprise plan') {
                        navigate('/register?plan=enterprise_plan');
                      } else if (plan.planType === 'custom plan') {
                        navigate('/contact?type=sales');
                      } else {
                        navigate('/register?plan=starter_plan');
                      }
                    }}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Manual payment flow section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeUp}
            className="mt-20 max-w-3xl mx-auto"
          >
            <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-sm p-8 md:p-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 ring-1 ring-primary/20 shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-3">After Your Trial Ends</h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      After 14 days, you'll need to activate your subscription to keep using ResolveHub. No automatic charges.
                    </p>
                    <p>
                      Pay via <strong className="text-foreground">Mobile Money or Bank Transfer</strong>, then email / WhatsApp our team to activate your account. We'll confirm within 2 hours.
                    </p>
                    <p>
                      During your trial, we'll send clear instructions on how to activate. Any questions? Contact resolvehub3@gmail.com.
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Pricing Info */}
              {/* <div className="border-t border-border/40 pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20 shrink-0">
                    <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-3">Scalable Add-Ons Available on All Plans</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">Need more capacity? Easily scale your Starter, Pro, or Enterprise plan with affordable add-ons:</p>
                      <div className="flex items-center gap-2 mt-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                        <span className="font-semibold text-blue-700 dark:text-blue-300">Additional Branches:</span>
                        <span className="text-blue-700 dark:text-blue-300">50 GHS per branch</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                        <span className="font-semibold text-blue-700 dark:text-blue-300">Additional QR Codes:</span>
                        <span className="text-blue-700 dark:text-blue-300">50 GHS per QR code</span>
                      </div>
                      <p className="text-muted-foreground text-xs mt-2">Add as many branches and QR codes as you need via our manual payment system. Perfect for growing businesses.</p>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </motion.div>
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
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={staggerContainer(0.08)}
            className="text-center mb-16 md:mb-20"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="secondary" className="mb-5 px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-primary/5 border-primary/10 text-primary">
                <Star className="mr-1.5 h-3 w-3" />
                Testimonials
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              What Our Customers{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Are Saying About ResolveHub</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              See how companies in Ghana are transforming their complaint management with our QR-based feedback system. Read real testimonials from multi-branch businesses using ResolveHub.
            </motion.p>
          </motion.div>

          {/* Featured testimonial */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={scaleIn}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.02] p-10 md:p-14 shadow-xl shadow-primary/5">
              <div className="absolute top-8 right-10 text-8xl font-serif text-primary/10 leading-none select-none">&ldquo;</div>
              <div className="relative">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 font-medium">
                  &ldquo;ResolveHub gave us visibility we never had before. Complaints that used to be verbal and lost are now tracked in real time across all our branches. We reduced resolution delays and improved internal accountability within weeks. The QR complaint system is so easy to use.&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-bold ring-4 ring-primary/10">
                    DM
                  </div>
                  <div>
                    <p className="font-semibold text-base">Daniel Mensah</p>
                    <p className="text-sm text-muted-foreground">Operations Manager, MultiBranch Retail</p>
                    <p className="text-xs text-primary font-medium mt-0.5">12 branches · Starter Plan · Get ResolveHub User</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial cards grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={looseViewport}
            variants={staggerContainer(0.08)}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto"
          >
            {[
              { name: 'Aisha Bello', role: 'Branch Supervisor, FuelChain Group', text: 'The QR-based complaint system is simple and effective. Customers submit feedback instantly, and our team can act on it without delays.', initials: 'AB', metric: '35% more feedback captured' },
              { name: 'Michael Osei', role: 'Customer Experience Lead, ServicePoint', text: 'The dashboard helps us identify recurring issues quickly. Instead of reacting late, we now fix problems before they escalate.', initials: 'MO', metric: '3x faster issue resolution' },
              { name: 'Josephine Adjei', role: 'Operations Coordinator, RetailHub', text: 'Managing multiple branches used to be difficult. With ResolveHub, every location is monitored from one place, and reporting is consistent.', initials: 'JA', metric: '8 branches managed centrally' },
              { name: 'Fatima Abdul', role: 'CX Manager, HealthPlus Clinic', text: 'We now receive honest feedback directly from customers. This has helped us improve service quality and staff responsiveness.', initials: 'FA', metric: '+30% service improvement insights' },
              { name: 'Kwame Asante', role: 'Founder, QuickServe Foods', text: 'We started with the trial and quickly saw the value. Within days, we had structured complaint data instead of scattered feedback.', initials: 'KA', metric: 'Activated within first week' },
              { name: 'Linda Boateng', role: 'Operations Lead, UrbanMart', text: 'Real-time notifications ensure no complaint is ignored. Our team responds faster, and customers feel heard.', initials: 'LB', metric: '<10 min average response' },
            ].map((t, idx) => (
              <motion.div key={t.name} variants={staggerItem} className="group relative rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-7 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20">
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
              </motion.div>
            ))}
          </motion.div>

          {/* Trust logos bar */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeIn}
            className="mt-16 text-center"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6">Trusted by growing businesses and multi-branch teams</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-50">
              {['MultiBranch Retail', 'FuelChain Group', 'ServicePoint', 'RetailHub', 'HealthPlus Clinic', 'UrbanMart'].map((name) => (
                <span key={name} className="text-lg md:text-xl font-bold text-muted-foreground/60">{name}</span>
              ))}
            </div>
          </motion.div>
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
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={staggerContainer(0.08)}
            className="text-center mb-16 md:mb-20"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="secondary" className="mb-5 px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-primary/5 border-primary/10 text-primary">
                <HelpCircle className="mr-1.5 h-3 w-3" />
                Support
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              Frequently Asked Questions About{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">ResolveHub</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Find answers to common questions about how our complaint management SaaS works, setup, pricing, and account activation for Get ResolveHub.
            </motion.p>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 max-w-6xl mx-auto items-start">
            {/* Left: sticky sidebar */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              variants={slideInLeft}
              className="lg:col-span-2 lg:sticky lg:top-28"
            >
              <div className="rounded-3xl border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-8 space-y-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-2">Need help getting started?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our team is here to help with setup, onboarding, and account activation. We respond within 2 hours during business hours.
                  </p>
                </div>
                <Button className="w-full h-11 gap-2" asChild>
                  <a href="mailto:support@resolvehub.com">
                    <Mail className="h-4 w-4" />
                    Contact ResolveHub Support
                  </a>
                </Button>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">Support available via <span className="font-semibold text-foreground">WhatsApp, phone, and email</span></p>
                </div>
              </div>
            </motion.div>

            {/* Right: accordion */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              variants={slideInRight}
              className="lg:col-span-3"
            >
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={scaleIn}
            className="relative max-w-4xl mx-auto text-center rounded-3xl overflow-hidden px-8 py-16 md:py-20"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-primary" />
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              variants={staggerContainer(0.1)}
              className="relative z-10"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-6 ring-1 ring-white/20">
                <Bell className="h-8 w-8 text-white" />
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-5 text-white tracking-tight">Get Real-Time Visibility Into Every Customer Issue With ResolveHub</motion.h2>
              <motion.p variants={fadeUp} className="text-white/75 mb-10 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
                Join companies tracking feedback in real-time with our QR complaint management system. Resolve issues faster, and improve customer satisfaction across all locations. Start your 14-day free trial of Get ResolveHub—no card required.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base shadow-xl" asChild>
                  <Link to="/register">
                    Start 14-Day Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="h-12 px-8 text-base text-white border border-white/20 hover:bg-white/10 hover:text-white" asChild>
                  <a href="#pricing">
                    View Pricing
                  </a>
                </Button>
              </motion.div>
              <motion.p variants={fadeIn} className="text-white/60 text-xs mt-6 font-medium">14-day free trial • No credit card • Instant setup • Proven by growing businesses</motion.p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
