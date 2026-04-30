import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageSquare,
  ArrowRight,
  Hexagon,
  Sparkles,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { contactSalesAPI } from '../../lib/api';

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const isSalesInquiry = searchParams.get('type') === 'sales';
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [generalFormState, setGeneralFormState] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const [salesFormState, setSalesFormState] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    country: '',
    industry: '',
    estimatedBranches: '',
    estimatedUsers: '',
    requirements: '',
  });

  const handleGeneralChange = (e) => {
    setGeneralFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSalesChange = (e) => {
    setSalesFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleSalesSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await contactSalesAPI.submitInquiry({
        ...salesFormState,
        estimatedBranches: salesFormState.estimatedBranches ? Number(salesFormState.estimatedBranches) : null,
        estimatedUsers: salesFormState.estimatedUsers ? Number(salesFormState.estimatedUsers) : null,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 text-center">
          {isSalesInquiry ? (
            <>
              <Badge variant="secondary" className="mb-5 px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-primary/5 border-primary/10 text-primary">
                <Zap className="mr-1.5 h-3 w-3" />
                Custom Enterprise Plan
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5">
                Let&apos;s Talk About Your{' '}
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Needs</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Tell us about your business and your requirements. Our sales team will design a custom plan that fits your organization.
              </p>
            </>
          ) : (
            <>
              <Badge variant="secondary" className="mb-5 px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-primary/5 border-primary/10 text-primary">
                <MessageSquare className="mr-1.5 h-3 w-3" />
                Get in Touch
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5">
                Let&apos;s Start a{' '}
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Conversation</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Have a question about ResolveHub? Want to explore how we can help your business? We&apos;d love to hear from you.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-24 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 max-w-6xl mx-auto">
            {/* Left: Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Info cards */}
              <div className="space-y-4">
                {[
                  {
                    icon: Mail,
                    title: 'Email Us',
                    detail: 'support@resolvehub.com',
                    sub: 'We reply within 2 hours',
                  },
                  {
                    icon: Phone,
                    title: 'Call Us',
                    detail: '+233 (059) 434 5424',
                    sub: 'Mon - Fri, 9AM - 6PM EST',
                  },
                  {
                    icon: MapPin,
                    title: 'Visit Us',
                    detail: 'Korle Bu, Accra, Ghana',
                    sub: 'Accra, Ghana',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="group flex items-start gap-4 p-5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 ring-1 ring-primary/20 shrink-0 group-hover:bg-primary/15 transition-colors duration-300">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">{item.title}</h3>
                      <p className="text-sm text-foreground">{item.detail}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Office hours card */}
              <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Office Hours</h3>
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM EST' },
                    { day: 'Saturday', hours: '10:00 AM - 2:00 PM EST' },
                    { day: 'Sunday', hours: 'Closed' },
                  ].map((item) => (
                    <div key={item.day} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{item.day}</span>
                      <span className="font-medium text-xs bg-muted/50 px-2.5 py-1 rounded-full">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.03] to-blue-500/[0.02] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-sm">Quick Links</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Help Center & Documentation', href: '#' },
                    { label: 'System Status Page', href: '#' },
                    { label: 'Schedule a Demo', href: '#' },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-background/60 transition-colors text-sm group/link"
                    >
                      <span className="text-muted-foreground group-hover/link:text-foreground transition-colors">{link.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Contact Form or Sales Inquiry Form */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-sm p-8 md:p-10 shadow-xl shadow-primary/5">
                {submitted ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 ring-4 ring-primary/5">
                      <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">
                      {isSalesInquiry ? 'Inquiry Received!' : 'Message Sent!'}
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                      {isSalesInquiry 
                      ? 'Thank you for your interest. Our sales team will review your requirements and contact you within 24 hours to discuss a custom plan for your business.'
                      : 'Thanks for reaching out. We received your message and will get back to you within 2 hours during business hours.'}
                    </p>
                    <Button variant="outline" onClick={() => setSubmitted(false)} className="rounded-xl">
                      {isSalesInquiry ? 'Submit Another Inquiry' : 'Send Another Message'}
                    </Button>
                  </div>
                ) : isSalesInquiry ? (
                  <>
                    <div className="mb-8">
                      <h2 className="text-xl font-bold tracking-tight mb-2">Tell Us About Your Business</h2>
                      <p className="text-sm text-muted-foreground">The more details you share, the better we can tailor ResolveHub to your needs. We'll review your information and contact you within 24 hours.</p>
                    </div>

                    {error && (
                      <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSalesSubmit} className="space-y-5">
                      {/* Row 1: Company & Contact Name */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="companyName" className="block text-sm font-medium mb-2">Company Name</label>
                          <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            required
                            value={salesFormState.companyName}
                            onChange={handleSalesChange}
                            placeholder="Your Company"
                            className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="contactName" className="block text-sm font-medium mb-2">Your Full Name</label>
                          <input
                            type="text"
                            id="contactName"
                            name="contactName"
                            required
                            value={salesFormState.contactName}
                            onChange={handleSalesChange}
                            placeholder="Your Name Here"
                            className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 2: Email & Phone */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">Email Address</label>
                          <input
                            type="email"
                            id="contactEmail"
                            name="contactEmail"
                            required
                            value={salesFormState.contactEmail}
                            onChange={handleSalesChange}
                            placeholder="your@company.com"
                            className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="contactPhone" className="block text-sm font-medium mb-2">Phone Number <span className="text-muted-foreground font-normal">(optional)</span></label>
                          <input
                            type="tel"
                            id="contactPhone"
                            name="contactPhone"
                            value={salesFormState.contactPhone}
                            onChange={handleSalesChange}
                            placeholder="+233 (000) 000 000"
                            className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 3: Country & Industry */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium mb-2">Country <span className="text-muted-foreground font-normal">(optional)</span></label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value={salesFormState.country}
                            onChange={handleSalesChange}
                            placeholder="Ghana"
                            className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="industry" className="block text-sm font-medium mb-2">Industry <span className="text-muted-foreground font-normal">(optional)</span></label>
                          <input
                            type="text"
                            id="industry"
                            name="industry"
                            value={salesFormState.industry}
                            onChange={handleSalesChange}
                            placeholder="Retail, Hospitality, etc."
                            className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 4: Estimated Branches & Users */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="estimatedBranches" className="block text-sm font-medium mb-2">Expected Number of Branches <span className="text-muted-foreground font-normal">(optional)</span></label>
                          <input
                            type="number"
                            id="estimatedBranches"
                            name="estimatedBranches"
                            min="1"
                            value={salesFormState.estimatedBranches}
                            onChange={handleSalesChange}
                            placeholder="50"
                            className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="estimatedUsers" className="block text-sm font-medium mb-2">Expected Number of Users <span className="text-muted-foreground font-normal">(optional)</span></label>
                          <input
                            type="number"
                            id="estimatedUsers"
                            name="estimatedUsers"
                            min="1"
                            value={salesFormState.estimatedUsers}
                            onChange={handleSalesChange}
                            placeholder="200"
                            className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                          />
                        </div>
                      </div>

                      {/* Requirements */}
                      <div>
                        <label htmlFor="requirements" className="block text-sm font-medium mb-2">Your Business Requirements & Custom Needs</label>
                        <textarea
                          id="requirements"
                          name="requirements"
                          required
                          rows={6}
                          value={salesFormState.requirements}
                          onChange={handleSalesChange}
                          placeholder="Tell us about your specific needs, integrations, custom features, SLA requirements, or any other requirements for your Custom Enterprise plan..."
                          className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
                        />
                      </div>

                      <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-sm font-medium bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send className="mr-2 h-4 w-4" />
                        {isLoading ? 'Submitting...' : 'Submit Inquiry'}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        By submitting this form, you agree to our{' '}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                      </p>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="mb-8">
                      <h2 className="text-xl font-bold tracking-tight mb-2">Send us a Message</h2>
                      <p className="text-sm text-muted-foreground">Fill out the form below and we&apos;ll get back to you shortly.</p>
                    </div>

                    <form onSubmit={handleGeneralSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={generalFormState.name}
                            onChange={handleGeneralChange}
                            placeholder="John Doe"
                            className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={generalFormState.email}
                            onChange={handleGeneralChange}
                            placeholder="john@company.com"
                            className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="company" className="block text-sm font-medium mb-2">Company <span className="text-muted-foreground font-normal">(optional)</span></label>
                          <input
                            type="text"
                            id="company"
                            name="company"
                            value={generalFormState.company}
                            onChange={handleGeneralChange}
                            placeholder="Your company"
                            className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                          <select
                            id="subject"
                            name="subject"
                            required
                            value={generalFormState.subject}
                            onChange={handleGeneralChange}
                            className="w-full h-11 px-4 rounded-xl border border-border/60 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all appearance-none"
                          >
                            <option value="">Select a topic</option>
                            <option value="general">General Inquiry</option>
                            <option value="sales">Sales & Pricing</option>
                            <option value="support">Technical Support</option>
                            <option value="demo">Request a Demo</option>
                            <option value="partnership">Partnership</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={5}
                          value={generalFormState.message}
                          onChange={handleGeneralChange}
                          placeholder="Tell us how we can help..."
                          className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
                        />
                      </div>

                      <Button type="submit" className="w-full h-12 rounded-xl text-sm font-medium bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25">
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        By submitting this form, you agree to our{' '}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map / CTA Section */}
      <section className="pb-24 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="relative max-w-6xl mx-auto rounded-3xl overflow-hidden border border-border/40 bg-gradient-to-br from-muted/50 to-muted/20">
            <div className="grid md:grid-cols-2">
              {/* Location Information */}
              <div className="relative h-64 md:h-[500px] w-full bg-gradient-to-br from-primary/5 via-blue-500/5 to-muted/30 flex flex-col items-center justify-center p-8">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                    Visit Our Office
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-lg font-semibold text-foreground">Korle Bu, Accra, Ghana</p>
                      <p className="text-sm text-muted-foreground mt-1">Our main office location</p>
                    </div>
                    <div className="pt-4 border-t border-border/30">
                      <p className="text-sm">
                        <span className="font-medium">📞 Phone:</span> <br />
                        <a href="tel:+233059434524" className="text-primary hover:underline">+233 (059) 434 5424</a>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">📧 Email:</span> <br />
                        <a href="mailto:support@resolvehub.com" className="text-primary hover:underline">support@resolvehub.com</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA side */}
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                  Ready to get started?
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Join 500+ companies already using ResolveHub to transform their customer feedback management.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="h-11 rounded-xl shadow-lg shadow-primary/20" asChild>
                    <Link to="/register">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-11 rounded-xl" asChild>
                    <a href="#" >
                      Schedule a Demo
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
