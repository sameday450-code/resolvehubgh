import { Users, Target, Lightbulb, Heart, ArrowRight, Code, Zap, Shield, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const teamMembers = [
    {
      name: 'Samson Kendrick Egbetorke',
      role: 'Founder & CEO',
      bio: 'Started in fintech and spent years in operational businesses. Saw the same problem everywhere: customer complaints getting lost across locations, teams flying blind. Built ResolveHub to give businesses real-time visibility into what customers actually think. Now focuses on making the product solve real problems for multi-location businesses.',
      image: '👨‍💼',
      socials: { linkedin: '#', twitter: '#' },
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Shirley Yvonne Okine',
      role: 'Head of Product',
      bio: "Designs ResolveHub to be simple and actually useful. Believes complex features don't help—clarity does. Every decision is about removing friction so teams spend time fixing issues, not managing software. Passionate about building tools that businesses depend on.",
      image: '👨‍🎨',
      socials: { linkedin: '#', twitter: '#' },
      color: 'from-green-500 to-teal-500',
    },
    {
      name: 'Abena Boateng',
      role: 'Head of Customer Success',
      bio: "Helps businesses set up ResolveHub and get measurable results in weeks. Works directly with customers to understand what's working and what needs to change. Believes success is when customers stop thinking about the software and start focusing on fixing complaints faster.",
      image: '👩‍🤝‍👨',
      socials: { linkedin: '#', twitter: '#' },
      color: 'from-orange-500 to-red-500',
    },
  ];

  const values = [
    {
      icon: Lightbulb,
      title: 'Built for Real-World Operations',
      description: 'We design tools that work in busy environments — fuel stations, retail shops, and service centers. No theory. Only what works.',
      color: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'from-yellow-500/50 to-orange-500/50',
    },
    {
      icon: Heart,
      title: 'Clarity Over Complexity',
      description: 'Every complaint should be visible, traceable, and actionable. Nothing gets lost in the noise.',
      color: 'from-red-500/20 to-pink-500/20',
      borderColor: 'from-red-500/50 to-pink-500/50',
    },
    {
      icon: Shield,
      title: 'Accountability by Design',
      description: 'Issues are assigned, tracked, and followed until resolved. Excuses disappear when everything is visible.',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'from-blue-500/50 to-cyan-500/50',
    },
    {
      icon: Zap,
      title: 'Speed That Matters',
      description: "Fast response isn't optional — it's the difference between losing and keeping customers.",
      color: 'from-purple-500/20 to-indigo-500/20',
      borderColor: 'from-purple-500/50 to-indigo-500/50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/30 to-blue-600/30 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-40 pt-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">About Our Story</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Capture Every Complaint.{' '}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Across Every Location.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10 font-light">
              Customer complaints slip through the cracks. Responses take too long. Accountability gets lost across teams. ResolveHub stops that. We give multi-location businesses real-time visibility into every complaint, and the tools to respond immediately.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="shadow-lg shadow-primary/25 px-8 h-12 group" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 h-12" asChild>
                <Link to="/contact">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is ResolveHub Section */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                    How{' '}
                    <span className="text-primary">ResolveHub Works</span>
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-primary to-blue-600 rounded-full" />
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  At each branch or location, you generate a unique QR code. Customers scan it to submit complaints directly. Your team sees each one instantly—no lost emails, no forgotten phone calls. You track trends by location, respond in real time, and measure accountability.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Built for fuel stations, retail chains, restaurants, service centers, and any business with multiple locations. The problem is real. So is the solution.
                </p>
                <div className="space-y-3 pt-4">
                  {[
                    'QR-based capture per location',
                    'Real-time complaint dashboard',
                    'Branch-level analytics and trends',
                    'Team accountability & response tracking'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-blue-600/50 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="relative bg-white dark:bg-background rounded-3xl p-10 border border-border/50 shadow-2xl">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl mb-4">⚡</div>
                      <h3 className="text-2xl font-bold mb-2">Built for Speed</h3>
                      <p className="text-muted-foreground">Complaints captured and visible in seconds</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">∞</p>
                        <p className="text-xs text-muted-foreground mt-1">Locations</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">1</p>
                        <p className="text-xs text-muted-foreground mt-1">Dashboard</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-muted/30 to-muted/60 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Mission & Vision</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Guided by purpose, driven by impact
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mission */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white dark:bg-background rounded-2xl p-8 border border-border/50 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Our Mission</h3>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  To help businesses capture real customer complaints at the point of service and ensure every issue is tracked, assigned, and resolved — not ignored or lost.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white dark:bg-background rounded-2xl p-8 border border-border/50 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold">Our Vision</h3>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  To become the standard system for managing customer complaints across multi-location businesses, bringing visibility, accountability, and faster resolution to every branch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              These principles guide everything we do and shape how we work with our customers and team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${value.borderColor} rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className={`relative bg-gradient-to-br ${value.color} backdrop-blur-xl border border-border/50 p-8 rounded-2xl h-full`}>
                  <div className="p-3 bg-white dark:bg-background/80 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder & CEO Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-muted/40 to-muted/60 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-2">Founder & CEO</h2>
              <p className="text-muted-foreground text-lg">The vision behind ResolveHub</p>
              <div className="h-1 w-16 bg-gradient-to-r from-primary to-blue-600 rounded-full mx-auto mt-4" />
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-blue-500/30 to-purple-600/30 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative bg-white dark:bg-background/80 backdrop-blur rounded-3xl border border-border/50 p-8 md:p-12 shadow-2xl">
                <div className="grid md:grid-cols-4 gap-8 items-center">
                  <div className="flex justify-center md:col-span-1">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-2xl blur-xl opacity-50" />
                      <div className="relative w-48 h-48 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-7xl shadow-2xl">
                        👨‍💼
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-3 space-y-4">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold mb-2">Samson Kendrick Egbetorke</h3>
                      <p className="text-primary font-semibold text-lg">Founder & Chief Executive Officer</p>
                    </div>
                    <div className="space-y-3 text-muted-foreground text-lg leading-relaxed">
                      <p>
                        Samson started his career building financial products and working directly with service businesses. He spent enough time in operations to notice a pattern: customer complaints were scattered across channels. Some made it to the right person. Most didn't. Branches had no visibility into what customers actually thought. Management had no way to track accountability. The problem repeated everywhere.
                      </p>
                      <p>
                        In 2022, he realized the solution wasn't more complex software. It was simpler: give every location a QR code. Make complaints instant and visible. Give managers real-time data. Remove places for issues to hide.
                      </p>
                      <p>
                        Today, ResolveHub is built on one principle: businesses shouldn't have to choose between scaling locations and losing touch with customers. Every feature exists because a customer needed it. Every decision is about making the product more useful, not more impressive.
                      </p>
                      <p className="italic pt-2 border-t border-border/30 mt-4">
                        "I built ResolveHub because I saw profitable businesses lose customers they never heard complain from. That shouldn't happen. Once you give businesses visibility into what their customers think in real time, everything else becomes possible."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Leadership Team</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experienced professionals focused on helping businesses succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {teamMembers.map((member, i) => (
              <div
                key={i}
                className="group rounded-2xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <div className={`bg-gradient-to-br ${member.color} p-10 flex justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                  <div className="text-7xl relative z-10">{member.image}</div>
                </div>
                <div className="p-6 bg-white dark:bg-background">
                  <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                  <p className="text-primary text-sm font-semibold mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground mb-5 line-clamp-3">{member.bio}</p>
                  <div className="flex gap-3 pt-4 border-t">
                    <a 
                      href={member.socials.linkedin} 
                      className="flex-1 py-2 px-3 bg-muted hover:bg-primary/10 text-center rounded-lg text-muted-foreground hover:text-primary transition-all text-sm font-medium"
                    >
                      LinkedIn
                    </a>
                    <a 
                      href={member.socials.twitter} 
                      className="flex-1 py-2 px-3 bg-muted hover:bg-primary/10 text-center rounded-lg text-muted-foreground hover:text-primary transition-all text-sm font-medium"
                    >
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-muted/40 to-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Journey</h2>
              <p className="text-muted-foreground text-lg">
                From vision to market leader
              </p>
            </div>

            <div className="space-y-12 relative">
              {/* Timeline Line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-blue-500 to-transparent md:-translate-x-1/2" />

              {[
                { year: '2022', title: '� The Problem', description: 'Samson saw the same issue across every business with multiple locations: complaints scattered everywhere, teams flying blind, branches disconnected. No system existed to capture and track customer feedback at scale.' },
                { year: '2023', title: '🚀 MVP Launch', description: 'Built ResolveHub with one focus: make complaint capture stupidly simple. QR codes at each location. Real-time dashboard. First customers started seeing patterns they never knew existed.' },
                { year: '2024', title: '📊 Early Customers', description: 'Refined the product based on real feedback. Added branch-level analytics, team accountability tracking, and better assignment workflows. Customers reported faster response times and better visibility within weeks.' },
                { year: '2025', title: '🎯 Building What Works', description: 'Focused on making ResolveHub indispensable for multi-location businesses. Adding features based on what customers actually need. Moving from early adopters to businesses that depend on us.' },
              ].map((milestone, i) => (
                <div key={i} className="flex gap-6 md:gap-0 relative md:mb-12">
                  <div className="md:w-1/2 md:text-right md:pr-12">
                    <div className={i % 2 === 0 ? 'block' : 'hidden md:block'}>
                      <p className="text-sm font-semibold text-primary mb-2">{milestone.year}</p>
                      <h3 className="text-xl md:text-2xl font-bold mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="flex justify-center md:w-0">
                    <div className="relative z-10">
                      <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg" />
                      <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-ping opacity-30" />
                    </div>
                  </div>

                  <div className="md:w-1/2 md:pl-12">
                    <div className={i % 2 === 1 ? 'block' : 'hidden md:block'}>
                      <p className="text-sm font-semibold text-primary mb-2">{milestone.year}</p>
                      <h3 className="text-xl md:text-2xl font-bold mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute -top-40 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Stop Losing{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Customer Complaints
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Every complaint contains actionable feedback. ResolveHub captures them instantly across all your locations—so you can respond, improve, and keep customers before they leave. Real visibility. Real accountability. Real results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="shadow-lg shadow-primary/25 px-8 h-12 group" asChild>
                <Link to="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 h-12" asChild>
                <Link to="/contact">Schedule Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
