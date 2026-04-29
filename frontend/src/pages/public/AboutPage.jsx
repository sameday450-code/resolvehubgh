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
      bio: 'Visionary entrepreneur with 10+ years in SaaS and customer experience solutions. Leading ResolveHub to revolutionize complaint management.',
      image: '👨‍💼',
      socials: { linkedin: '#', twitter: '#' },
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Samson Kendrick Egbetorke',
      role: 'CTO & Co-Founder',
      bio: 'Full-stack architect with expertise in scalable systems. Driving our technical innovation and platform reliability.',
      image: '👨‍💻',
      socials: { linkedin: '#', twitter: '#' },
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Shirley Yvonne Okine',
      role: 'Head of Product',
      bio: 'Product strategist focused on user-centric design. Ensuring ResolveHub delivers exceptional value to every customer.',
      image: '👨‍🎨',
      socials: { linkedin: '#', twitter: '#' },
      color: 'from-green-500 to-teal-500',
    },
    {
      name: 'Abena Boateng',
      role: 'Head of Customer Success',
      bio: 'Customer advocate committed to 100% satisfaction. Building lasting relationships with our clients and partners.',
      image: '👩‍🤝‍👨',
      socials: { linkedin: '#', twitter: '#' },
      color: 'from-orange-500 to-red-500',
    },
  ];

  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation First',
      description: 'We constantly push boundaries and leverage cutting-edge technology to solve real-world problems.',
      color: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'from-yellow-500/50 to-orange-500/50',
    },
    {
      icon: Heart,
      title: 'Customer Obsession',
      description: 'Every decision we make is centered on delivering exceptional value to our customers.',
      color: 'from-red-500/20 to-pink-500/20',
      borderColor: 'from-red-500/50 to-pink-500/50',
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Enterprise-grade security and reliability are non-negotiable in everything we build.',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'from-blue-500/50 to-cyan-500/50',
    },
    {
      icon: Zap,
      title: 'Speed & Efficiency',
      description: 'We enable businesses to resolve issues faster and delight their customers instantly.',
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
              Transforming How{' '}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Businesses Listen
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10 font-light">
              We revolutionized customer feedback management through innovative QR-based complaint systems and real-time insights that empower businesses to build stronger customer relationships.
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
                    What is{' '}
                    <span className="text-primary">ResolveHub?</span>
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-primary to-blue-600 rounded-full" />
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  ResolveHub is an intelligent, real-time complaint and feedback management platform designed for modern businesses. We empower organizations to understand their customers better and build lasting relationships through transparent, efficient complaint resolution.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Using innovative QR code technology, customers can easily share feedback from any location. Our platform provides real-time notifications, advanced analytics, and powerful tools to help teams resolve issues faster than ever before.
                </p>
                <div className="space-y-3 pt-4">
                  {[
                    'Real-time complaint tracking',
                    'QR code generation at scale',
                    'Advanced analytics & reporting',
                    'Multi-branch management'
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
                      <div className="text-7xl mb-4">📊</div>
                      <h3 className="text-2xl font-bold mb-2">500+</h3>
                      <p className="text-muted-foreground">Active Businesses</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">20K+</p>
                        <p className="text-xs text-muted-foreground mt-1">Issues Resolved</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">99.9%</p>
                        <p className="text-xs text-muted-foreground mt-1">Uptime</p>
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
                  To revolutionize customer complaint management by providing businesses with real-time insights, efficient resolution pathways, and the tools to build stronger customer relationships through transparent communication and continuous improvement.
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
                  To become the leading global platform for customer feedback and complaint management, enabling every business—from startups to enterprises—to create exceptional customer experiences and drive sustainable growth through actionable insights.
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
                        Samson is a visionary entrepreneur with over a decade of experience in SaaS, fintech, and customer experience solutions. He founded ResolveHub after identifying a critical gap in how businesses manage customer feedback across multiple locations.
                      </p>
                      <p>
                        With a passion for technology and customer success, Samson has built a team dedicated to delivering world-class solutions that empower businesses to turn complaints into opportunities for growth and customer delight.
                      </p>
                      <p>
                        When not leading ResolveHub, Samson enjoys mentoring young entrepreneurs, speaking at industry conferences, and exploring innovative solutions to complex business problems.
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
              Diverse expertise, unified mission to revolutionize complaint management.
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
                { year: '2022', title: '🚀 Founded', description: 'ResolveHub was founded with a mission to solve the complaint management crisis for multi-branch businesses.' },
                { year: '2023', title: '✨ MVP Launch', description: 'Launched our MVP with QR code generation and basic complaint management features. Early customers loved it.' },
                { year: '2024', title: '📈 Scale & Growth', description: 'Expanded to 500+ customers across multiple regions. Launched advanced analytics, multi-branch support, and enterprise features.' },
                { year: '2025', title: '👑 Market Leadership', description: 'Became the leading complaint management platform in our region. Continued expansion with new features and integrations.' },
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
              Ready to Transform Your{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Customer Experience?
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Join 500+ businesses that are already using ResolveHub to listen better, resolve faster, and delight customers.
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
