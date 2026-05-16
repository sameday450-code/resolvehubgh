import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, Mail, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Reusable layout for all ResolveHub legal documentation pages.
 *
 * @param {string}   title        - Page headline
 * @param {string}   description  - Subtitle shown under the headline
 * @param {string}   lastUpdated  - Human-readable last-updated date
 * @param {string}   effectiveDate - Effective-from date
 * @param {{ id: string, label: string }[]} sections - TOC entries
 * @param {React.ReactNode} children - Page body content
 */
export default function LegalPageLayout({
  title,
  description,
  lastUpdated,
  effectiveDate,
  sections = [],
  children,
}) {
  const [activeSection, setActiveSection] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerRef = useRef(null);

  // Scroll progress + back-to-top visibility
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollProgress(Math.min(progress, 100));
      setShowScrollTop(el.scrollTop > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active section highlight via IntersectionObserver
  useEffect(() => {
    if (!sections.length) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [sections]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-background">
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-border/40">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-muted/40 to-background pt-20 pb-14">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="relative container mx-auto px-4 lg:px-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">{title}</span>
            </nav>

            <div className="flex flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Legal Documentation
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {description && (
                <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground pt-1">
                {lastUpdated && (
                  <span>
                    <span className="font-medium text-foreground">Last Updated:</span> {lastUpdated}
                  </span>
                )}
                {effectiveDate && (
                  <span>
                    <span className="font-medium text-foreground">Effective Date:</span> {effectiveDate}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body: TOC sidebar + content */}
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Sticky Table of Contents */}
          {sections.length > 0 && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  On This Page
                </p>
                <nav className="flex flex-col gap-0.5">
                  {sections.map(({ id, label }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className={`group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all duration-200 ${
                        activeSection === id
                          ? 'bg-primary/10 font-semibold text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200 ${
                          activeSection === id ? 'bg-primary scale-125' : 'bg-border group-hover:bg-muted-foreground'
                        }`}
                      />
                      {label}
                    </a>
                  ))}
                </nav>

                {/* Contact CTA */}
                <div className="mt-8 rounded-xl border border-border/60 bg-muted/40 p-4">
                  <p className="text-xs font-semibold text-foreground mb-1">Questions?</p>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Our team is happy to answer any questions about this policy.
                  </p>
                  <a
                    href="mailto:legal@getresolvehub.com"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    legal@getresolvehub.com
                  </a>
                </div>
              </div>
            </aside>
          )}

          {/* Main content */}
          <motion.main
            className="min-w-0 flex-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-h2:text-xl prose-h2:font-bold prose-h2:text-foreground prose-h3:text-base prose-h3:font-semibold prose-h3:text-foreground prose-p:text-muted-foreground prose-p:leading-7 prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              {children}
            </div>
          </motion.main>
        </div>
      </div>

      {/* Back to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Reusable sub-components for legal prose ─────────────────────────────── */

/** Section wrapper — renders an <h2> anchor + content block */
export function LegalSection({ id, title, children }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="mb-4 text-xl font-bold text-foreground border-b border-border/50 pb-3">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Sub-section with <h3> */
export function LegalSubSection({ title, children }) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/** Highlighted callout box */
export function LegalCallout({ icon: Icon, variant = 'info', title, children }) {
  const styles = {
    info: 'border-blue-200 bg-blue-50/60 text-blue-900 dark:border-blue-800/50 dark:bg-blue-900/10 dark:text-blue-200',
    warning: 'border-amber-200 bg-amber-50/60 text-amber-900 dark:border-amber-800/50 dark:bg-amber-900/10 dark:text-amber-200',
    success: 'border-emerald-200 bg-emerald-50/60 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-900/10 dark:text-emerald-200',
    danger: 'border-red-200 bg-red-50/60 text-red-900 dark:border-red-800/50 dark:bg-red-900/10 dark:text-red-200',
  };
  return (
    <div className={`my-6 rounded-xl border p-4 ${styles[variant]}`}>
      {title && <p className="mb-1.5 text-sm font-semibold">{title}</p>}
      <div className="text-sm leading-6">{children}</div>
    </div>
  );
}

/** Bullet list */
export function LegalList({ items }) {
  return (
    <ul className="space-y-1.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-6">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Contact footer card */
export function LegalContactCard({ email = 'legal@getresolvehub.com', address }) {
  return (
    <div className="mt-12 rounded-2xl border border-border/60 bg-muted/30 p-6 sm:p-8">
      <h3 className="mb-2 text-lg font-bold text-foreground">Contact Us About This Policy</h3>
      <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
        If you have any questions, concerns, or requests regarding this policy or how ResolveHub handles your data, please contact our legal and compliance team:
      </p>
      <div className="flex flex-col gap-2 text-sm">
        <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
          <Mail className="h-4 w-4" />
          {email}
        </a>
        <a href="https://getresolvehub.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
          <ExternalLink className="h-4 w-4" />
          getresolvehub.com
        </a>
        {address && <p className="text-muted-foreground">{address}</p>}
      </div>
    </div>
  );
}
