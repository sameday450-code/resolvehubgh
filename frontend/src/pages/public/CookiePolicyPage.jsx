import SEO from '../../components/seo';
import LegalPageLayout, {
  LegalSection,
  LegalSubSection,
  LegalCallout,
  LegalList,
  LegalContactCard,
} from '../../components/shared/LegalPageLayout';

const SECTIONS = [
  { id: 'what-are-cookies', label: 'What Are Cookies?' },
  { id: 'how-we-use-cookies', label: 'How We Use Cookies' },
  { id: 'essential-cookies', label: 'Essential Cookies' },
  { id: 'auth-cookies', label: 'Authentication Cookies' },
  { id: 'analytics-cookies', label: 'Analytics Cookies' },
  { id: 'security-cookies', label: 'Security Cookies' },
  { id: 'session-cookies', label: 'Session Management' },
  { id: 'third-party-cookies', label: 'Third-Party Cookies' },
  { id: 'cookie-control', label: 'Controlling Cookies' },
  { id: 'consent', label: 'Cookie Consent' },
  { id: 'updates', label: 'Policy Updates' },
  { id: 'contact', label: 'Contact Us' },
];

/* Reusable cookie table row */
function CookieRow({ name, purpose, duration, type }) {
  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="py-3 pr-4 text-sm font-mono font-medium text-foreground align-top">{name}</td>
      <td className="py-3 pr-4 text-sm text-muted-foreground align-top">{purpose}</td>
      <td className="py-3 pr-4 text-sm text-muted-foreground align-top whitespace-nowrap">{duration}</td>
      <td className="py-3 text-sm align-top">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          type === 'Essential'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            : type === 'Security'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            : type === 'Analytics'
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            : 'bg-muted text-muted-foreground'
        }`}>
          {type}
        </span>
      </td>
    </tr>
  );
}

export default function CookiePolicyPage() {
  return (
    <>
      <SEO
        title="Cookie Policy | ResolveHub"
        description="Learn how ResolveHub uses cookies to provide authentication, security, and analytics on our complaint management platform."
        keywords="ResolveHub cookie policy, cookies SaaS, browser cookies, analytics cookies, session cookies"
        canonical="https://getresolvehub.com/cookies"
      />
      <LegalPageLayout
        title="Cookie Policy"
        description="This Cookie Policy explains how ResolveHub uses cookies and similar tracking technologies on our platform. We use cookies to ensure platform functionality, secure your sessions, and understand how our platform is used."
        lastUpdated="May 16, 2026"
        effectiveDate="May 16, 2026"
        sections={SECTIONS}
      >
        {/* ── 1. What Are Cookies ───────────────────────────────────── */}
        <LegalSection id="what-are-cookies" title="1. What Are Cookies?">
          <p>
            Cookies are small text files that are placed on your device (computer, tablet, or smartphone) by websites and web applications you visit. They are widely used to make websites work efficiently, provide core functionality, remember preferences, and deliver analytics information to site operators.
          </p>
          <p>
            Cookies typically contain:
          </p>
          <LegalList items={[
            'The name of the domain that set the cookie',
            'The duration (lifespan) of the cookie',
            'A unique identifier or value associated with your session or preferences',
          ]} />
          <p>
            Cookies do not contain executable code and cannot be used to introduce malware or viruses. ResolveHub uses only legitimate, industry-standard cookie practices.
          </p>
          <LegalCallout variant="info" title="Similar Technologies">
            In addition to traditional cookies, we may also use similar technologies such as web storage (localStorage, sessionStorage) and browser fingerprinting for security purposes. This policy covers all such technologies collectively.
          </LegalCallout>
        </LegalSection>

        {/* ── 2. How We Use Cookies ─────────────────────────────────── */}
        <LegalSection id="how-we-use-cookies" title="2. How ResolveHub Uses Cookies">
          <p>
            ResolveHub uses cookies and similar technologies for the following categories of purposes:
          </p>
          <LegalList items={[
            'Authentication — to identify you as a logged-in user and maintain your session securely',
            'Security — to protect against cross-site request forgery (CSRF), session hijacking, and other security threats',
            'Functionality — to remember your preferences, settings, and personalized configurations',
            'Performance & Analytics — to understand how the platform is being used and identify areas for improvement',
            'Session management — to manage your active session and ensure a seamless platform experience',
          ]} />
          <p>
            ResolveHub does <strong>not</strong> use cookies for targeted advertising, third-party tracking, behavioral profiling, or the sale of user data.
          </p>
        </LegalSection>

        {/* ── 3. Essential Cookies ──────────────────────────────────── */}
        <LegalSection id="essential-cookies" title="3. Essential Cookies">
          <p>
            Essential cookies are strictly necessary for the ResolveHub platform to function. Without these cookies, core features of the platform cannot operate. These cookies cannot be disabled.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border/60 mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="px-0 py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground pl-4">Name</th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Purpose</th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Duration</th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</th>
                </tr>
              </thead>
              <tbody className="pl-4">
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4 pl-4 text-sm font-mono font-medium text-foreground align-top">rh_session</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground align-top">Maintains your authenticated session state across page visits</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground align-top whitespace-nowrap">Session</td>
                  <td className="py-3 text-sm align-top"><span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Essential</span></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 pr-4 pl-4 text-sm font-mono font-medium text-foreground align-top">rh_auth_token</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground align-top">Stores your authentication token to keep you signed in securely</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground align-top whitespace-nowrap">7 days</td>
                  <td className="py-3 text-sm align-top"><span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Essential</span></td>
                </tr>
                <tr className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4 pl-4 text-sm font-mono font-medium text-foreground align-top">rh_csrf</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground align-top">CSRF protection token to validate form submissions and API requests</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground align-top whitespace-nowrap">Session</td>
                  <td className="py-3 text-sm align-top"><span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Security</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </LegalSection>

        {/* ── 4. Authentication Cookies ─────────────────────────────── */}
        <LegalSection id="auth-cookies" title="4. Authentication Cookies">
          <p>
            Authentication cookies are a critical subset of essential cookies. They enable the ResolveHub platform to identify you as a logged-in user and maintain secure access to your account and dashboard across browser sessions.
          </p>
          <LegalSubSection title="4.1 How Authentication Cookies Work">
            <p>
              When you sign in to ResolveHub, an authentication token is generated and stored securely as an HTTP-only, secure cookie. This token is used to:
            </p>
            <LegalList items={[
              'Verify your identity on each request to the platform without requiring re-login',
              'Ensure that only your browser session can access your account data',
              'Automatically expire your session after a period of inactivity for security',
              'Support the "Remember Me" functionality when you choose to stay signed in',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="4.2 Token Security">
            <p>
              Authentication tokens are:
            </p>
            <LegalList items={[
              'Stored as HTTP-only cookies (inaccessible to JavaScript, protecting against XSS attacks)',
              'Transmitted only over HTTPS connections (Secure flag enabled)',
              'Bound to the specific domain of the ResolveHub platform',
              'Rotated on each login to prevent token reuse attacks',
              'Immediately invalidated on logout',
            ]} />
          </LegalSubSection>
        </LegalSection>

        {/* ── 5. Analytics Cookies ──────────────────────────────────── */}
        <LegalSection id="analytics-cookies" title="5. Analytics Cookies">
          <p>
            ResolveHub uses analytics cookies to collect anonymized, aggregate data about how users interact with the platform. This data helps us improve performance, identify usability issues, and prioritize feature development.
          </p>
          <LegalCallout variant="info" title="Anonymized Data Only">
            Analytics cookies used by ResolveHub collect aggregate, anonymized usage patterns. We do not use analytics cookies to build individual user profiles or for advertising purposes. IP addresses used in analytics are anonymized before storage.
          </LegalCallout>
          <LegalSubSection title="5.1 What Analytics Cookies Track">
            <LegalList items={[
              'Which pages and features are accessed most frequently',
              'Platform loading times and performance metrics',
              'Error occurrences and their frequency',
              'General geographic region of usage (country-level, not street-level)',
              'Browser and device type for compatibility testing',
              'Session duration and feature usage patterns',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="5.2 Opting Out of Analytics">
            <p>
              You may opt out of analytics cookies at any time through our cookie consent interface without affecting your ability to use core platform features.
            </p>
          </LegalSubSection>
        </LegalSection>

        {/* ── 6. Security Cookies ───────────────────────────────────── */}
        <LegalSection id="security-cookies" title="6. Security Cookies">
          <p>
            Security cookies are used by ResolveHub to protect you and the platform against common web security threats. These cookies are non-negotiable and cannot be disabled without compromising platform security.
          </p>
          <LegalList items={[
            'CSRF Tokens: Unique tokens generated per session to validate that form submissions and state-changing API requests originate from your authenticated session',
            'Rate Limiting Identifiers: Tokens used to detect and throttle suspicious activity such as brute-force login attempts',
            'Fraud Prevention: Anonymized device fingerprints used to detect and block fraudulent account activity',
            'Bot Detection: Signals used to distinguish human users from automated bots attempting to abuse the platform',
          ]} />
        </LegalSection>

        {/* ── 7. Session Management ─────────────────────────────────── */}
        <LegalSection id="session-cookies" title="7. Session Management">
          <p>
            Session management cookies enable the ResolveHub platform to maintain a coherent, secure user experience throughout your visit. These cookies are temporary and are deleted when you close your browser or explicitly log out.
          </p>
          <LegalSubSection title="7.1 Session Lifetime">
            <LegalList items={[
              'Active sessions expire after 24 hours of inactivity for security purposes',
              'Persistent "Remember Me" sessions last up to 7 days before requiring re-authentication',
              'All sessions are immediately invalidated when you click "Log Out"',
              'Sessions are invalidated when a password change or security event is detected',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="7.2 Concurrent Sessions">
            <p>
              ResolveHub currently allows multiple concurrent sessions (e.g., accessing the platform on both a laptop and a mobile device). You can review and revoke active sessions from your account security settings.
            </p>
          </LegalSubSection>
        </LegalSection>

        {/* ── 8. Third-Party Cookies ────────────────────────────────── */}
        <LegalSection id="third-party-cookies" title="8. Third-Party Cookie Usage">
          <p>
            ResolveHub integrates with a small number of trusted third-party services that may set their own cookies on your device. These third parties are contractually prohibited from using these cookies for their own advertising or cross-site tracking.
          </p>
          <LegalList items={[
            'Cloudinary: May set technical cookies related to media delivery optimization and CDN performance',
            'Payment Gateway: Our payment processor may set security and session cookies during the payment flow to prevent fraud',
            'Customer Support Tools: If you interact with our support widget, the support provider may set functional cookies',
          ]} />
          <p>
            ResolveHub does not embed social media pixels, advertising tracking scripts, or any third-party analytics that profile individual users across different websites.
          </p>
        </LegalSection>

        {/* ── 9. Controlling Cookies ────────────────────────────────── */}
        <LegalSection id="cookie-control" title="9. Controlling Cookies via Your Browser">
          <p>
            You have the right to accept, reject, or delete cookies through your browser settings. Instructions for the most common browsers are as follows:
          </p>
          <LegalList items={[
            'Google Chrome: Settings → Privacy and Security → Cookies and other site data',
            'Mozilla Firefox: Settings → Privacy & Security → Cookies and Site Data',
            'Apple Safari: Preferences → Privacy → Manage Website Data',
            'Microsoft Edge: Settings → Cookies and site permissions → Cookies and site data',
            'Opera: Settings → Privacy & Security → Site Settings → Cookies',
          ]} />
          <LegalCallout variant="warning" title="Impact of Disabling Essential Cookies">
            If you disable essential or authentication cookies through your browser settings, you will not be able to log in to the ResolveHub platform. Core features depend on these cookies functioning correctly. We recommend only disabling non-essential cookies (analytics, preferences) if you wish to limit cookie use.
          </LegalCallout>
          <p>
            For more information about managing cookies, you can visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">allaboutcookies.org</a>.
          </p>
        </LegalSection>

        {/* ── 10. Cookie Consent ────────────────────────────────────── */}
        <LegalSection id="consent" title="10. Cookie Consent Management">
          <p>
            When you first visit ResolveHub, you will be presented with a cookie consent banner that allows you to:
          </p>
          <LegalList items={[
            'Accept all cookies (essential, analytics, and functional)',
            'Accept only essential cookies (required for core platform functionality)',
            'Customize your cookie preferences by category',
          ]} />
          <p>
            Your cookie preferences are stored and respected throughout your use of the platform. You can update your cookie preferences at any time through the cookie settings link in our platform footer.
          </p>
          <p>
            Essential and security cookies do not require consent as they are strictly necessary for the platform to function and are deployed on the basis of legitimate interest under applicable data protection law.
          </p>
        </LegalSection>

        {/* ── 11. Policy Updates ────────────────────────────────────── */}
        <LegalSection id="updates" title="11. Updates to This Cookie Policy">
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our technology, legal requirements, or business practices. When material changes are made, we will update the "Last Updated" date at the top of this page and, where appropriate, notify registered users via email.
          </p>
          <p>
            We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
          </p>
        </LegalSection>

        {/* ── 12. Contact ───────────────────────────────────────────── */}
        <LegalSection id="contact" title="12. Contact Us">
          <p>
            If you have questions about our use of cookies or this Cookie Policy, please contact our privacy team:
          </p>
        </LegalSection>

        <LegalContactCard
          email="legal@getresolvehub.com"
          address="ResolveHub · getresolvehub.com · Accra, Ghana"
        />
      </LegalPageLayout>
    </>
  );
}
