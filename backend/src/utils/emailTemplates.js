/**
 * Email Templates for Billing Communication
 * Extends emailService.js with specialized templates for subscription and payment events
 */

const baseLayout = require('./emailService').baseLayout || ((content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>${content}</body>
</html>
`);

// ─── Trial Started Template ─────────────────────────────────────────────────
const trialStartedTemplate = ({ companyName, planType, daysRemaining = 14, trialEndsAt, dashboardUrl, frontendUrl = 'http://localhost:5173' }) => `
  <tr>
    <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 48px 40px 36px; text-align: center; border-bottom: 4px solid #7c3aed;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding-bottom: 16px;">
            <div style="width: 80px; height: 80px; margin: 0 auto; background-color: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">
              🎉
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">
              Welcome to Your Free Trial!
            </h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0; line-height: 24px; font-weight: 500;">
              ${daysRemaining} days of full access to ResolveHub
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 40px 40px;">
      <p style="font-size: 16px; color: #1f2937; line-height: 26px; margin: 0 0 24px; font-weight: 500;">
        Hi <strong>${companyName}</strong>,
      </p>
      <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 0 0 24px;">
        Your ${daysRemaining}-day free trial of ResolveHub is now active! You have full access to all features including:
      </p>

      <ul style="font-size: 15px; color: #4b5563; line-height: 24px; margin: 0 0 28px; padding-left: 20px;">
        <li style="margin-bottom: 10px;">✓ Unlimited complaint management</li>
        <li style="margin-bottom: 10px;">✓ QR code generation and tracking</li>
        <li style="margin-bottom: 10px;">✓ Multi-branch support (up to 5 branches)</li>
        <li style="margin-bottom: 10px;">✓ Real-time analytics dashboard</li>
        <li style="margin-bottom: 0;">✓ Email support</li>
      </ul>

      <!-- Trial Info Box -->
      <div style="background: linear-gradient(135deg, #f3f4f6 0%, #eff6ff 100%); border-left: 4px solid #6366f1; padding: 20px 24px; border-radius: 8px; margin: 28px 0;">
        <p style="font-size: 13px; color: #1f2937; margin: 0; line-height: 22px;">
          <strong style="color: #6366f1;">Trial Expires:</strong> ${new Date(trialEndsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p style="font-size: 13px; color: #4b5563; margin: 8px 0 0; line-height: 22px;">
          No credit card required. Upgrade to a paid plan anytime to keep your data after the trial ends.
        </p>
      </div>

      <!-- CTA Button -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
        <tr>
          <td align="center">
            <a href="${dashboardUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 12px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); letter-spacing: 0.3px;">
              Get Started →
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size: 14px; color: #4b5563; line-height: 24px; margin: 28px 0 0;">
        Questions? Contact our support team at <a href="mailto:support@resolvehub.com" style="color: #6366f1; font-weight: 600; text-decoration: none;">support@resolvehub.com</a>
      </p>
    </td>
  </tr>
`;

// ─── Trial Reminder Template (7/3/1 days) ──────────────────────────────────
const trialReminderTemplate = ({ companyName, daysRemaining, trialEndsAt, dashboardUrl, urgency = 'normal' }) => {
  const urgencyColor = daysRemaining === 1 ? '#dc2626' : daysRemaining === 3 ? '#f59e0b' : '#6366f1';
  const urgencyBgColor = daysRemaining === 1 ? '#dc2626' : daysRemaining === 3 ? '#f59e0b' : '#6366f1';
  const urgencyBorderColor = daysRemaining === 1 ? '#b91c1c' : daysRemaining === 3 ? '#b45309' : '#7c3aed';
  const urgencyIcon = daysRemaining === 1 ? '⏰' : daysRemaining === 3 ? '⚠️' : '👀';
  const urgencyText = daysRemaining === 1 ? 'Your Trial Expires TOMORROW' : `${daysRemaining} Days Left on Your Trial`;

  return `
  <tr>
    <td style="background: linear-gradient(135deg, ${urgencyBgColor} 0%, ${urgencyBgColor}dd 100%); padding: 48px 40px 36px; text-align: center; border-bottom: 4px solid ${urgencyBorderColor};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding-bottom: 16px;">
            <div style="width: 80px; height: 80px; margin: 0 auto; background-color: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">
              ${urgencyIcon}
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">
              ${urgencyText}
            </h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0; line-height: 24px; font-weight: 500;">
              Don't lose access to your data
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 40px 40px;">
      <p style="font-size: 16px; color: #1f2937; line-height: 26px; margin: 0 0 24px; font-weight: 500;">
        Hi <strong>${companyName}</strong>,
      </p>
      <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 0 0 12px;">
        Your trial expires on <strong style="color: ${urgencyColor};">${new Date(trialEndsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
      </p>

      ${daysRemaining === 1 ? `
        <p style="font-size: 15px; color: #dc2626; line-height: 26px; margin: 28px 0; font-weight: 600;">
          ⚠️ After your trial ends, you will lose access to all your data and features.
        </p>
      ` : `
        <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 28px 0;">
          Upgrade now to continue using ResolveHub and keep all your data intact.
        </p>
      `}

      <!-- Why Upgrade Section -->
      <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-left: 4px solid ${urgencyColor}; padding: 20px 24px; border-radius: 8px; margin: 28px 0;">
        <p style="font-size: 13px; color: #1f2937; margin: 0 0 12px; font-weight: 600; color: ${urgencyColor};">Why Upgrade?</p>
        <ul style="font-size: 14px; color: #4b5563; line-height: 22px; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">✓ Keep all your complaint data and history</li>
          <li style="margin-bottom: 8px;">✓ Unlimited branches and QR codes</li>
          <li style="margin-bottom: 8px;">✓ Advanced analytics and reporting</li>
          <li style="margin-bottom: 0;">✓ Priority email support</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
        <tr>
          <td align="center">
            <a href="${dashboardUrl}/company/billing" target="_blank" style="display: inline-block; background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor}dd 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(${urgencyColor === '#dc2626' ? '220,38,38' : urgencyColor === '#f59e0b' ? '245,158,11' : '99,102,241'}, 0.3);">
              Upgrade Now →
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size: 14px; color: #4b5563; line-height: 24px; margin: 28px 0 0;">
        Need a custom plan? Contact our sales team at <a href="mailto:sales@resolvehub.com" style="color: ${urgencyColor}; font-weight: 600; text-decoration: none;">sales@resolvehub.com</a>
      </p>
    </td>
  </tr>
`;
};

// ─── Trial Expired Template ─────────────────────────────────────────────────
const trialExpiredTemplate = ({ companyName, dashboardUrl }) => `
  <tr>
    <td style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 40px 40px 32px; text-align: center;">
      <div style="width: 64px; height: 64px; margin: 0 auto 16px; background-color: rgba(255,255,255,0.2); border-radius: 50%; line-height: 64px;">
        <span style="font-size: 32px;">⏱️</span>
      </div>
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">
        Your Trial Has Ended
      </h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 8px 0 0; line-height: 22px;">
        Upgrade to continue using ResolveHub
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 36px 40px;">
      <p style="font-size: 15px; color: #475569; line-height: 24px; margin: 0 0 16px;">
        Hi <strong>${companyName}</strong>,
      </p>
      <p style="font-size: 15px; color: #475569; line-height: 24px; margin: 0 0 24px;">
        Your 14-day free trial has ended. Your account is now in read-only mode. To continue using ResolveHub and creating new complaints and QR codes, please upgrade to a paid plan.
      </p>

      <!-- Important Info -->
      <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #dc2626; padding: 20px 24px; border-radius: 8px; margin: 28px 0;">
        <p style="font-size: 13px; color: #7f1d1d; margin: 0 0 8px; font-weight: 600;">📌 Your Data is Safe!</p>
        <p style="font-size: 14px; color: #4b5563; line-height: 24px; margin: 0;">
          All your historical data is preserved and available for viewing. Once you upgrade, you'll regain full access and can create new complaints and generate QR codes immediately.
        </p>
      </div>

      <!-- CTA Button -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
        <tr>
          <td align="center">
            <a href="${dashboardUrl}/company/billing" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);">
              View Plans & Upgrade →
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size: 14px; color: #4b5563; line-height: 24px; margin: 28px 0 0;">
        Not sure which plan is right for you? <a href="mailto:sales@resolvehub.com" style="color: #6366f1; font-weight: 600; text-decoration: none;">Talk to our sales team</a> or visit your <a href="${dashboardUrl}" style="color: #6366f1; font-weight: 600; text-decoration: none;">dashboard</a> for more options.
      </p>
    </td>
  </tr>
`;

// ─── Payment Success Template ───────────────────────────────────────────────
const paymentSuccessTemplate = ({ companyName, planName, amount, currency = '₵', invoiceUrl, billingDate, nextBillingDate }) => `
  <tr>
    <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 48px 40px 36px; text-align: center; border-bottom: 4px solid #047857;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding-bottom: 16px;">
            <div style="width: 80px; height: 80px; margin: 0 auto; background-color: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">
              ✓
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">
              Payment Received
            </h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0; line-height: 24px; font-weight: 500;">
              Thank you for your subscription
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 40px 40px;">
      <p style="font-size: 16px; color: #1f2937; line-height: 26px; margin: 0 0 24px; font-weight: 500;">
        Hi <strong>${companyName}</strong>,
      </p>

      <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 0 0 24px;">
        Your payment has been processed successfully. Your subscription is now active with full access to all features.
      </p>

      <!-- Payment Details Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 2px solid #bbf7d0; border-radius: 12px; overflow: hidden; margin: 28px 0;">
        <tr>
          <td style="padding: 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom: 16px;">
                  <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Plan</p>
                  <p style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0;">${planName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 16px;">
                  <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Amount</p>
                  <p style="font-size: 18px; font-weight: 700; color: #059669; margin: 0;">${currency}${amount}</p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 16px;">
                  <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Billing Date</p>
                  <p style="font-size: 14px; color: #4b5563; margin: 0;">${new Date(billingDate).toLocaleDateString()}</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Next Billing Date</p>
                  <p style="font-size: 14px; color: #4b5563; margin: 0;">${new Date(nextBillingDate).toLocaleDateString()}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- View Invoice Button -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
        <tr>
          <td align="center">
            <a href="${invoiceUrl}" target="_blank" style="display: inline-block; background: #f1f5f9; color: #059669; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; border: 2px solid #bbf7d0;">
              View Invoice
            </a>
          </td>
        </tr>
      </table>

      <div style="background: linear-gradient(135deg, #f3f4f6 0%, #eff6ff 100%); border-left: 4px solid #059669; padding: 20px 24px; border-radius: 8px; margin: 28px 0;">
        <p style="font-size: 13px; color: #1f2937; margin: 0; line-height: 22px;">
          You can manage your subscription and update your billing information anytime in your <a href="javascript:void(0);" style="color: #059669; font-weight: 600; text-decoration: none;">account settings</a>.
        </p>
      </div>
    </td>
  </tr>
`;

// ─── Payment Failed Template ────────────────────────────────────────────────
const paymentFailedTemplate = ({ companyName, planName, amount, currency = '₵', reason, retryUrl }) => `
  <tr>
    <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 48px 40px 36px; text-align: center; border-bottom: 4px solid #7f1d1d;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding-bottom: 16px;">
            <div style="width: 80px; height: 80px; margin: 0 auto; background-color: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">
              ⚠️
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">
              Payment Failed
            </h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0; line-height: 24px; font-weight: 500;">
              We couldn't process your payment
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 40px 40px;">
      <p style="font-size: 16px; color: #1f2937; line-height: 26px; margin: 0 0 24px; font-weight: 500;">
        Hi <strong>${companyName}</strong>,
      </p>

      <p style="font-size: 15px; color: #dc2626; line-height: 26px; margin: 0 0 24px; font-weight: 600;">
        ⚠️ We weren't able to process your payment. ${reason || 'Please update your payment method and try again.'}
      </p>

      <!-- Payment Details Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #fecaca; border-radius: 12px; overflow: hidden; margin: 28px 0;">
        <tr>
          <td style="padding: 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom: 16px;">
                  <p style="font-size: 12px; color: #7f1d1d; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Plan</p>
                  <p style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0;">${planName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 16px;">
                  <p style="font-size: 12px; color: #7f1d1d; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Amount</p>
                  <p style="font-size: 16px; font-weight: 700; color: #dc2626; margin: 0;">${currency}${amount}</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p style="font-size: 12px; color: #7f1d1d; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Status</p>
                  <p style="font-size: 14px; color: #dc2626; margin: 0; font-weight: 600;">Failed</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Troubleshooting Steps -->
      <div style="background: linear-gradient(135deg, #fef2f2 0%, #fef2f2 100%); border-left: 4px solid #dc2626; padding: 20px 24px; border-radius: 8px; margin: 28px 0;">
        <p style="font-size: 13px; color: #7f1d1d; margin: 0 0 12px; font-weight: 600;">🔧 What to do:</p>
        <ol style="font-size: 14px; color: #4b5563; line-height: 22px; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Check that your card details are correct</li>
          <li style="margin-bottom: 8px;">Ensure you have sufficient funds</li>
          <li style="margin-bottom: 8px;">Try a different payment method</li>
          <li style="margin-bottom: 0;">Contact your bank if the issue persists</li>
        </ol>
      </div>

      <!-- Retry Button -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
        <tr>
          <td align="center">
            <a href="${retryUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);">
              Retry Payment →
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size: 14px; color: #4b5563; line-height: 24px; margin: 28px 0 0;">
        If you continue to experience issues, contact our support team at <a href="mailto:support@resolvehub.com" style="color: #dc2626; font-weight: 600; text-decoration: none;">support@resolvehub.com</a>
      </p>
    </td>
  </tr>
`;

// ─── Enterprise Activation Template ─────────────────────────────────────────
const enterpriseActivationTemplate = ({ companyName, contactPerson, planDetails, activationUrl, supportEmail }) => `
  <tr>
    <td style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); padding: 48px 40px 36px; text-align: center; border-bottom: 4px solid #6d28d9;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding-bottom: 16px;">
            <div style="width: 80px; height: 80px; margin: 0 auto; background-color: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">
              🚀
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">
              Welcome to Enterprise
            </h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0; line-height: 24px; font-weight: 500;">
              Your custom plan is now active
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 40px 40px;">
      <p style="font-size: 16px; color: #1f2937; line-height: 26px; margin: 0 0 24px; font-weight: 500;">
        Hi <strong>${contactPerson || companyName}</strong>,
      </p>

      <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 0 0 24px;">
        Congratulations! Your custom ResolveHub enterprise plan is now active. We're excited to partner with <strong>${companyName}</strong> and look forward to helping you streamline complaint management across your organization.
      </p>

      <!-- Features Grid -->
      <div style="background: linear-gradient(135deg, #f3f4f6 0%, #eff6ff 100%); border-left: 4px solid #7c3aed; padding: 20px 24px; border-radius: 8px; margin: 28px 0;">
        <p style="font-size: 13px; color: #1f2937; margin: 0 0 12px; font-weight: 600; color: #7c3aed;">Your plan includes:</p>
        <ul style="font-size: 14px; color: #4b5563; line-height: 22px; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">✓ Unlimited branches and team members</li>
          <li style="margin-bottom: 8px;">✓ Advanced analytics and reporting</li>
          <li style="margin-bottom: 8px;">✓ API access for integrations</li>
          <li style="margin-bottom: 8px;">✓ Dedicated support channel</li>
          <li style="margin-bottom: 0;">✓ Custom training and onboarding</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
        <tr>
          <td align="center">
            <a href="${activationUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">
              Get Started →
            </a>
          </td>
        </tr>
      </table>

      <!-- Next Steps -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef08a 100%); border-left: 4px solid #eab308; padding: 20px 24px; border-radius: 8px; margin: 28px 0;">
        <p style="font-size: 13px; color: #78350f; margin: 0 0 12px; font-weight: 600;">📋 Next Steps:</p>
        <ol style="font-size: 14px; color: #4b5563; line-height: 22px; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Set up your team members and branches</li>
          <li style="margin-bottom: 8px;">Configure your complaint categories</li>
          <li style="margin-bottom: 8px;">Generate your first QR codes</li>
          <li style="margin-bottom: 0;">Schedule your onboarding call with our team</li>
        </ol>
      </div>

      <p style="font-size: 14px; color: #4b5563; line-height: 24px; margin: 28px 0 0;">
        Your dedicated support representative is ready to help. Reach out anytime at <a href="mailto:${supportEmail}" style="color: #7c3aed; font-weight: 600; text-decoration: none;">${supportEmail}</a>
      </p>
    </td>
  </tr>
`;

// ─── Super Admin Alert Templates ────────────────────────────────────────────

// Super admin notification for new enterprise signup
const newEnterpriseSignupAlert = ({ companyName, contactPerson, contactEmail, contactPhone, industry, branches, users, requirements, salesInquiryUrl }) => `
  <tr>
    <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 48px 40px 36px; text-align: center; border-bottom: 4px solid #1d4ed8;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding-bottom: 16px;">
            <div style="width: 80px; height: 80px; margin: 0 auto; background-color: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">
              📌
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">
              New Enterprise Inquiry
            </h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0; line-height: 24px; font-weight: 500;">
              Custom plan request from ${companyName}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 40px 40px;">
      <p style="font-size: 15px; color: #4b5563; line-height: 24px; margin: 0 0 24px;">
        New custom plan inquiry received:
      </p>

      <!-- Company Details Card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #bae6fd; border-radius: 12px; overflow: hidden; margin: 28px 0;">
        <tr>
          <td style="padding: 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom: 16px;">
                  <p style="font-size: 12px; color: #0c4a6e; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Company</p>
                  <p style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0;">${companyName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 16px;">
                  <p style="font-size: 12px; color: #0c4a6e; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Contact Person</p>
                  <p style="font-size: 14px; color: #4b5563; margin: 0;">${contactPerson} | <a href="mailto:${contactEmail}" style="color: #2563eb; font-weight: 600; text-decoration: none;">${contactEmail}</a></p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 16px;">
                  <p style="font-size: 12px; color: #0c4a6e; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Industry</p>
                  <p style="font-size: 14px; color: #4b5563; margin: 0;">${industry}</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p style="font-size: 12px; color: #0c4a6e; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Scale</p>
                  <p style="font-size: 14px; color: #4b5563; margin: 0;">${branches} branches, ${users} users estimated</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <div style="background: linear-gradient(135deg, #f3f4f6 0%, #eff6ff 100%); border-left: 4px solid #3b82f6; padding: 20px 24px; border-radius: 8px; margin: 28px 0;">
        <p style="font-size: 13px; color: #1f2937; margin: 0 0 8px; font-weight: 600;">Requirements:</p>
        <p style="font-size: 14px; color: #4b5563; line-height: 24px; margin: 0;">
          ${requirements || 'No specific requirements provided'}
        </p>
      </div>

      <!-- Review Button -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
        <tr>
          <td align="center">
            <a href="${salesInquiryUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
              Review Inquiry →
            </a>
          </td>
        </tr>
      </table>
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
