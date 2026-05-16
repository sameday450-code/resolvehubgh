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
  { id: 'subscription-billing', label: 'Subscription Billing' },
  { id: 'manual-payments', label: 'Manual Payment Policy' },
  { id: 'refund-eligibility', label: 'Refund Eligibility' },
  { id: 'non-refundable', label: 'Non-Refundable Situations' },
  { id: 'trial-periods', label: 'Trial Periods' },
  { id: 'subscription-activation', label: 'Subscription Activation' },
  { id: 'failed-payments', label: 'Failed Payments' },
  { id: 'fraud-protection', label: 'Fraud Protection' },
  { id: 'service-suspension', label: 'Service Suspension Cases' },
  { id: 'refund-process', label: 'How to Request a Refund' },
  { id: 'processing-time', label: 'Refund Processing Time' },
  { id: 'contact', label: 'Contact Us' },
];

export default function RefundPolicyPage() {
  return (
    <>
      <SEO
        title="Refund Policy | ResolveHub"
        description="ResolveHub's Refund Policy covers subscription billing, refund eligibility, manual payment handling, trial periods, and how to request a refund."
        keywords="ResolveHub refund policy, SaaS subscription refund, billing policy, complaint management platform billing"
        canonical="https://getresolvehub.com/refunds"
      />
      <LegalPageLayout
        title="Refund Policy"
        description="This Refund Policy explains ResolveHub's billing practices, refund eligibility criteria, and the procedures for requesting a refund. We are committed to transparency and fairness in all billing matters."
        lastUpdated="May 16, 2026"
        effectiveDate="May 16, 2026"
        sections={SECTIONS}
      >
        {/* ── 1. Overview ─────────────────────────────────────────────── */}
        <LegalSection id="overview" title="1. Overview">
          <p>
            ResolveHub provides a cloud-based complaint management platform on a subscription basis. We believe in transparent, fair billing and are committed to addressing refund requests in a timely and professional manner.
          </p>
          <p>
            This policy applies to all subscription plans, manual payment arrangements, and any other financial transactions conducted through or in connection with the ResolveHub platform.
          </p>
          <LegalCallout variant="info" title="Contact Us First">
            Before requesting a refund, we encourage you to contact our support team. Many billing concerns can be resolved quickly through account adjustments, service credits, or direct assistance without requiring a formal refund.
          </LegalCallout>
        </LegalSection>

        {/* ── 2. Subscription Billing ───────────────────────────────── */}
        <LegalSection id="subscription-billing" title="2. Subscription Billing">
          <LegalSubSection title="2.1 Billing Cycles">
            <p>
              ResolveHub subscriptions are billed on either a monthly or annual basis, depending on the plan selected during registration or renewal:
            </p>
            <LegalList items={[
              'Monthly subscriptions are billed at the start of each calendar month',
              'Annual subscriptions are billed as a lump sum at the start of each subscription year',
              'Subscription fees are non-prorated by default unless explicitly agreed upon in writing',
              'Billing is processed automatically on the renewal date for active subscriptions',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="2.2 Auto-Renewal">
            <p>
              All ResolveHub subscriptions auto-renew at the end of each billing period unless cancelled before the renewal date. You will receive an advance billing reminder at least 3 days before your renewal date. It is your responsibility to cancel before the renewal date if you do not wish to continue.
            </p>
          </LegalSubSection>
          <LegalSubSection title="2.3 Plan Changes">
            <p>
              Subscription plan upgrades take effect immediately and are billed at the prorated difference for the remaining period. Downgrades take effect at the start of the next billing period.
            </p>
          </LegalSubSection>
        </LegalSection>

        {/* ── 3. Manual Payment Policy ──────────────────────────────── */}
        <LegalSection id="manual-payments" title="3. Manual Payment Policy">
          <p>
            ResolveHub accepts manual payments (bank transfers, mobile money, and other offline payment methods) for customers who are unable to use automated payment methods. Manual payments are subject to the following policy:
          </p>
          <LegalList items={[
            'Manual payment requests must be submitted through the designated billing or payment request process within the platform or by contacting our finance team',
            'Platform access is granted only after payment is received and manually verified by ResolveHub\'s finance team',
            'Manual payments must match the exact subscription amount specified in your payment invoice',
            'ResolveHub is not responsible for delays in activation caused by incorrect payment amounts, missing references, or bank processing times',
            'Payment confirmation typically takes 1–3 business days from receipt of cleared funds',
            'All manual payments must include a valid subscription reference number to ensure correct account crediting',
            'Overpayments will be credited to your account balance for use toward future invoices; they are not automatically refunded',
          ]} />
          <LegalCallout variant="warning" title="Payment Reference Required">
            Always include your ResolveHub account reference number when making a manual payment. Payments without a reference number may experience delays in processing and account activation.
          </LegalCallout>
        </LegalSection>

        {/* ── 4. Refund Eligibility ─────────────────────────────────── */}
        <LegalSection id="refund-eligibility" title="4. Refund Eligibility">
          <p>
            ResolveHub will consider refund requests in the following circumstances:
          </p>
          <LegalSubSection title="4.1 Eligible Refund Scenarios">
            <LegalList items={[
              'Duplicate payment: A billing error resulted in you being charged more than once for the same subscription period',
              'Technical platform failure: ResolveHub experienced a significant, verifiable platform outage (exceeding 72 consecutive hours) that prevented you from using the service, and we were unable to restore access or offer an equivalent service credit',
              'Unauthorized charge: A subscription was charged without your explicit authorization due to a documented billing error on ResolveHub\'s part',
              'Overpayment: You paid an amount in excess of the applicable subscription fee for your plan',
              'Service not delivered: You were charged for a subscription plan whose features were materially different from what was described at the time of purchase, and we cannot resolve the discrepancy',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="4.2 Refund Request Window">
            <p>
              All refund requests must be submitted within <strong>14 calendar days</strong> of the charge date. Requests received after this window will generally not be eligible for a refund unless exceptional circumstances apply and are approved at ResolveHub's sole discretion.
            </p>
          </LegalSubSection>
        </LegalSection>

        {/* ── 5. Non-Refundable Situations ──────────────────────────── */}
        <LegalSection id="non-refundable" title="5. Non-Refundable Situations">
          <p>
            The following situations are explicitly <strong>not eligible</strong> for refunds:
          </p>
          <LegalList items={[
            'Change of mind after subscription activation — subscriptions are considered used upon activation',
            'Partial use of a subscription period — fees are not prorated for the unused portion of a monthly or annual term',
            'Failure to cancel before the auto-renewal date — it is the subscriber\'s responsibility to cancel before the renewal date',
            'Lack of use of the platform — paying for but not actively using your subscription does not constitute grounds for a refund',
            'Account suspension due to violation of Terms and Conditions',
            'Account termination initiated by ResolveHub due to fraudulent activity, abuse, or repeated policy violations',
            'Subscription fees charged for the period during which a free trial was in effect but subsequently converted to a paid plan as agreed',
            'Fees paid for add-on features, one-time services, or custom enterprise agreements unless otherwise stated in writing',
            'Refund requests based on dissatisfaction with features that were accurately described at the time of subscription',
            'Requests submitted more than 14 days after the charge date without exceptional circumstances',
          ]} />
        </LegalSection>

        {/* ── 6. Trial Periods ──────────────────────────────────────── */}
        <LegalSection id="trial-periods" title="6. Trial Periods">
          <p>
            ResolveHub may offer free trial periods for new accounts. The following terms apply to trial periods:
          </p>
          <LegalList items={[
            'Free trials do not require payment and therefore no refund is applicable to the trial period itself',
            'If a paid subscription begins immediately following a trial, the first paid billing period is subject to the standard 14-day refund eligibility window described in Section 4',
            'Users who were not informed that their trial would auto-convert to a paid subscription may request a full refund of the first subscription charge within 7 days of the charge, provided they have not materially used the paid features',
            'One trial per business entity — attempting to obtain multiple trials through new account registrations may result in account termination and disqualification from refund consideration',
          ]} />
        </LegalSection>

        {/* ── 7. Subscription Activation ────────────────────────────── */}
        <LegalSection id="subscription-activation" title="7. Subscription Activation">
          <p>
            For subscription activation that is conditional on manual payment verification or administrator approval, the following refund provisions apply:
          </p>
          <LegalList items={[
            'If your manual payment is received and verified but your account is not activated within 5 business days without a valid reason, you are entitled to a full refund of the payment made',
            'If your subscription activation requires approval (e.g., enterprise or custom plan accounts) and the application is declined, a full refund of any fees paid will be issued within 5 business days',
            'If you cancel your subscription request before activation is complete and before platform access is granted, a full refund will be issued',
            'Once platform access is granted and the account is activated, the subscription is considered active and the standard non-refundable policy applies',
          ]} />
        </LegalSection>

        {/* ── 8. Failed Payments ────────────────────────────────────── */}
        <LegalSection id="failed-payments" title="8. Failed Payments">
          <p>
            In the event of a failed payment (e.g., card decline, insufficient funds, or bank error):
          </p>
          <LegalList items={[
            'ResolveHub will notify you immediately via email and in-platform notification when a payment fails',
            'You will have a 7-day grace period from the payment failure date to update your payment details and complete the payment',
            'During the grace period, platform access may be restricted to read-only mode or limited features',
            'If payment is not received within the grace period, the subscription will be suspended',
            'You will not be charged additional fees solely for a failed payment, but your subscription renewal will be delayed until payment is received',
            'Reinstating a suspended account may require payment of outstanding balances',
            'No refund is applicable for periods of restricted access caused by a failed payment that was within your control to resolve',
          ]} />
        </LegalSection>

        {/* ── 9. Fraud Protection ───────────────────────────────────── */}
        <LegalSection id="fraud-protection" title="9. Fraud Protection">
          <p>
            ResolveHub takes payment fraud seriously and has implemented measures to protect our platform and customers:
          </p>
          <LegalList items={[
            'All payment transactions are monitored for suspicious activity',
            'Accounts suspected of fraudulent payment activity may be immediately suspended pending investigation',
            'ResolveHub reserves the right to reverse subscription activations in cases of confirmed payment fraud',
            'In confirmed fraud cases, no refund will be issued, and relevant information may be reported to payment processors and law enforcement',
            'Chargebacks initiated fraudulently (i.e., where service was legitimately delivered) will be disputed by ResolveHub',
            'Customers who initiate a chargeback without first attempting to resolve the issue with ResolveHub may have their accounts permanently suspended',
          ]} />
          <LegalCallout variant="danger" title="Chargeback Policy">
            Initiating a chargeback without first contacting ResolveHub is a breach of these Terms. Please contact us at billing@getresolvehub.com to resolve billing disputes before escalating to your payment provider.
          </LegalCallout>
        </LegalSection>

        {/* ── 10. Service Suspension Cases ──────────────────────────── */}
        <LegalSection id="service-suspension" title="10. Service Suspension & Refunds">
          <p>
            In cases where ResolveHub suspends your account, refund eligibility depends on the reason for suspension:
          </p>
          <LegalSubSection title="10.1 Suspension for Policy Violations (No Refund)">
            <p>
              If your account is suspended due to violation of our Terms and Conditions, the following applies:
            </p>
            <LegalList items={[
              'No refund will be issued for any unused portion of your subscription period',
              'Subscription fees paid are forfeited as compensation for the damages and costs incurred by the violation',
              'Data export may be restricted depending on the severity of the violation',
            ]} />
          </LegalSubSection>
          <LegalSubSection title="10.2 Suspension Due to Non-Payment (No Refund)">
            <p>
              If your account is suspended due to non-payment, no refund applies to prior paid periods. Reinstatement requires payment of all outstanding balances.
            </p>
          </LegalSubSection>
          <LegalSubSection title="10.3 Suspension Due to ResolveHub Error (Refund Eligible)">
            <p>
              If your account is incorrectly suspended due to an error on ResolveHub's part (e.g., erroneous billing system failure), you are entitled to:
            </p>
            <LegalList items={[
              'Immediate reinstatement of your account upon identification of the error',
              'A prorated credit or refund for the period of unjustified suspension',
              'An apology and documented explanation of the error',
            ]} />
          </LegalSubSection>
        </LegalSection>

        {/* ── 11. How to Request a Refund ───────────────────────────── */}
        <LegalSection id="refund-process" title="11. How to Request a Refund">
          <p>
            To request a refund from ResolveHub, please follow these steps:
          </p>
          <LegalList items={[
            'Step 1 — Contact our billing team at billing@getresolvehub.com with the subject line "Refund Request"',
            'Step 2 — Include your company name, registered email address, and subscription account reference number',
            'Step 3 — Describe the reason for your refund request clearly and include any supporting documentation (e.g., payment receipts, error screenshots)',
            'Step 4 — Our billing team will acknowledge your request within 2 business days',
            'Step 5 — We will investigate the request and communicate our decision within 7 business days',
            'Step 6 — If approved, refunds will be processed to your original payment method within the timeline described in Section 12',
          ]} />
          <LegalCallout variant="info" title="Faster Resolution">
            For the fastest resolution, always include your payment reference number, the date of the charge in question, and the amount charged. Incomplete requests may take longer to process.
          </LegalCallout>
        </LegalSection>

        {/* ── 12. Refund Processing Time ────────────────────────────── */}
        <LegalSection id="processing-time" title="12. Refund Processing Time">
          <p>
            Once a refund is approved, the time to receive your funds depends on your payment method:
          </p>
          <LegalList items={[
            'Credit/Debit Card: 5–10 business days, depending on your bank or card issuer',
            'Mobile Money: 1–3 business days',
            'Bank Transfer: 3–7 business days, depending on the receiving bank',
            'ResolveHub Platform Credit: Immediately applied to your account balance upon approval',
          ]} />
          <p>
            ResolveHub will send email confirmation when a refund is initiated. If you have not received your refund within the stated timeframe, please contact us at <a href="mailto:billing@getresolvehub.com">billing@getresolvehub.com</a> and we will investigate with the payment processor.
          </p>
        </LegalSection>

        {/* ── 13. Contact ───────────────────────────────────────────── */}
        <LegalSection id="contact" title="13. Contact Us">
          <p>
            For all billing and refund inquiries, please contact our dedicated billing team:
          </p>
        </LegalSection>

        <LegalContactCard
          email="billing@getresolvehub.com"
          address="ResolveHub · getresolvehub.com · Accra, Ghana"
        />
      </LegalPageLayout>
    </>
  );
}
