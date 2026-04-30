import { Outlet, Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-b border-border/50'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto flex h-16 md:h-[72px] items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/public/logo.png" alt="ResolveHub" className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              ResolveHub
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center gap-1 rounded-full bg-muted/50 px-1.5 py-1">
              {navLinks.map((link) =>
                link.href.startsWith('/') && !link.href.includes('#') ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="relative px-4 py-1.5 text-sm font-medium text-muted-foreground rounded-full hover:text-foreground hover:bg-background/80 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="relative px-4 py-1.5 text-sm font-medium text-muted-foreground rounded-full hover:text-foreground hover:bg-background/80 transition-all duration-200"
                  >
                    {link.label}
                  </a>
                )
              )}
            </div>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/90 transition-all duration-300"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay - Outside Header to avoid stacking context issues */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-xl"
          onClick={() => setMobileOpen(false)}
        >
          <div 
            className="container mx-auto px-4 pt-6 pb-8 flex flex-col h-full bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) =>
                link.href.startsWith('/') && !link.href.includes('#') ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-3.5 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-3.5 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
            </nav>
            <div className="border-t mt-4 pt-6 flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center h-12 rounded-xl border text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-auto pt-8 text-center">
              <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ResolveHub. All rights reserved.</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-muted/40">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src="/public/logo.png" alt="ResolveHub" className="h-6 w-6" />
                <span className="text-lg font-bold">ResolveHub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time QR complaint and feedback reporting for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">About</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ResolveHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
