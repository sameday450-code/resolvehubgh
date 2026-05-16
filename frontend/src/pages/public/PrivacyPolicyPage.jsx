import SEO from '../../components/seo';
import LegalPageLayout, {
  LegalSection,
  LegalSubSection,
  LegalCallout,
  LegalList,
  LegalContactCard,
} from '../../components/shared/LegalPageLayout';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'information-collected', label: 'Information We Collect' },
  { id: 'complaint-data', label: 'Complaint & Customer Data' },
  { id: 'media-uploads', label: 'Media Uploads' },
  { id: 'cookies', label: 'Cookies & Tracking' },
  { id: 'how-we-use-data', label: 'How We Use Your Data' },
  { id: 'legal-basis', label: 'Legal Basis for Processing' },
  { id: 'data-sharing', label: 'Data Sharing & Third Parties' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'security', label: 'Security Protections' },
  { id: 'user-rights', label: 'Your Rights' },
  { id: 'company-responsibilities', label: 'Company Responsibilities' },
  { id: 'children', label: 'Children\'s Privacy' },
  { id: 'international', label: 'International Data Transfers' },
  { id: 'policy-updates', label: 'Policy Updates' },
  { id: 'contact', label: 'Contact Us' },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy | ResolveHub"
        description="ResolveHub's Privacy Policy explains how we collect, use, protect, and manage your personal data in compliance with GDPR and the Ghana Data Protection Act."
        keywords="ResolveHub privacy policy, data protection, GDPR, Ghana Data Protection Act, complaint management privacy"
        canonical="https://getresolvehub.com/privacy"
      />
      <LegalPageLayout
        title="Privacy Policy"
        description="ResolveHub is committed to protecting your privacy and handling your personal data with transparency, security, and respect. This policy explains what we collect, why we collect it, and how it is protected."
        lastUpdated="May 16, 2026"
        effectiveDate="May 16, 2026"
        sections={SECTIONS}
      >
        {/* ── 1. Overview ─────────────────────────────────────────────── */}
        <LegalSection id="overview" title="1. Overview">
          <p>
            ResolveHub ("we", "us", or "our") operates <strong>getresolvehub.com</strong> and provides a cloud-based QR-code-powered complaint and feedback management platform. This Privacy Policy describes the personal information we collect, how we use and protect that information, and the rights available to individuals whose data we process.
          </p>
          <p>
            By accessing or using the ResolveHub platform — whether as a company administrator, staff member, or customer submitting a complaint through a QR portal — you acknowledge that you have read and understood this Privacy Policy.
          </p>
          <LegalCallout variant="info" title="Applicability">
            This policy applies to all users of the ResolveHub platform, including business account holders, staff members, and end-customers who interact with any QR complaint portal powered by ResolveHub.
          </LegalCallout>
        </LegalSection>

        {/* ── 2. Information We Collect ──────────────────────────────── */}
        <LegalSection id="information-collected" title="2. Information We Collect">
          <p>
            We collect information necessary to deliver, maintain, and improve the ResolveHub platform. The categories of information we collect depend on your relationship with the platform.
          </p>

          <LegalSubSection title="2.1 Account & Registration Data">
            <p>When a business registers on ResolveHub, we collect:</p>
            <LegalList items={[
              'Full name of the account administrator',
              'Business email address',
              'Phone number',
              'Company name, industry type, and size',
              'Billing address and company registration details (for enterprise accounts)',
              'Password (stored as a cryptographic hash — never in plain text)',
              'Google account identifiers (when Google OAuth sign-in is used)',
            ]} />
          </LegalSubSection>

          <LegalSubSection title="2.2 Complaint & Customer Data">
            <p>When customers submit complaints through a QR portal, the following data is collected on behalf of the registered business:</p>
            <LegalList items={[
              'Customer full name',
              'Customer phone number',
              'Complaint message or feedback content',
              'Complaint type and category',
              'Images and/or video attachments uploaded by the customer',
              'Branch location associated with the QR code',
              'Submission timestamp and unique complaint identifier',
            ]} />
          </LegalSubSection>

          <LegalSubSection title="2.3 Usage & Technical Data">
            <LegalList items={[
              'IP address and approximate geographic location',
              'Browser type, version, and operating system',
              'Device identifiers and screen resolution',
              'Pages visited, features used, and session duration',
              'Referring URLs and search terms',
              'API request logs and error reports',
            ]} />
          </LegalSubSection>

          <LegalSubSection title="2.4 Payment & Billing Data">
            <p>
              Payment processing is handled by our third-party payment provider. ResolveHub does not store complete card numbers or sensitive financial credentials on its servers. We retain only the minimal billing metadata necessary for subscription management, such as subscription tier, payment status, and transaction reference numbers.
            </p>
          </LegalSubSection>
        </LegalSection>

        {/* ── 3. Complaint & Customer Data ──────────────────────────── */}
        <LegalSection id="complaint-data" title="3. Complaint & Customer Data Handling">
          <LegalCallout variant="warning" title="Important: Data Controller Relationship">
            Businesses that register on ResolveHub act as independent data controllers for the complaint and customer data they collect through their QR portals. ResolveHub acts as a data processor on their behalf. Businesses are responsible for ensuring they have a lawful basis to collect customer data and that they inform their customers accordingly.
          </LegalCallout>
          <p>
            All complaint data collected through QR portals is stored securely and is accessible only to the business that owns the associated QR code and portal. Complaint data is never sold, shared with third parties, or used for advertising. ResolveHub staff access complaint data only when required for technical support, with explicit company authorization.
          </p>
          <p>
            Complaint messages, customer names, and phone numbers are treated as sensitive operational data. Access is restricted by role-based permissions within the company's dashboard, ensuring that only authorized staff view relevant complaints.
          </p>
          <LegalList items={[
            'Complaint data is encrypted at rest using AES-256 encryption',
            'All data transmissions use TLS 1.2 or higher',
            'Complaint records are logically isolated per company account',
            'Customers are not required to create an account to submit a complaint',
            'ResolveHub does not use complaint content for training AI systems',
          ]} />
        </LegalSection>

        {/* ── 4. Media Uploads ──────────────────────────────────────── */}
        <LegalSection id="media-uploads" title="4. Media Upload Handling">
          <p>
            The ResolveHub platform allows customers to attach images and videos to their complaints. All media files are processed and stored through <strong>Cloudinary</strong>, a cloud-based digital asset management service. Media uploads are subject to the following practices:
          </p>
          <LegalList items={[
            'Files are uploaded over an encrypted HTTPS connection',
            'Media files are stored in Cloudinary\'s secure cloud infrastructure with access controls',
            'Each media file is associated with the specific complaint record it was attached to',
            'Files are not publicly accessible by URL without an authenticated session',
            'Media files are deleted when the associated complaint record is deleted, or upon account closure',
            'We do not analyze, process, or extract personal data from media files beyond storage',
            'File size and type restrictions apply as documented in our platform guidelines',
          ]} />
          <LegalCallout variant="info" title="Cloudinary Data Processing">
            Cloudinary processes media files on our behalf as a data processor. Files may be stored in data centers located in the United States or European Union. For more information, see Cloudinary's privacy policy at cloudinary.com/privacy.
          </LegalCallout>
        </LegalSection>

        {/* ── 5. Cookies & Tracking ─────────────────────────────────── */}
        <LegalSection id="cookies" title="5. Cookies & Tracking Technologies">
          <p>
            ResolveHub uses cookies and similar tracking technologies to provide core platform functionality, maintain authenticated sessions, and understand how the platform is used. For full details, please review our <a href="/cookies">Cookie Policy</a>.
          </p>
          <LegalSubSection title="5.1 Types of Cookies We Use">
            <LegalList items={[
              'Essential cookies: Required for authentication, session management, and core security functions',
              'Preference cookies: Remember your language, timezone, and display preferences',
              'Analytics cookies: Aggregate usage statistics to improve platform performance (anonymized)',
              'Security cookies: CSRF tokens and anti-fraud fingerprinting mechanisms',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="5.2 Your Cookie Choices">
            <p>
              You can control non-essential cookies through your browser settings or through our cookie consent interface. Disabling essential cookies will affect platform functionality and may prevent you from accessing certain features.
            </p>
          </LegalSubSection>
        </LegalSection>

        {/* ── 6. How We Use Your Data ───────────────────────────────── */}
        <LegalSection id="how-we-use-data" title="6. How We Use Your Data">
          <p>We use the data we collect for the following purposes:</p>
          <LegalList items={[
            'Providing, operating, and maintaining the ResolveHub platform and its features',
            'Processing complaint submissions and routing them to the appropriate business',
            'Authenticating users and maintaining secure sessions',
            'Processing subscription payments and managing billing cycles',
            'Sending transactional emails (account registration, complaint notifications, password resets)',
            'Generating anonymized analytics and performance dashboards for business accounts',
            'Detecting and preventing fraudulent activity, unauthorized access, and security threats',
            'Responding to customer support requests and inquiries',
            'Complying with legal obligations, court orders, and regulatory requirements',
            'Improving, personalizing, and developing new platform features',
            'Sending product updates, policy change notices, and important service announcements',
          ]} />
          <LegalCallout variant="info" title="No Selling of Data">
            ResolveHub does not sell, rent, or trade personal data to third parties for their marketing or advertising purposes. Your data is used solely to deliver and improve the ResolveHub service.
          </LegalCallout>
        </LegalSection>

        {/* ── 7. Legal Basis ────────────────────────────────────────── */}
        <LegalSection id="legal-basis" title="7. Legal Basis for Processing">
          <p>
            Where applicable, ResolveHub processes personal data under the following legal bases:
          </p>
          <LegalList items={[
            'Contract performance: Processing necessary to deliver the service you have subscribed to (GDPR Art. 6(1)(b))',
            'Legitimate interests: Fraud prevention, security monitoring, platform improvement, and analytics (GDPR Art. 6(1)(f))',
            'Legal obligation: Compliance with applicable laws including the Ghana Data Protection Act 2012 (Act 843) and any other applicable jurisdiction (GDPR Art. 6(1)(c))',
            'Consent: Where you have given explicit consent for a specific processing activity, such as optional marketing communications (GDPR Art. 6(1)(a))',
          ]} />
          <p>
            Under the <strong>Ghana Data Protection Act 2012 (Act 843)</strong>, ResolveHub is committed to the principles of data protection including lawfulness, fairness, transparency, purpose limitation, data minimisation, accuracy, storage limitation, and security.
          </p>
        </LegalSection>

        {/* ── 8. Data Sharing ───────────────────────────────────────── */}
        <LegalSection id="data-sharing" title="8. Data Sharing & Third-Party Services">
          <p>
            ResolveHub may share personal data with the following categories of third parties, strictly as necessary to deliver the platform:
          </p>
          <LegalSubSection title="8.1 Infrastructure & Cloud Providers">
            <LegalList items={[
              'Cloud hosting and database services for platform infrastructure',
              'Content Delivery Networks (CDNs) for performance optimization',
              'Email delivery providers for transactional notifications',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="8.2 Media Storage">
            <LegalList items={[
              'Cloudinary — for secure cloud storage and processing of uploaded images and videos',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="8.3 Payment Processing">
            <LegalList items={[
              'Third-party payment gateway providers — for processing subscription and manual payments securely',
              'ResolveHub does not receive or store raw card data',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="8.4 Legal & Regulatory Authorities">
            <p>
              We may disclose personal data to government authorities, law enforcement agencies, or regulatory bodies when required to do so by applicable law, court order, or legal process.
            </p>
          </LegalSubSection>
          <LegalCallout variant="warning" title="No Unauthorized Third-Party Access">
            We do not grant third-party advertisers, data brokers, or analytics platforms access to identifiable personal data. All third-party processors are bound by contractual data processing agreements.
          </LegalCallout>
        </LegalSection>

        {/* ── 9. Data Retention ─────────────────────────────────────── */}
        <LegalSection id="data-retention" title="9. Data Retention">
          <p>
            ResolveHub retains personal data only for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, and resolve disputes.
          </p>
          <LegalList items={[
            'Active account data: Retained for the duration of the subscription plus 90 days following account closure',
            'Complaint records: Retained for the duration of the subscription; companies may delete individual records at any time',
            'Media uploads: Deleted when the associated complaint is deleted or the account is closed',
            'Billing and payment records: Retained for 7 years to comply with financial and tax regulations',
            'Activity logs and audit trails: Retained for 12 months for security and compliance purposes',
            'Anonymized aggregate analytics: May be retained indefinitely as they contain no personally identifiable information',
            'Deleted account data: Permanently purged within 30 days of confirmed account deletion request',
          ]} />
        </LegalSection>

        {/* ── 10. Security ──────────────────────────────────────────── */}
        <LegalSection id="security" title="10. Security Protections">
          <p>
            ResolveHub implements industry-standard security measures to protect personal data against unauthorized access, disclosure, alteration, and destruction.
          </p>
          <LegalList items={[
            'All data transmissions are encrypted using TLS 1.2+ (HTTPS)',
            'Data at rest is protected using AES-256 encryption',
            'Passwords are hashed using bcrypt with appropriate salt rounds',
            'Role-based access control (RBAC) limits data access to authorized personnel only',
            'Multi-factor authentication is available for company administrator accounts',
            'Regular security audits and vulnerability assessments are conducted',
            'Database access is restricted to internal systems; no public database exposure',
            'Intrusion detection and anomaly monitoring are active on all production systems',
            'All third-party processors are vetted and contractually obligated to meet our security standards',
          ]} />
          <LegalCallout variant="warning" title="Security Breach Notification">
            In the event of a data breach that poses a risk to your rights and freedoms, ResolveHub will notify affected individuals and relevant regulatory authorities within 72 hours of becoming aware, as required by applicable law.
          </LegalCallout>
        </LegalSection>

        {/* ── 11. Your Rights ───────────────────────────────────────── */}
        <LegalSection id="user-rights" title="11. Your Rights">
          <p>
            Depending on your jurisdiction and relationship with ResolveHub, you may have the following rights regarding your personal data:
          </p>
          <LegalList items={[
            'Right of Access: Request a copy of the personal data we hold about you',
            'Right to Rectification: Request correction of inaccurate or incomplete personal data',
            'Right to Erasure ("Right to be Forgotten"): Request deletion of your personal data, subject to legal retention obligations',
            'Right to Restriction of Processing: Request that we limit how we use your data in certain circumstances',
            'Right to Data Portability: Receive your data in a structured, machine-readable format',
            'Right to Object: Object to processing based on legitimate interests or for direct marketing',
            'Right to Withdraw Consent: Withdraw consent for processing activities where consent was the legal basis',
            'Right to Lodge a Complaint: File a complaint with your local data protection authority',
          ]} />
          <p>
            To exercise any of these rights, please contact us at <a href="mailto:legal@getresolvehub.com">legal@getresolvehub.com</a>. We will respond to all verified requests within 30 days.
          </p>
          <LegalCallout variant="info" title="Ghana Data Protection Rights">
            Under the Ghana Data Protection Act 2012 (Act 843), individuals in Ghana may also submit data protection complaints to the <strong>Data Protection Commission of Ghana</strong> if they believe their rights have been violated.
          </LegalCallout>
        </LegalSection>

        {/* ── 12. Company Responsibilities ──────────────────────────── */}
        <LegalSection id="company-responsibilities" title="12. Company Responsibilities">
          <p>
            Businesses that use ResolveHub as their complaint management platform bear specific responsibilities as independent data controllers for their customers' data:
          </p>
          <LegalList items={[
            'Obtaining necessary consent or establishing a lawful basis for collecting customer complaint data through QR portals',
            'Informing customers about the collection of their personal data through visible privacy notices at QR code locations',
            'Ensuring that staff with access to the ResolveHub dashboard are aware of and comply with data protection obligations',
            'Not using the platform to collect data for purposes other than complaint and feedback management',
            'Reporting any suspected data breaches involving customer data to ResolveHub immediately',
            'Complying with applicable national data protection laws in the jurisdiction(s) where they operate',
            'Ensuring that complaint data is not retained beyond the period necessary for resolution',
          ]} />
        </LegalSection>

        {/* ── 13. Children's Privacy ────────────────────────────────── */}
        <LegalSection id="children" title="13. Children's Privacy">
          <p>
            The ResolveHub platform is designed for use by businesses and is not intended for, nor directed at, individuals under the age of 16. We do not knowingly collect personal data from children under the age of 16.
          </p>
          <p>
            While customers may submit complaints through QR portals regardless of age (as complaint portals are public-facing business tools), ResolveHub does not create accounts for minors, and complaint data is collected solely for the purpose of complaint resolution by the business.
          </p>
          <p>
            If you believe that personal data belonging to a child under 16 has been collected through the ResolveHub platform, please contact us immediately at <a href="mailto:legal@getresolvehub.com">legal@getresolvehub.com</a>.
          </p>
        </LegalSection>

        {/* ── 14. International Data Transfers ──────────────────────── */}
        <LegalSection id="international" title="14. International Data Transfers">
          <p>
            ResolveHub is headquartered in Ghana, and our primary operations serve businesses in Ghana and across Africa. However, due to the nature of cloud infrastructure, personal data may be transferred to and processed in countries outside of Ghana, including the United States and European Union member states.
          </p>
          <p>
            Where data is transferred internationally, we ensure appropriate safeguards are in place, including:
          </p>
          <LegalList items={[
            'Standard Contractual Clauses (SCCs) with cloud providers and data processors',
            'Data Processing Agreements with all third-party processors',
            'Use of providers that maintain recognized security certifications (ISO 27001, SOC 2)',
            'Compliance with transfer mechanisms recognized under the Ghana Data Protection Act 2012',
          ]} />
          <p>
            As ResolveHub expands to serve international markets, we will update this policy to reflect applicable cross-border data transfer frameworks including GDPR adequacy decisions and relevant bilateral data agreements.
          </p>
        </LegalSection>

        {/* ── 15. Policy Updates ────────────────────────────────────── */}
        <LegalSection id="policy-updates" title="15. Policy Updates">
          <p>
            ResolveHub may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or business operations. When we make material changes to this policy, we will:
          </p>
          <LegalList items={[
            'Update the "Last Updated" date at the top of this policy',
            'Send an email notification to registered account administrators',
            'Display a prominent notice on the ResolveHub platform dashboard',
            'For significant changes, request re-acknowledgment of the updated policy before continued use',
          ]} />
          <p>
            Your continued use of the ResolveHub platform after the effective date of any updated policy constitutes your acceptance of the changes. We encourage you to review this policy periodically.
          </p>
        </LegalSection>

        {/* ── 16. Contact ───────────────────────────────────────────── */}
        <LegalSection id="contact" title="16. Contact Us">
          <p>
            If you have any questions, concerns, or requests relating to this Privacy Policy or our data practices, please contact our legal and compliance team:
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
