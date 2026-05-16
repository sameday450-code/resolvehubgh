import SEO from '../../components/seo';
import LegalPageLayout, {
  LegalSection,
  LegalSubSection,
  LegalCallout,
  LegalList,
  LegalContactCard,
} from '../../components/shared/LegalPageLayout';

const SECTIONS = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'service-description', label: 'Service Description' },
  { id: 'account-registration', label: 'Account Registration' },
  { id: 'company-responsibilities', label: 'Company Responsibilities' },
  { id: 'qr-portal-usage', label: 'QR Portal Usage Rules' },
  { id: 'prohibited-activities', label: 'Prohibited Activities' },
  { id: 'content-ownership', label: 'Content & IP Ownership' },
  { id: 'media-uploads', label: 'Media Upload Rules' },
  { id: 'subscription', label: 'Subscription & Payments' },
  { id: 'trial', label: 'Trial Period' },
  { id: 'termination', label: 'Suspension & Termination' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'service-availability', label: 'Service Availability' },
  { id: 'security-obligations', label: 'Security Obligations' },
  { id: 'governing-law', label: 'Governing Law' },
  { id: 'dispute-resolution', label: 'Dispute Resolution' },
  { id: 'changes', label: 'Changes to Terms' },
  { id: 'contact', label: 'Contact Us' },
];

export default function TermsPage() {
  return (
    <>
      <SEO
        title="Terms & Conditions | ResolveHub"
        description="Read ResolveHub's Terms and Conditions. These terms govern your use of our QR-powered complaint and feedback management platform."
        keywords="ResolveHub terms and conditions, SaaS terms of service, complaint management platform terms"
        canonical="https://getresolvehub.com/terms"
      />
      <LegalPageLayout
        title="Terms & Conditions"
        description="These Terms and Conditions govern your access to and use of the ResolveHub platform. By registering an account or using any part of our service, you agree to be bound by these terms."
        lastUpdated="May 16, 2026"
        effectiveDate="May 16, 2026"
        sections={SECTIONS}
      >
        {/* ── 1. Acceptance ─────────────────────────────────────────── */}
        <LegalSection id="acceptance" title="1. Acceptance of Terms">
          <p>
            These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("Customer", "Company", or "User") and <strong>ResolveHub</strong> ("we", "us", or "our"), the operator of the ResolveHub platform accessible at <a href="https://getresolvehub.com">getresolvehub.com</a>.
          </p>
          <p>
            By creating an account, accessing the platform, initiating a free trial, or using any feature of the ResolveHub service, you confirm that you have read, understood, and agree to be legally bound by these Terms, along with our <a href="/privacy">Privacy Policy</a>, <a href="/cookies">Cookie Policy</a>, and <a href="/refunds">Refund Policy</a>, all of which are incorporated herein by reference.
          </p>
          <LegalCallout variant="warning" title="Authority to Accept Terms">
            If you are registering on behalf of a company or organization, you represent and warrant that you have the authority to bind that entity to these Terms. If you do not have such authority, you must not accept these Terms or use the platform.
          </LegalCallout>
          <p>
            ResolveHub reserves the right to modify these Terms at any time. Your continued use of the platform following notification of changes constitutes acceptance of the revised Terms.
          </p>
        </LegalSection>

        {/* ── 2. Service Description ────────────────────────────────── */}
        <LegalSection id="service-description" title="2. Service Description">
          <p>
            ResolveHub is a Software-as-a-Service (SaaS) platform that enables businesses to collect, manage, and resolve customer complaints and feedback through QR code-powered portals. The platform provides:
          </p>
          <LegalList items={[
            'QR code generation and management for complaint submission portals',
            'A secure company dashboard for complaint management, tracking, and resolution',
            'Multi-branch management capabilities',
            'Real-time notifications for new and updated complaints',
            'Analytics and performance reporting dashboards',
            'Staff and role management tools',
            'Customer complaint portals accessible via QR scan',
            'Media (image and video) upload capabilities for complaint evidence',
            'Subscription billing and account management',
          ]} />
          <p>
            The platform is provided on a subscription basis. Access to specific features may vary based on the subscription plan selected. ResolveHub reserves the right to modify, add, or remove features at any time with reasonable notice to active subscribers.
          </p>
        </LegalSection>

        {/* ── 3. Account Registration ───────────────────────────────── */}
        <LegalSection id="account-registration" title="3. Account Registration & Eligibility">
          <LegalSubSection title="3.1 Eligibility Requirements">
            <p>To register for a ResolveHub account, you must:</p>
            <LegalList items={[
              'Be at least 18 years of age',
              'Be a legally registered business or authorized representative thereof',
              'Provide accurate, complete, and current registration information',
              'Not be a person barred from receiving services under applicable law',
              'Agree to these Terms on behalf of yourself and your organization',
            ]} />
          </LegalSubSection>

          <LegalSubSection title="3.2 Account Security">
            <p>You are responsible for:</p>
            <LegalList items={[
              'Maintaining the confidentiality of your account credentials',
              'All activities that occur under your account',
              'Immediately notifying ResolveHub of any unauthorized access or suspected security breach',
              'Ensuring all staff members with platform access are aware of and comply with these Terms',
              'Using strong passwords and enabling available security features',
            ]} />
          </LegalSubSection>

          <LegalSubSection title="3.3 Account Accuracy">
            <p>
              You agree to keep your account information accurate and up to date. Providing false or misleading registration information may result in immediate account suspension or termination.
            </p>
          </LegalSubSection>

          <LegalSubSection title="3.4 One Account Per Entity">
            <p>
              Each business entity is permitted to maintain one primary account. Sub-accounts may be created for staff members under the primary business account in accordance with the features of your subscription plan.
            </p>
          </LegalSubSection>
        </LegalSection>

        {/* ── 4. Company Responsibilities ───────────────────────────── */}
        <LegalSection id="company-responsibilities" title="4. Company Responsibilities">
          <p>
            As a registered business using the ResolveHub platform, you agree to and are responsible for the following:
          </p>
          <LegalList items={[
            'Placing QR codes only in legitimate business locations where customers may voluntarily scan them',
            'Informing customers that scanning the QR code will collect their personal data for complaint processing',
            'Displaying appropriate privacy notices at QR code locations in compliance with applicable law',
            'Ensuring that your use of the platform complies with all applicable national, regional, and local laws',
            'Responding to and resolving customer complaints submitted through your QR portals in a timely and professional manner',
            'Not using the platform to discriminate against, harass, or retaliate against complainants',
            'Maintaining the confidentiality of complaint data and restricting access to authorized staff only',
            'Keeping your subscription active and payments up to date to maintain platform access',
            'Reporting any platform vulnerabilities, bugs, or security concerns to ResolveHub immediately',
            'Not assigning, sublicensing, or reselling your ResolveHub account to a third party without written consent',
          ]} />
        </LegalSection>

        {/* ── 5. QR Portal Usage ────────────────────────────────────── */}
        <LegalSection id="qr-portal-usage" title="5. QR Complaint Portal Usage Rules">
          <p>
            QR complaint portals generated by ResolveHub are intended solely for the collection of genuine customer complaints and feedback. The following rules apply to all QR portals:
          </p>
          <LegalSubSection title="5.1 Permitted Uses">
            <LegalList items={[
              'Collecting customer complaints, feedback, reports, and suggestions about business services or products',
              'Allowing customers to attach supporting evidence (images, videos) to their complaints',
              'Routing complaints to appropriate branch locations for resolution tracking',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="5.2 Prohibited Uses">
            <LegalList items={[
              'Using QR portals to collect customer data for purposes other than complaint management',
              'Deploying QR codes in deceptive contexts to trick customers into submitting data',
              'Using QR portals to gather competitive intelligence or market research without disclosure',
              'Manipulating or artificially inflating complaint volumes for any purpose',
              'Using the QR portal to collect financial data, government ID numbers, or health information',
            ]} />
          </LegalSubSection>
          <LegalCallout variant="danger" title="QR Code Misuse">
            Any misuse of QR portals in violation of these Terms may result in immediate suspension of the associated QR codes and the parent company account without refund.
          </LegalCallout>
        </LegalSection>

        {/* ── 6. Prohibited Activities ──────────────────────────────── */}
        <LegalSection id="prohibited-activities" title="6. Prohibited Activities">
          <p>
            You agree not to engage in any of the following activities when using the ResolveHub platform:
          </p>
          <LegalList items={[
            'Attempting to gain unauthorized access to any part of the platform, including other companies\' data',
            'Conducting automated attacks, denial-of-service attacks, or vulnerability scanning against ResolveHub infrastructure',
            'Using bots, scrapers, or automated tools to access or extract platform data',
            'Uploading malware, ransomware, viruses, or any other malicious code',
            'Impersonating ResolveHub, a ResolveHub employee, or another company or individual',
            'Using the platform to facilitate illegal activities, fraud, or money laundering',
            'Attempting to reverse-engineer, decompile, or disassemble the ResolveHub platform',
            'Circumventing, disabling, or interfering with security features of the platform',
            'Using the platform to send unsolicited communications or spam',
            'Violating any intellectual property rights of ResolveHub or third parties',
            'Sharing account credentials or allowing unauthorized third parties to access your account',
            'Engaging in any activity that degrades the performance of the platform for other users',
          ]} />
          <LegalCallout variant="danger" title="Zero Tolerance Policy">
            Violations of this section may result in immediate account termination, reporting to law enforcement authorities, and civil or criminal legal action at ResolveHub's discretion.
          </LegalCallout>
        </LegalSection>

        {/* ── 7. Content Ownership ──────────────────────────────────── */}
        <LegalSection id="content-ownership" title="7. Content & Intellectual Property Ownership">
          <LegalSubSection title="7.1 ResolveHub Intellectual Property">
            <p>
              All intellectual property rights in the ResolveHub platform, including but not limited to software, code, algorithms, UI/UX design, trademarks, logos, brand assets, documentation, and training materials, are and shall remain the exclusive property of ResolveHub. No license to these materials is granted except as expressly stated in these Terms.
            </p>
          </LegalSubSection>
          <LegalSubSection title="7.2 Your Content">
            <p>
              You retain ownership of all content you upload to the platform, including complaint data, media files, company profile information, and any other data generated through your use of the service ("Your Content"). By uploading content to ResolveHub, you grant us a limited, non-exclusive, worldwide, royalty-free license to store, process, display, and transmit Your Content solely to provide and operate the platform on your behalf.
            </p>
          </LegalSubSection>
          <LegalSubSection title="7.3 Feedback">
            <p>
              If you provide ResolveHub with suggestions, feedback, or ideas for improvements to the platform, you grant us an irrevocable, perpetual, worldwide, royalty-free license to use such feedback without restriction or compensation.
            </p>
          </LegalSubSection>
          <LegalSubSection title="7.4 No Reverse Engineering">
            <p>
              You may not copy, reproduce, distribute, modify, create derivative works from, publicly display, or sublicense any part of the ResolveHub platform or its content without prior written consent.
            </p>
          </LegalSubSection>
        </LegalSection>

        {/* ── 8. Media Upload Rules ─────────────────────────────────── */}
        <LegalSection id="media-uploads" title="8. Media Upload Rules">
          <p>
            Customers may attach media files (images and videos) to complaint submissions. By uploading media files, users acknowledge and agree to the following rules:
          </p>
          <LegalList items={[
            'Uploaded media must be directly relevant to the complaint being submitted',
            'Users may only upload media they own or have the right to upload',
            'Media files must not contain illegal content, including content that is defamatory, obscene, or in violation of third-party intellectual property rights',
            'Images and videos containing identifying information of uninvolved third parties should be minimized',
            'Maximum file sizes and supported formats are specified in the platform documentation',
            'ResolveHub does not review, moderate, or validate the content of uploaded media but reserves the right to remove content that violates these Terms',
            'Media files associated with a complaint are accessible only to the business associated with that complaint',
          ]} />
        </LegalSection>

        {/* ── 9. Subscription & Payments ────────────────────────────── */}
        <LegalSection id="subscription" title="9. Subscription & Payment Terms">
          <LegalSubSection title="9.1 Subscription Plans">
            <p>
              Access to ResolveHub is provided on a subscription basis. Available subscription plans, pricing, and feature inclusions are described on our pricing page and are subject to change with advance notice to existing subscribers.
            </p>
          </LegalSubSection>
          <LegalSubSection title="9.2 Billing Cycles">
            <LegalList items={[
              'Subscriptions are billed on a monthly or annual basis, as selected at signup',
              'Annual subscriptions are billed upfront for the full subscription year',
              'Subscription fees are charged at the start of each billing period',
              'All fees are quoted and charged in the currency specified at the time of subscription',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="9.3 Manual Payments">
            <p>
              For accounts using manual payment methods (e.g., bank transfer, mobile money), activation is subject to receipt and manual verification of payment. ResolveHub reserves the right to withhold or delay platform access until payment is confirmed by our finance team.
            </p>
          </LegalSubSection>
          <LegalSubSection title="9.4 Late and Failed Payments">
            <p>
              If a subscription payment fails or is not received by the due date, ResolveHub may restrict access to premium features or suspend the account until payment is brought current. Accounts inactive for more than 14 days due to non-payment may be subject to permanent termination at ResolveHub's discretion.
            </p>
          </LegalSubSection>
          <LegalSubSection title="9.5 Taxes">
            <p>
              All fees are exclusive of applicable taxes. You are responsible for paying all applicable taxes, levies, or duties imposed by taxing authorities in your jurisdiction.
            </p>
          </LegalSubSection>
          <LegalCallout variant="info" title="Refund Policy">
            For full details on refunds, cancellations, and billing disputes, please refer to our separate <a href="/refunds">Refund Policy</a>.
          </LegalCallout>
        </LegalSection>

        {/* ── 10. Trial Period ──────────────────────────────────────── */}
        <LegalSection id="trial" title="10. Trial Period">
          <p>
            ResolveHub may offer a free trial period for new accounts. Trial access is subject to the following limitations:
          </p>
          <LegalList items={[
            'Free trials are available only to first-time registrants; one trial per company entity',
            'Trial accounts have access to a limited feature set as specified at the time of trial activation',
            'Trial periods last for the duration specified at signup and are not extendable without written approval from ResolveHub',
            'No payment details are required during the trial period unless explicitly stated',
            'At the end of the trial period, the account will require an active subscription to continue accessing platform features',
            'Complaint data and configurations created during a trial are retained if the account is upgraded to a paid subscription',
            'If the trial is not converted to a paid subscription, trial data may be permanently deleted after a 7-day grace period following trial expiry',
            'ResolveHub reserves the right to terminate a trial at any time if misuse, fraud, or violation of these Terms is suspected',
          ]} />
        </LegalSection>

        {/* ── 11. Termination ───────────────────────────────────────── */}
        <LegalSection id="termination" title="11. Suspension & Termination">
          <LegalSubSection title="11.1 Termination by You">
            <p>
              You may cancel your ResolveHub subscription at any time by contacting our support team or using the account cancellation option in your dashboard settings. Cancellation takes effect at the end of the current billing period. No partial refunds are provided for unused subscription time unless specified in our Refund Policy.
            </p>
          </LegalSubSection>
          <LegalSubSection title="11.2 Termination or Suspension by ResolveHub">
            <p>ResolveHub reserves the right to suspend or terminate your account, with or without notice, if:</p>
            <LegalList items={[
              'You breach any provision of these Terms',
              'Payment is overdue by more than 14 days',
              'We detect fraudulent, abusive, or illegal use of the platform',
              'Your account poses a security risk to ResolveHub or other users',
              'We are required to do so by law or regulatory order',
              'You attempt to reverse-engineer or circumvent platform security measures',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="11.3 Effect of Termination">
            <p>
              Upon termination, your access to the platform will be revoked. You may request an export of your data within 30 days of termination. After this period, all account data will be permanently deleted in accordance with our data retention policy.
            </p>
          </LegalSubSection>
        </LegalSection>

        {/* ── 12. Limitation of Liability ───────────────────────────── */}
        <LegalSection id="liability" title="12. Limitation of Liability">
          <LegalCallout variant="warning" title="Important Limitation">
            Please read this section carefully as it limits ResolveHub's liability to you.
          </LegalCallout>
          <p>
            To the maximum extent permitted by applicable law:
          </p>
          <LegalList items={[
            'ResolveHub provides the platform "as is" and "as available" without warranties of any kind, express or implied',
            'We do not warrant that the platform will be uninterrupted, error-free, or free from security vulnerabilities',
            'ResolveHub is not responsible for any loss of data, revenue, profits, goodwill, or indirect, incidental, or consequential damages arising from your use of the platform',
            'Our total aggregate liability to you for any claims arising under these Terms shall not exceed the total fees paid by you to ResolveHub in the three months preceding the event giving rise to the claim',
            'We are not liable for any actions or omissions of third-party service providers, including payment processors and cloud infrastructure providers',
            'We are not liable for any loss resulting from unauthorized access to your account due to your failure to maintain adequate security practices',
          ]} />
          <p>
            Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability for incidental damages, so some of the above limitations may not apply to you.
          </p>
        </LegalSection>

        {/* ── 13. Service Availability ──────────────────────────────── */}
        <LegalSection id="service-availability" title="13. Service Availability & Maintenance">
          <p>
            ResolveHub strives to maintain high platform availability. However, we do not guarantee uninterrupted access to the platform at all times. Planned and unplanned maintenance windows, system updates, or force majeure events may cause temporary service interruptions.
          </p>
          <LegalList items={[
            'We aim to notify users at least 24 hours in advance of scheduled maintenance that may affect service availability',
            'Emergency maintenance may be performed without prior notice to protect platform security and stability',
            'Service interruptions caused by third-party infrastructure (cloud providers, CDNs, payment gateways) are outside our direct control',
            'ResolveHub will not provide service credit or refunds for downtime resulting from events beyond our reasonable control (force majeure)',
            'Users are encouraged to report outages or performance issues through our support channels',
          ]} />
        </LegalSection>

        {/* ── 14. Security Obligations ──────────────────────────────── */}
        <LegalSection id="security-obligations" title="14. Security Obligations">
          <p>
            As a user of the ResolveHub platform, you have security obligations that are critical to the protection of all data within the system:
          </p>
          <LegalList items={[
            'Use unique, strong passwords for your ResolveHub account and do not reuse passwords from other services',
            'Enable multi-factor authentication if available on your subscription plan',
            'Immediately revoke access for any staff member who leaves your organization or whose role no longer requires platform access',
            'Report any suspicious activity, unauthorized access attempts, or security vulnerabilities to security@getresolvehub.com immediately',
            'Ensure devices used to access ResolveHub are secured with up-to-date software and antivirus protection',
            'Do not access the platform on unsecured, public, or shared networks without VPN protection',
            'Never share session tokens, API keys, or authentication credentials with third parties',
          ]} />
        </LegalSection>

        {/* ── 15. Governing Law ─────────────────────────────────────── */}
        <LegalSection id="governing-law" title="15. Governing Law">
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the laws of the <strong>Republic of Ghana</strong>, without regard to its conflict of law principles.
          </p>
          <p>
            Any legal action or proceeding relating to your access to or use of the ResolveHub platform or these Terms shall be subject to the exclusive jurisdiction of the courts of Ghana, and you consent to the personal jurisdiction of those courts.
          </p>
          <p>
            For users located outside of Ghana, additional or alternative legal protections may apply in accordance with the laws of your country of residence. Nothing in these Terms limits your statutory rights as a consumer where applicable law provides protections that cannot be contractually waived.
          </p>
        </LegalSection>

        {/* ── 16. Dispute Resolution ────────────────────────────────── */}
        <LegalSection id="dispute-resolution" title="16. Dispute Resolution">
          <LegalSubSection title="16.1 Informal Resolution">
            <p>
              Before initiating formal legal proceedings, you agree to attempt to resolve any dispute with ResolveHub informally by contacting us at <a href="mailto:legal@getresolvehub.com">legal@getresolvehub.com</a> with a written description of the dispute, your preferred resolution, and your contact information. We will attempt to resolve the dispute informally within 30 days of receipt.
            </p>
          </LegalSubSection>
          <LegalSubSection title="16.2 Mediation">
            <p>
              If informal resolution fails, the parties agree to attempt to resolve the dispute through good-faith mediation before resorting to litigation. Mediation shall be conducted by a mutually agreed-upon mediator in Accra, Ghana.
            </p>
          </LegalSubSection>
          <LegalSubSection title="16.3 Litigation">
            <p>
              If mediation does not resolve the dispute within 60 days, either party may initiate formal legal proceedings in the courts of Ghana as specified in Section 15.
            </p>
          </LegalSubSection>
        </LegalSection>

        {/* ── 17. Changes to Terms ──────────────────────────────────── */}
        <LegalSection id="changes" title="17. Changes to These Terms">
          <p>
            ResolveHub reserves the right to amend these Terms at any time. Material changes will be communicated to registered account holders via email and through in-platform notifications at least 14 days before the effective date of the changes. Your continued use of the platform after the effective date of any amendment constitutes your acceptance of the revised Terms.
          </p>
          <p>
            If you do not agree to the revised Terms, you must discontinue use of the platform and may request account termination in accordance with Section 11.1.
          </p>
        </LegalSection>

        {/* ── 18. Contact ───────────────────────────────────────────── */}
        <LegalSection id="contact" title="18. Contact Us">
          <p>
            For questions about these Terms and Conditions, please contact our legal team. For general platform support, visit our support resources or contact our team through the platform.
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
