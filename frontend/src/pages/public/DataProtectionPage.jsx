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
  { id: 'data-governance', label: 'Data Governance Principles' },
  { id: 'customer-data-protection', label: 'Customer Data Protection' },
  { id: 'complaint-confidentiality', label: 'Complaint Confidentiality' },
  { id: 'encryption', label: 'Encryption & Security' },
  { id: 'access-control', label: 'Access Control & RBAC' },
  { id: 'employee-access', label: 'Employee & Admin Access' },
  { id: 'media-security', label: 'Secure Media Uploads' },
  { id: 'breach-procedures', label: 'Data Breach Procedures' },
  { id: 'backup-recovery', label: 'Backup & Disaster Recovery' },
  { id: 'data-minimization', label: 'Data Minimization' },
  { id: 'audit-logging', label: 'Audit Logging' },
  { id: 'ghana-compliance', label: 'Ghana Data Protection Compliance' },
  { id: 'international-compliance', label: 'International Compliance Readiness' },
  { id: 'retention', label: 'Data Retention & Deletion' },
  { id: 'contact', label: 'Contact Us' },
];

export default function DataProtectionPage() {
  return (
    <>
      <SEO
        title="Data Protection Policy | ResolveHub"
        description="ResolveHub's Data Protection Policy details how we secure customer data, complaint records, and media uploads with enterprise-grade security measures and full compliance with the Ghana Data Protection Act."
        keywords="ResolveHub data protection, GDPR compliance, Ghana Data Protection Act, data security SaaS, complaint data privacy"
        canonical="https://getresolvehub.com/data-protection"
      />
      <LegalPageLayout
        title="Data Protection Policy"
        description="ResolveHub operates with data protection at its core. This policy describes the technical, organizational, and procedural controls we maintain to protect all personal data processed through our platform — from customer complaint submissions to company account data."
        lastUpdated="May 16, 2026"
        effectiveDate="May 16, 2026"
        sections={SECTIONS}
      >
        {/* ── 1. Overview ─────────────────────────────────────────────── */}
        <LegalSection id="overview" title="1. Overview">
          <p>
            ResolveHub processes personal data on behalf of businesses (as a data processor) and independently for platform operations (as a data controller). We recognize that the complaint data managed through our platform may contain sensitive personal information and must be protected to the highest standard.
          </p>
          <p>
            This Data Protection Policy describes the security controls, governance frameworks, and operational procedures that ResolveHub maintains to protect all personal data. It supplements our <a href="/privacy">Privacy Policy</a> and applies to all staff, contractors, and systems that interact with ResolveHub infrastructure.
          </p>
          <LegalCallout variant="info" title="Dual Role: Controller & Processor">
            ResolveHub operates as a <strong>data controller</strong> for account registration and platform operation data, and as a <strong>data processor</strong> for complaint and customer data collected by businesses through QR portals. This distinction is important for determining legal responsibilities under applicable data protection law.
          </LegalCallout>
        </LegalSection>

        {/* ── 2. Data Governance Principles ────────────────────────────── */}
        <LegalSection id="data-governance" title="2. Data Governance Principles">
          <p>
            All data protection practices at ResolveHub are grounded in the following core principles, aligned with the Ghana Data Protection Act 2012 (Act 843) and international best practices:
          </p>
          <LegalList items={[
            'Lawfulness, Fairness & Transparency: All personal data is collected and processed on a documented legal basis, with clear disclosure to data subjects',
            'Purpose Limitation: Data collected for complaint management is used exclusively for that purpose and not repurposed without legal basis',
            'Data Minimisation: We collect only the minimum personal data necessary to fulfill the stated purpose',
            'Accuracy: We provide mechanisms for businesses and users to correct inaccurate personal data held in the system',
            'Storage Limitation: Personal data is not retained beyond the periods specified in our retention schedule',
            'Integrity & Confidentiality: All personal data is protected using appropriate technical and organizational security measures',
            'Accountability: ResolveHub maintains documentation of its data processing activities and can demonstrate compliance on request',
          ]} />
        </LegalSection>

        {/* ── 3. Customer Data Protection ───────────────────────────────── */}
        <LegalSection id="customer-data-protection" title="3. Customer Data Protection">
          <p>
            Customer data — including names, phone numbers, and complaint content submitted through QR portals — receives the highest level of protection on our platform.
          </p>
          <LegalSubSection title="3.1 Data Isolation">
            <p>
              Complaint and customer data is logically isolated per company account. Each business account can only access data belonging to its own customers and branches. There is no cross-company data access in the platform architecture.
            </p>
          </LegalSubSection>
          <LegalSubSection title="3.2 Data Sensitivity Classification">
            <LegalList items={[
              'Customer names and phone numbers are classified as Personally Identifiable Information (PII) and subject to the strictest access controls',
              'Complaint messages may contain sensitive personal information and are treated accordingly',
              'Media attachments (images and videos) are classified as sensitive and stored with restricted access permissions',
              'Aggregate analytics derived from complaint data are anonymized before retention',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="3.3 Data Ownership">
            <p>
              Customer complaint data remains the property of the business that collected it. ResolveHub does not claim ownership over complaint data and uses it only to deliver the platform service. Businesses may export or delete their data at any time within the platform.
            </p>
          </LegalSubSection>
        </LegalSection>

        {/* ── 4. Complaint Confidentiality ──────────────────────────────── */}
        <LegalSection id="complaint-confidentiality" title="4. Complaint Confidentiality">
          <p>
            Complaint records are treated as confidential business and personal data. The following confidentiality protections are in place:
          </p>
          <LegalList items={[
            'Complaint data is visible only to authenticated, authorized users of the company account that owns the complaint',
            'Staff roles and permissions within a company account determine which complaints each staff member can access (e.g., by branch)',
            'Complaint data is never shared with other company accounts, even within the same industry',
            'ResolveHub internal staff access complaint data only with explicit authorization and only when required for technical support purposes',
            'All internal access to complaint data is logged with timestamp, user identity, and purpose',
            'Complaint data is never used in marketing materials, case studies, or external publications without the explicit written consent of the business and relevant individuals',
          ]} />
          <LegalCallout variant="warning" title="No Cross-Company Access">
            The ResolveHub platform architecture enforces strict data isolation. No company can view, access, or infer data belonging to another company, even if both companies are registered on the same platform.
          </LegalCallout>
        </LegalSection>

        {/* ── 5. Encryption & Security ──────────────────────────────────── */}
        <LegalSection id="encryption" title="5. Encryption & Security Controls">
          <LegalSubSection title="5.1 Data in Transit">
            <LegalList items={[
              'All communications between clients (browsers, mobile devices) and ResolveHub servers are encrypted using TLS 1.2 or TLS 1.3',
              'HTTP connections are automatically redirected to HTTPS; plain HTTP access is not permitted',
              'API communications between internal microservices are encrypted',
              'TLS certificates are managed with automated renewal to prevent expiration-related vulnerabilities',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="5.2 Data at Rest">
            <LegalList items={[
              'All databases storing personal data are encrypted at rest using AES-256 encryption',
              'Backups are encrypted using the same AES-256 standard before being stored',
              'Media files stored in Cloudinary are protected by Cloudinary\'s enterprise-grade encryption',
              'Encryption keys are managed securely and are not stored alongside the encrypted data',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="5.3 Password Security">
            <LegalList items={[
              'User passwords are hashed using bcrypt with a work factor of 12 or higher',
              'Passwords are never stored in plain text under any circumstances',
              'Password reset tokens are cryptographically random, time-limited (15 minutes), and single-use',
              'Failed login attempts are rate-limited and monitored for brute-force patterns',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="5.4 Infrastructure Security">
            <LegalList items={[
              'Production databases are not publicly accessible and are protected behind private network layers',
              'Security groups and firewall rules restrict inbound and outbound traffic to the minimum required',
              'Dependency vulnerabilities are monitored continuously, and critical patches are applied within 24 hours',
              'Regular penetration testing and security audits are conducted by qualified security professionals',
            ]} />
          </LegalSubSection>
        </LegalSection>

        {/* ── 6. Access Control & RBAC ──────────────────────────────────── */}
        <LegalSection id="access-control" title="6. Access Control & Role-Based Permissions">
          <p>
            ResolveHub enforces role-based access control (RBAC) at every layer of the platform to ensure that users can only access the data and features appropriate to their role.
          </p>
          <LegalSubSection title="6.1 Platform Roles">
            <LegalList items={[
              'Super Admin: Full platform access for ResolveHub operational staff only; manages company accounts, billing, and platform configuration',
              'Company Admin: Full access to their company\'s data, including all branches, complaints, analytics, staff management, and billing',
              'Company Staff: Access limited to assigned branches and relevant complaint records; no access to billing, admin settings, or other branches unless explicitly granted',
              'QR Portal Customer: Public access to complaint submission only; no access to the dashboard or any other company data',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="6.2 Principle of Least Privilege">
            <p>
              All access rights within the ResolveHub platform are governed by the principle of least privilege. Staff accounts are provisioned with the minimum access required for their role and responsibilities. Access rights are reviewed when staff roles change or employment ends.
            </p>
          </LegalSubSection>
          <LegalSubSection title="6.3 API Access Controls">
            <p>
              All API endpoints enforce authentication and authorization checks. Requests without valid authentication tokens are rejected with appropriate error responses. API rate limiting prevents abuse and unauthorized data harvesting.
            </p>
          </LegalSubSection>
        </LegalSection>

        {/* ── 7. Employee & Admin Access ────────────────────────────────── */}
        <LegalSection id="employee-access" title="7. Employee & Internal Admin Access Restrictions">
          <p>
            ResolveHub maintains strict internal policies governing access by our own employees and administrators to customer and company data:
          </p>
          <LegalList items={[
            'ResolveHub employees do not access company or customer data without a documented, legitimate business reason (e.g., resolving a support ticket)',
            'All internal access to production data is logged, attributable to a specific employee, and subject to quarterly review',
            'Access to production systems requires multi-factor authentication (MFA) for all ResolveHub staff',
            'Database administrator access is restricted to a minimum number of senior engineers and requires approval for each access event',
            'ResolveHub staff are bound by confidentiality agreements that prohibit unauthorized disclosure of company or customer data',
            'Access rights for ResolveHub staff are revoked immediately upon resignation, termination, or role change',
            'Background checks are conducted for all personnel with access to production systems and sensitive data',
          ]} />
          <LegalCallout variant="info" title="Zero-Access Architecture Goal">
            ResolveHub is progressively implementing zero-access architecture practices, where even internal systems are designed to process data without exposing identifiable personal information to engineers during routine operations.
          </LegalCallout>
        </LegalSection>

        {/* ── 8. Secure Media Uploads ───────────────────────────────────── */}
        <LegalSection id="media-security" title="8. Secure Media Uploads">
          <p>
            Media files uploaded by customers as complaint attachments receive dedicated security controls:
          </p>
          <LegalList items={[
            'All file uploads are validated for type, size, and format before being accepted by the platform',
            'Uploaded files are scanned for malicious content before being stored',
            'Media files are stored in a private, access-controlled Cloudinary environment — not in public-facing storage buckets',
            'File access requires an authenticated platform session; direct URL access without authentication is not permitted',
            'Media files are associated with their complaint record using non-sequential, non-guessable identifiers',
            'Media files are automatically deleted when the associated complaint record is deleted',
            'Metadata embedded in uploaded files (such as EXIF data containing GPS coordinates) is stripped before storage to protect the privacy of individuals who submitted the media',
          ]} />
        </LegalSection>

        {/* ── 9. Data Breach Procedures ─────────────────────────────────── */}
        <LegalSection id="breach-procedures" title="9. Data Breach Procedures">
          <p>
            ResolveHub maintains a documented Incident Response Plan that is activated in the event of a suspected or confirmed data breach.
          </p>
          <LegalSubSection title="9.1 Detection & Containment">
            <LegalList items={[
              'Continuous monitoring systems alert our security team to anomalous activity that may indicate a breach',
              'Upon detecting a potential breach, our incident response team is activated immediately to assess and contain the threat',
              'Affected systems may be isolated or temporarily taken offline to prevent further data exposure',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="9.2 Assessment & Classification">
            <LegalList items={[
              'The scope, nature, and potential impact of the breach is assessed within 4 hours of detection',
              'Breaches are classified by severity (Critical, High, Medium, Low) to determine the appropriate response level',
              'Legal and compliance teams are involved in the assessment for all Medium or higher severity breaches',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="9.3 Notification">
            <LegalList items={[
              'Affected businesses will be notified within 72 hours of confirming a breach involving their data',
              'Notifications will include the nature of the breach, data affected, likely consequences, and measures taken',
              'Where required by applicable law, the Data Protection Commission of Ghana and/or other relevant supervisory authorities will be notified within 72 hours',
              'For breaches affecting individuals\' rights and freedoms, affected data subjects will be notified without undue delay',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="9.4 Post-Incident Review">
            <p>
              All breach incidents are followed by a root cause analysis, lessons learned documentation, and implementation of corrective actions to prevent recurrence.
            </p>
          </LegalSubSection>
          <LegalCallout variant="danger" title="Reporting Security Vulnerabilities">
            If you discover a security vulnerability in the ResolveHub platform, please report it responsibly to <a href="mailto:security@getresolvehub.com">security@getresolvehub.com</a>. We operate a responsible disclosure policy and will acknowledge your report within 24 hours.
          </LegalCallout>
        </LegalSection>

        {/* ── 10. Backup & Disaster Recovery ────────────────────────────── */}
        <LegalSection id="backup-recovery" title="10. Backup & Disaster Recovery">
          <p>
            ResolveHub maintains comprehensive data backup and disaster recovery capabilities to ensure business continuity and data availability:
          </p>
          <LegalList items={[
            'Automated database backups are performed every 24 hours with a 30-day retention period',
            'Backups are stored in geographically separated, encrypted storage locations',
            'Point-in-time recovery (PITR) capabilities allow restoration to any point within the last 7 days for critical systems',
            'Backup integrity is validated through periodic restoration testing',
            'Our Recovery Time Objective (RTO) for critical systems is 4 hours; our Recovery Point Objective (RPO) is 24 hours',
            'Disaster recovery procedures are documented and tested at minimum annually',
            'Media files stored in Cloudinary benefit from Cloudinary\'s own redundant storage infrastructure',
          ]} />
        </LegalSection>

        {/* ── 11. Data Minimization ─────────────────────────────────────── */}
        <LegalSection id="data-minimization" title="11. Data Minimization">
          <p>
            ResolveHub is designed with data minimization as a core engineering principle:
          </p>
          <LegalList items={[
            'Complaint submission forms request only the information necessary for the business to resolve the complaint (name, phone, message, media)',
            'We do not collect government identification numbers, financial data, health information, or other special categories of sensitive data',
            'Analytics data is aggregated and anonymized before retention; individual-level behavioral data is not stored long-term',
            'API responses return only the data fields required by the requesting component — not full database records',
            'Log files used for debugging are sanitized to remove personally identifiable information before archival',
            'We periodically review data collection practices to identify and eliminate unnecessary data collection',
          ]} />
        </LegalSection>

        {/* ── 12. Audit Logging ─────────────────────────────────────────── */}
        <LegalSection id="audit-logging" title="12. Audit Logging">
          <p>
            ResolveHub maintains comprehensive audit logs to support security monitoring, incident investigation, and regulatory compliance:
          </p>
          <LegalSubSection title="12.1 What Is Logged">
            <LegalList items={[
              'User authentication events (login, logout, failed attempts, MFA events)',
              'Account and permission changes (role assignments, staff additions and removals)',
              'Data access events for complaint records, particularly high-sensitivity operations',
              'Administrative actions performed by ResolveHub staff on company accounts',
              'API requests including endpoint, timestamp, and anonymized user identifier',
              'Data export and deletion requests',
              'Subscription and billing changes',
              'Security-relevant events such as password changes and unusual access patterns',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="12.2 Log Retention & Protection">
            <LegalList items={[
              'Audit logs are retained for a minimum of 12 months',
              'Audit logs are stored in a write-once, tamper-evident storage system',
              'Access to audit logs is restricted to senior security and compliance personnel',
              'Log data is protected using the same encryption standards as operational data',
            ]} />
          </LegalSubSection>
        </LegalSection>

        {/* ── 13. Ghana Data Protection Compliance ──────────────────────── */}
        <LegalSection id="ghana-compliance" title="13. Ghana Data Protection Act Compliance">
          <p>
            ResolveHub is committed to full compliance with the <strong>Ghana Data Protection Act 2012 (Act 843)</strong> as a technology company operating primarily from Ghana.
          </p>
          <LegalSubSection title="13.1 Our Compliance Commitments">
            <LegalList items={[
              'We process personal data only for specified, explicit, and legitimate purposes as required by Act 843',
              'We maintain a Register of Data Processing Activities as required for data controllers under the Act',
              'We uphold the rights of data subjects in Ghana, including the right of access, correction, and erasure',
              'We have appointed a Data Protection Officer (DPO) responsible for overseeing compliance with the Act',
              'We report data breaches to the Data Protection Commission of Ghana within the timeframes required by law',
              'We conduct periodic data protection impact assessments (DPIAs) for high-risk processing activities',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="13.2 Data Protection Commission of Ghana">
            <p>
              Data subjects in Ghana have the right to lodge complaints with the <strong>Data Protection Commission of Ghana</strong> if they believe their data protection rights have been violated. We encourage you to first contact us to resolve any concerns before escalating to the Commission.
            </p>
          </LegalSubSection>
        </LegalSection>

        {/* ── 14. International Compliance Readiness ────────────────────── */}
        <LegalSection id="international-compliance" title="14. International Compliance Readiness">
          <p>
            As ResolveHub grows to serve businesses internationally, we are building compliance infrastructure aligned with major international data protection frameworks:
          </p>
          <LegalSubSection title="14.1 GDPR Readiness (European Union)">
            <LegalList items={[
              'Our privacy and data protection practices align with GDPR principles (lawfulness, transparency, purpose limitation, data minimisation, security)',
              'We support data subject rights including access, rectification, erasure, portability, and objection',
              'We use Standard Contractual Clauses (SCCs) for cross-border data transfers to the EU where applicable',
              'Data Processing Agreements (DPAs) are available for EU-based business customers upon request',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="14.2 Other Jurisdictions">
            <p>
              ResolveHub monitors regulatory developments in jurisdictions where we operate or intend to expand, including Nigeria (NDPR), Kenya (DPA 2019), South Africa (POPIA), and the United Kingdom (UK GDPR). We will update our compliance framework as we expand into these markets.
            </p>
          </LegalSubSection>
          <LegalCallout variant="info" title="Enterprise Compliance Requests">
            Enterprise customers requiring specific compliance documentation, DPAs, or security questionnaire responses for procurement purposes may request these through our enterprise sales team at <a href="mailto:enterprise@getresolvehub.com">enterprise@getresolvehub.com</a>.
          </LegalCallout>
        </LegalSection>

        {/* ── 15. Data Retention & Deletion ─────────────────────────────── */}
        <LegalSection id="retention" title="15. Data Retention & Deletion">
          <LegalSubSection title="15.1 Retention Schedule">
            <LegalList items={[
              'Active account and configuration data: Retained for the duration of the subscription',
              'Complaint records and associated data: Retained for the duration of the subscription; deletable by the business at any time',
              'Media uploads: Deleted when the associated complaint is deleted or the account is closed',
              'Billing and financial records: 7 years (financial regulation compliance)',
              'Audit logs: 12 months',
              'Anonymized analytics: Indefinitely (no personal data)',
              'Closed/deleted account data: Permanently purged within 30 days of confirmed account deletion',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="15.2 Deletion Procedures">
            <p>
              When data is deleted — whether by a business user, upon account closure, or at the end of a retention period — the following deletion process is followed:
            </p>
            <LegalList items={[
              'Records are marked for deletion and immediately become inaccessible to all users',
              'Records are permanently deleted from primary databases within 7 days',
              'Backups containing deleted records are cycled out within 30 days of the deletion date',
              'Cloudinary media files associated with deleted records are removed via API within 7 days',
              'Deletion confirmations are logged in the audit trail',
            ]} />
          </LegalSubSection>
        </LegalSection>

        {/* ── 16. Contact ───────────────────────────────────────────── */}
        <LegalSection id="contact" title="16. Contact Our Data Protection Team">
          <p>
            For data protection inquiries, requests to exercise your data subject rights, security reports, or questions about our compliance practices:
          </p>
        </LegalSection>

        <LegalContactCard
          email="legal@getresolvehub.com"
          address="ResolveHub · Data Protection Officer · getresolvehub.com · Accra, Ghana"
        />
      </LegalPageLayout>
    </>
  );
}
