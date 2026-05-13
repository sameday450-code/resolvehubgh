/**
 * Email Templates for Billing Communication
 * Extends emailService.js with specialized templates for subscription and payment events
 */

// ─── Shared hero builder ─────────────────────────────────────────────────────
const buildHero = ({ gradient, iconSvg, title, subtitle }) => `
  <tr>
    <td style="background: ${gradient}; padding: 52px 40px 40px; text-align: center;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding-bottom: 20px;">
            <div style="width: 72px; height: 72px; margin: 0 auto; background-color: rgba(255,255,255,0.2); border-radius: 50%; line-height: 72px; text-align: center; border: 2px solid rgba(255,255,255,0.3);">
              ${iconSvg}
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0 0 10px; letter-spacing: -0.3px; line-height: 1.25; font-family: 'Inter', Arial, sans-serif;">
              ${title}
            </h1>
            <p style="color: rgba(255,255,255,0.88); font-size: 15px; margin: 0; line-height: 24px; font-weight: 400; font-family: 'Inter', Arial, sans-serif;">
              ${subtitle}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const ICONS = {
  sparkle: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-top:2px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  clock: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-top:2px;"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  alertCircle: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-top:2px;"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  checkCircle: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-top:2px;"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  xCircle: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-top:2px;"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  rocket: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-top:2px;"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bell: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;margin-top:2px;"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

// ─── CTA Button builder ───────────────────────────────────────────────────────
const ctaButton = (href, label, gradient = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', shadow = 'rgba(79, 70, 229, 0.35)') => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
    <tr>
      <td align="center">
        <a href="${href}" target="_blank" style="display: inline-block; background: ${gradient}; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 15px 44px; border-radius: 10px; box-shadow: 0 4px 14px ${shadow}; letter-spacing: 0.2px; font-family: 'Inter', Arial, sans-serif;">
          ${label}
        </a>
      </td>
    </tr>
  </table>
`;

// ─── Info box builder ─────────────────────────────────────────────────────────
const infoBox = (content, borderColor = '#4f46e5', bgColor = '#f8fafc') => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
    <tr>
      <td style="background-color: ${bgColor}; border-left: 3px solid ${borderColor}; border-radius: 0 8px 8px 0; padding: 16px 20px;">
        <p style="font-size: 13px; color: #374151; margin: 0; line-height: 22px; font-family: 'Inter', Arial, sans-serif;">${content}</p>
      </td>
    </tr>
  </table>
`;

// ─── Detail card row ──────────────────────────────────────────────────────────
const detailRow = (label, value, borderBottom = true) => `
  <tr>
    <td style="padding: ${borderBottom ? '0 0 16px' : '0'}; ${borderBottom ? 'border-bottom: 1px solid #e2e8f0;' : ''} padding-bottom: ${borderBottom ? '16px' : '0'};">
      <p style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.6px; margin: 0 0 5px; font-family: 'Inter', Arial, sans-serif;">${label}</p>
      <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin: 0; font-family: 'Inter', Arial, sans-serif;">${value}</p>
    </td>
  </tr>
  ${borderBottom ? '<tr><td style="height: 16px;"></td></tr>' : ''}
`;

// ─── Trial Started Template ─────────────────────────────────────────────────
const trialStartedTemplate = ({ companyName, planType, daysRemaining = 14, trialEndsAt, dashboardUrl, frontendUrl = 'http://localhost:5173' }) => `
  ${buildHero({
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    iconSvg: ICONS.sparkle,
    title: 'Your Free Trial is Now Active',
    subtitle: `${daysRemaining} days of full platform access — no credit card required`,
  })}
  <tr>
    <td style="padding: 40px 40px 36px;">
      <p style="font-size: 16px; color: #0f172a; line-height: 28px; margin: 0 0 16px; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
        Hi <strong>${companyName}</strong>,
      </p>
      <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 28px; font-family: 'Inter', Arial, sans-serif;">
        Your ${daysRemaining}-day free trial of ResolveHub is active and ready to use. Explore every feature with no restrictions — we're excited to have you on board.
      </p>

      <!-- Feature list -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 0 0 28px;">
        <tr>
          <td style="padding: 24px 28px;">
            <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.6px; margin: 0 0 16px; font-family: 'Inter', Arial, sans-serif;">What's included in your trial</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${[
                'Unlimited complaint management',
                'QR code generation and tracking',
                'Multi-branch support (up to 5 branches)',
                'Real-time analytics dashboard',
                'Email support',
              ].map(f => `
              <tr>
                <td style="padding: 6px 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 24px; vertical-align: top; padding-top: 1px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </td>
                      <td style="font-size: 14px; color: #374151; font-family: 'Inter', Arial, sans-serif; line-height: 22px;">${f}</td>
                    </tr>
                  </table>
                </td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>
      </table>

      ${infoBox(
        `<strong style="color: #4f46e5;">Trial Expires:</strong> ${new Date(trialEndsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} &mdash; No credit card required. Upgrade anytime to keep your data after the trial ends.`
      )}

      ${ctaButton(dashboardUrl, 'Get Started &rarr;', 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 'rgba(79, 70, 229, 0.35)')}

      <p style="font-size: 13px; color: #94a3b8; line-height: 22px; margin: 0; font-family: 'Inter', Arial, sans-serif;">
        Questions? Email us at <a href="mailto:support@resolvehub.com" style="color: #4f46e5; font-weight: 500; text-decoration: none;">support@resolvehub.com</a> — we're happy to help.
      </p>
    </td>
  </tr>
`;

// ─── Trial Reminder Template (7/3/1 days) ──────────────────────────────────
const trialReminderTemplate = ({ companyName, daysRemaining, trialEndsAt, dashboardUrl, urgency = 'normal' }) => {
  const urgencyConfig = daysRemaining === 1
    ? { gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', color: '#dc2626', bg: '#fef2f2', border: '#dc2626', shadow: 'rgba(220, 38, 38, 0.35)' }
    : daysRemaining === 3
    ? { gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', color: '#d97706', bg: '#fffbeb', border: '#d97706', shadow: 'rgba(217, 119, 6, 0.35)' }
    : { gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#4f46e5', bg: '#f8fafc', border: '#4f46e5', shadow: 'rgba(79, 70, 229, 0.35)' };

  const urgencyText = daysRemaining === 1 ? 'Your Trial Expires Tomorrow' : `${daysRemaining} Days Left on Your Trial`;

  return `
  ${buildHero({
    gradient: urgencyConfig.gradient,
    iconSvg: ICONS.clock,
    title: urgencyText,
    subtitle: "Don't lose access to your data and features",
  })}
  <tr>
    <td style="padding: 40px 40px 36px;">
      <p style="font-size: 16px; color: #0f172a; line-height: 28px; margin: 0 0 16px; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
        Hi <strong>${companyName}</strong>,
      </p>
      <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 16px; font-family: 'Inter', Arial, sans-serif;">
        Your trial expires on <strong style="color: ${urgencyConfig.color};">${new Date(trialEndsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
        ${daysRemaining === 1 ? ' After your trial ends, you will lose access to all data and features.' : ' Upgrade now to continue using ResolveHub and keep all your data intact.'}
      </p>

      <!-- Why Upgrade -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${urgencyConfig.bg}; border: 1px solid #e2e8f0; border-radius: 12px; margin: 0 0 28px;">
        <tr>
          <td style="padding: 24px 28px;">
            <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.6px; margin: 0 0 16px; font-family: 'Inter', Arial, sans-serif;">Why upgrade?</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${[
                'Keep all your complaint data and history',
                'Unlimited branches and QR codes',
                'Advanced analytics and reporting',
                'Priority email support',
              ].map(f => `
              <tr>
                <td style="padding: 6px 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 24px; vertical-align: top; padding-top: 1px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="${urgencyConfig.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </td>
                      <td style="font-size: 14px; color: #374151; font-family: 'Inter', Arial, sans-serif; line-height: 22px;">${f}</td>
                    </tr>
                  </table>
                </td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>
      </table>

      ${ctaButton(`${dashboardUrl}/company/billing`, 'Upgrade Now &rarr;', urgencyConfig.gradient, urgencyConfig.shadow)}

      <p style="font-size: 13px; color: #94a3b8; line-height: 22px; margin: 0; font-family: 'Inter', Arial, sans-serif;">
        Need a custom plan? Contact us at <a href="mailto:sales@resolvehub.com" style="color: ${urgencyConfig.color}; font-weight: 500; text-decoration: none;">sales@resolvehub.com</a>
      </p>
    </td>
  </tr>
`;
};

// ─── Trial Expired Template ─────────────────────────────────────────────────
const trialExpiredTemplate = ({ companyName, dashboardUrl }) => `
  ${buildHero({
    gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    iconSvg: ICONS.alertCircle,
    title: 'Your Trial Has Ended',
    subtitle: 'Upgrade to continue using ResolveHub',
  })}
  <tr>
    <td style="padding: 40px 40px 36px;">
      <p style="font-size: 16px; color: #0f172a; line-height: 28px; margin: 0 0 16px; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
        Hi <strong>${companyName}</strong>,
      </p>
      <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 28px; font-family: 'Inter', Arial, sans-serif;">
        Your 14-day free trial has ended. Your account is now in read-only mode. To continue creating complaints and generating QR codes, please upgrade to a paid plan.
      </p>

      ${infoBox(
        '<strong style="color: #059669;">Your Data is Safe.</strong> All your historical data is preserved and available for viewing. Full access is restored immediately upon upgrading.',
        '#059669',
        '#f0fdf4'
      )}

      ${ctaButton(`${dashboardUrl}/company/billing`, 'View Plans &amp; Upgrade &rarr;', 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 'rgba(79, 70, 229, 0.35)')}

      <p style="font-size: 13px; color: #94a3b8; line-height: 22px; margin: 0; font-family: 'Inter', Arial, sans-serif;">
        Not sure which plan is right for you? <a href="mailto:sales@resolvehub.com" style="color: #4f46e5; font-weight: 500; text-decoration: none;">Talk to our sales team</a>
      </p>
    </td>
  </tr>
`;

// ─── Payment Success Template ───────────────────────────────────────────────
const paymentSuccessTemplate = ({ companyName, planName, amount, currency = '₵', invoiceUrl, billingDate, nextBillingDate }) => `
  ${buildHero({
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    iconSvg: ICONS.checkCircle,
    title: 'Payment Confirmed',
    subtitle: 'Thank you — your subscription is now active',
  })}
  <tr>
    <td style="padding: 40px 40px 36px;">
      <p style="font-size: 16px; color: #0f172a; line-height: 28px; margin: 0 0 16px; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
        Hi <strong>${companyName}</strong>,
      </p>
      <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 28px; font-family: 'Inter', Arial, sans-serif;">
        Your payment has been processed successfully. You now have full access to all ResolveHub features.
      </p>

      <!-- Payment Details Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 0 0 28px;">
        <tr>
          <td style="padding: 24px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${detailRow('Plan', planName)}
              ${detailRow('Amount', `<span style="color:#059669;">${currency}${amount}</span>`)}
              ${detailRow('Billing Date', new Date(billingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}
              ${detailRow('Next Billing Date', new Date(nextBillingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), false)}
            </table>
          </td>
        </tr>
      </table>

      <!-- View Invoice -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
        <tr>
          <td align="center">
            <a href="${invoiceUrl}" target="_blank" style="display: inline-block; background-color: #f1f5f9; color: #059669; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; border: 1px solid #bbf7d0; font-family: 'Inter', Arial, sans-serif;">
              Download Invoice
            </a>
          </td>
        </tr>
      </table>

      ${infoBox(
        'You can manage your subscription and update your billing information anytime from your account settings.',
        '#059669',
        '#f0fdf4'
      )}
    </td>
  </tr>
`;

// ─── Payment Failed Template ────────────────────────────────────────────────
const paymentFailedTemplate = ({ companyName, planName, amount, currency = '₵', reason, retryUrl }) => `
  ${buildHero({
    gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    iconSvg: ICONS.xCircle,
    title: 'Payment Failed',
    subtitle: "We couldn't process your payment",
  })}
  <tr>
    <td style="padding: 40px 40px 36px;">
      <p style="font-size: 16px; color: #0f172a; line-height: 28px; margin: 0 0 16px; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
        Hi <strong>${companyName}</strong>,
      </p>
      <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 28px; font-family: 'Inter', Arial, sans-serif;">
        We weren't able to process your payment. ${reason || 'Please update your payment method and try again.'}
      </p>

      <!-- Payment Details -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; margin: 0 0 28px;">
        <tr>
          <td style="padding: 24px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${detailRow('Plan', planName)}
              ${detailRow('Amount', `<span style="color:#dc2626;">${currency}${amount}</span>`)}
              ${detailRow('Status', '<span style="color:#dc2626;font-weight:600;">Failed</span>', false)}
            </table>
          </td>
        </tr>
      </table>

      <!-- Steps to resolve -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 0 0 28px;">
        <tr>
          <td style="padding: 24px 28px;">
            <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.6px; margin: 0 0 16px; font-family: 'Inter', Arial, sans-serif;">Steps to resolve</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${[
                'Verify your card details are correct',
                'Ensure you have sufficient funds',
                'Try a different payment method',
                'Contact your bank if the issue persists',
              ].map((step, i) => `
              <tr>
                <td style="padding: 6px 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 28px; vertical-align: top;">
                        <span style="display: inline-block; width: 20px; height: 20px; background-color: #e2e8f0; border-radius: 50%; text-align: center; line-height: 20px; font-size: 11px; font-weight: 700; color: #6b7280; font-family: 'Inter', Arial, sans-serif;">${i + 1}</span>
                      </td>
                      <td style="font-size: 14px; color: #374151; font-family: 'Inter', Arial, sans-serif; line-height: 22px; vertical-align: top; padding-top: 1px;">${step}</td>
                    </tr>
                  </table>
                </td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>
      </table>

      ${ctaButton(retryUrl, 'Retry Payment &rarr;', 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', 'rgba(220, 38, 38, 0.35)')}

      <p style="font-size: 13px; color: #94a3b8; line-height: 22px; margin: 0; font-family: 'Inter', Arial, sans-serif;">
        Still having issues? Contact us at <a href="mailto:support@resolvehub.com" style="color: #dc2626; font-weight: 500; text-decoration: none;">support@resolvehub.com</a>
      </p>
    </td>
  </tr>
`;

// ─── Enterprise Activation Template ─────────────────────────────────────────
const enterpriseActivationTemplate = ({ companyName, contactPerson, planDetails, activationUrl, supportEmail }) => `
  ${buildHero({
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    iconSvg: ICONS.rocket,
    title: 'Welcome to Enterprise',
    subtitle: 'Your custom plan is now active',
  })}
  <tr>
    <td style="padding: 40px 40px 36px;">
      <p style="font-size: 16px; color: #0f172a; line-height: 28px; margin: 0 0 16px; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
        Hi <strong>${contactPerson || companyName}</strong>,
      </p>
      <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 28px; font-family: 'Inter', Arial, sans-serif;">
        Congratulations! Your custom enterprise plan for <strong style="color: #0f172a;">${companyName}</strong> is now live. We're excited to partner with you in streamlining complaint management across your organization.
      </p>

      <!-- Features included -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; margin: 0 0 28px;">
        <tr>
          <td style="padding: 24px 28px;">
            <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.6px; margin: 0 0 16px; font-family: 'Inter', Arial, sans-serif;">Your plan includes</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${[
                'Unlimited branches and team members',
                'Advanced analytics and custom reporting',
                'API access for integrations',
                'Dedicated support channel',
                'Custom training and onboarding',
              ].map(f => `
              <tr>
                <td style="padding: 6px 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 24px; vertical-align: top; padding-top: 1px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </td>
                      <td style="font-size: 14px; color: #374151; font-family: 'Inter', Arial, sans-serif; line-height: 22px;">${f}</td>
                    </tr>
                  </table>
                </td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>
      </table>

      <!-- Next Steps -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; margin: 0 0 28px;">
        <tr>
          <td style="padding: 24px 28px;">
            <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.6px; margin: 0 0 16px; font-family: 'Inter', Arial, sans-serif;">Next steps</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${[
                'Set up your team members and branches',
                'Configure your complaint categories',
                'Generate your first QR codes',
                'Schedule your onboarding call with our team',
              ].map((step, i) => `
              <tr>
                <td style="padding: 6px 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 28px; vertical-align: top;">
                        <span style="display: inline-block; width: 20px; height: 20px; background-color: #fde68a; border-radius: 50%; text-align: center; line-height: 20px; font-size: 11px; font-weight: 700; color: #92400e; font-family: 'Inter', Arial, sans-serif;">${i + 1}</span>
                      </td>
                      <td style="font-size: 14px; color: #374151; font-family: 'Inter', Arial, sans-serif; line-height: 22px; vertical-align: top; padding-top: 1px;">${step}</td>
                    </tr>
                  </table>
                </td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>
      </table>

      ${ctaButton(activationUrl, 'Get Started &rarr;', 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', 'rgba(124, 58, 237, 0.35)')}

      <p style="font-size: 13px; color: #94a3b8; line-height: 22px; margin: 0; font-family: 'Inter', Arial, sans-serif;">
        Your dedicated support representative is ready to help. Reach out anytime at <a href="mailto:${supportEmail}" style="color: #7c3aed; font-weight: 500; text-decoration: none;">${supportEmail}</a>
      </p>
    </td>
  </tr>
`;

// ─── Super Admin Alert Templates ────────────────────────────────────────────

// Super admin notification for new enterprise signup
const newEnterpriseSignupAlert = ({ companyName, contactPerson, contactEmail, contactPhone, industry, branches, users, requirements, salesInquiryUrl }) => `
  ${buildHero({
    gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    iconSvg: ICONS.bell,
    title: 'New Enterprise Inquiry',
    subtitle: `Custom plan request from ${companyName}`,
  })}
  <tr>
    <td style="padding: 40px 40px 36px;">
      <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 28px; font-family: 'Inter', Arial, sans-serif;">
        A new enterprise inquiry has been received and requires your attention.
      </p>

      <!-- Company Details Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; margin: 0 0 28px;">
        <tr>
          <td style="padding: 24px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${detailRow('Company', companyName)}
              ${detailRow('Contact Person', `${contactPerson} &mdash; <a href="mailto:${contactEmail}" style="color: #2563eb; text-decoration: none;">${contactEmail}</a>${contactPhone ? ` &mdash; ${contactPhone}` : ''}`)}
              ${detailRow('Industry', industry || 'Not specified')}
              ${detailRow('Scale', `${branches || 'N/A'} branches, ${users || 'N/A'} users estimated`, false)}
            </table>
          </td>
        </tr>
      </table>

      ${requirements ? infoBox(`<strong style="color: #2563eb;">Requirements:</strong> ${requirements}`, '#2563eb', '#eff6ff') : ''}

      ${ctaButton(salesInquiryUrl, 'Review Inquiry &rarr;', 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', 'rgba(37, 99, 235, 0.35)')}
    </td>
  </tr>
`;

module.exports = {
  trialStartedTemplate,
  trialReminderTemplate,
  trialExpiredTemplate,
  paymentSuccessTemplate,
  paymentFailedTemplate,
  enterpriseActivationTemplate,
  newEnterpriseSignupAlert,
};
