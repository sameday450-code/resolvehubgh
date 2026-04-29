const transporter = require('../config/email');
const config = require('../config');
const logger = require('../config/logger');

// ─── Base layout wrapper ────────────────────────────────────────────────────
const baseLayout = (content, preheader = '') => `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>ResolveHub</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <style>td,th,div,p,a,h1,h2,h3,h4,h5,h6{font-family:"Segoe UI", sans-serif !important}</style>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      background: linear-gradient(135deg, #f0f4f8 0%, #e8ecf1 100%);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    img { max-width: 100%; height: auto; border: 0; display: block; }
    a { color: inherit; text-decoration: none; }
    table { border-collapse: collapse; border-spacing: 0; }
  </style>
</head>
<body style="background: linear-gradient(135deg, #f0f4f8 0%, #e8ecf1 100%); margin: 0; padding: 0; width: 100% !important; min-height: 100vh;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#f0f4f8;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; min-height: 100vh; background: linear-gradient(135deg, #f0f4f8 0%, #e8ecf1 100%);">
    <tr>
      <td align="center" style="padding: 40px 20px; vertical-align: top;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; margin: 0 auto;">

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 0 0 40px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="${config.frontendUrl}" style="display: inline-block; text-decoration: none;">
                      <img src="${config.frontendUrl}/logo.png" alt="ResolveHub" width="140" height="auto" style="max-width: 140px; height: auto; display: block;">
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 20px; box-shadow: 0 8px 32px rgba(79, 70, 229, 0.12); overflow: hidden; border: 1px solid rgba(79, 70, 229, 0.05);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${content}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 40px 20px 20px; text-align: center;">
              <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                <!-- Social links (optional) -->
                <p style="font-size: 12px; color: #94a3b8; line-height: 20px; margin: 0 0 16px;">
                  <a href="${config.frontendUrl}" style="color: #4f46e5; text-decoration: none; font-weight: 500; margin: 0 12px;">Website</a>
                  <span style="color: #cbd5e1;">•</span>
                  <a href="${config.frontendUrl}/contact" style="color: #4f46e5; text-decoration: none; font-weight: 500; margin: 0 12px;">Contact</a>
                </p>

                <!-- Copyright -->
                <p style="font-size: 12px; color: #cbd5e1; line-height: 18px; margin: 0;">
                  &copy; ${new Date().getFullYear()} ResolveHub. All rights reserved. | Made with ❤️ for better complaint management
                </p>
                <p style="font-size: 11px; color: #d1d5db; line-height: 16px; margin: 8px 0 0;">
                  This email was sent to you as a notification. If you didn't expect it, please ignore this email.
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Company Approved Template ──────────────────────────────────────────────
const companyApprovedTemplate = ({ companyName, loginUrl }) => {
  const content = `
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
                Your Company Is Approved!
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0; line-height: 24px; font-weight: 500;">
                Welcome to the ResolveHub platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 40px;">
        <p style="font-size: 16px; color: #1f2937; line-height: 26px; margin: 0 0 28px; font-weight: 500;">
          Hi there,
        </p>
        
        <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 0 0 24px;">
          Great news! <strong style="color: #059669; font-weight: 600;">${companyName}</strong> has been reviewed and <strong style="color: #059669; font-weight: 600;">approved</strong> by our verification team. Your account is now fully activated and ready to use.
        </p>

        <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 0 0 28px;">
          You can now log in to your dashboard and start leveraging the power of ResolveHub to manage and resolve customer complaints efficiently.
        </p>

        <!-- Features Grid -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
          <tr>
            <td style="padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #bbf7d0; border-radius: 12px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">🏢</div>
              <p style="font-size: 13px; font-weight: 600; color: #059669; margin: 0 0 4px;">Set Up Branches</p>
              <p style="font-size: 12px; color: #4b5563; margin: 0;">Configure your locations</p>
            </td>
            <td style="width: 16px;"></td>
            <td style="padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #bbf7d0; border-radius: 12px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">📱</div>
              <p style="font-size: 13px; font-weight: 600; color: #059669; margin: 0 0 4px;">Generate QR Codes</p>
              <p style="font-size: 12px; color: #4b5563; margin: 0;">Place at your locations</p>
            </td>
          </tr>
          <tr>
            <td colspan="3" style="height: 12px;"></td>
          </tr>
          <tr>
            <td style="padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #bbf7d0; border-radius: 12px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
              <p style="font-size: 13px; font-weight: 600; color: #059669; margin: 0 0 4px;">Invite Team</p>
              <p style="font-size: 12px; color: #4b5563; margin: 0;">Add your staff members</p>
            </td>
            <td style="width: 16px;"></td>
            <td style="padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #bbf7d0; border-radius: 12px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
              <p style="font-size: 13px; font-weight: 600; color: #059669; margin: 0 0 4px;">Track Complaints</p>
              <p style="font-size: 12px; color: #4b5563; margin: 0;">Monitor and resolve issues</p>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
          <tr>
            <td align="center">
              <a href="${loginUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 12px; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); transition: transform 0.2s; letter-spacing: 0.3px;">
                Access Your Dashboard →
              </a>
            </td>
          </tr>
        </table>

        <!-- Info section -->
        <div style="background: linear-gradient(135deg, #f3f4f6 0%, #eff6ff 100%); border-left: 4px solid #4f46e5; padding: 20px 24px; border-radius: 8px; margin: 28px 0;">
          <p style="font-size: 13px; color: #1f2937; margin: 0; line-height: 22px;">
            <strong style="color: #4f46e5;">Getting Started:</strong> Log in with your registered email to set up your first branch and generate QR codes for your locations.
          </p>
        </div>

        <p style="font-size: 14px; color: #6b7280; line-height: 24px; margin: 28px 0 0;">
          If you have any questions or need assistance, our support team is here to help. Simply reply to this email or visit our <a href="${loginUrl.replace('/login', '')}/contact" style="color: #4f46e5; font-weight: 600; text-decoration: none;">contact page</a>.
        </p>

        <p style="font-size: 14px; color: #4b5563; line-height: 26px; margin: 24px 0 0;">
          Best regards,<br>
          <strong style="color: #1f2937;">The ResolveHub Team</strong>
        </p>
      </td>
    </tr>
  `;

  return baseLayout(content, `${companyName} - Your ResolveHub account has been approved!`);
};

// ─── Company Rejected Template ──────────────────────────────────────────────
const companyRejectedTemplate = ({ companyName, reason, supportEmail }) => {
  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 48px 40px 36px; text-align: center; border-bottom: 4px solid #b91c1c;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <div style="width: 80px; height: 80px; margin: 0 auto; background-color: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                ✕
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">
                Registration Not Approved
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0; line-height: 24px; font-weight: 500;">
                We were unable to process your request at this time
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 40px;">
        <p style="font-size: 16px; color: #1f2937; line-height: 26px; margin: 0 0 24px; font-weight: 500;">
          Hello,
        </p>
        
        <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 0 0 24px;">
          Thank you for your interest in ResolveHub. We've carefully reviewed your company registration for <strong style="color: #1f2937; font-weight: 600;">${companyName}</strong>, and unfortunately, we're unable to approve it at this time.
        </p>

        ${reason ? `
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fef2f2 100%); border-left: 4px solid #dc2626; padding: 20px 24px; border-radius: 8px; margin: 24px 0;">
          <p style="font-size: 13px; color: #7f1d1d; margin: 0 0 8px; font-weight: 600;">Reason for Rejection:</p>
          <p style="font-size: 14px; color: #4b5563; line-height: 24px; margin: 0;">
            ${reason}
          </p>
        </div>
        ` : ''}

        <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 28px 0;">
          We understand this may be disappointing. If you believe there's been a misunderstanding or if you'd like to provide additional information, we encourage you to reach out to our support team.
        </p>

        <!-- CTA Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
          <tr>
            <td align="center">
              <a href="mailto:${supportEmail}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 12px; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); letter-spacing: 0.3px;">
                Contact Support Team
              </a>
            </td>
          </tr>
        </table>

        <!-- Next Steps -->
        <div style="background: linear-gradient(135deg, #f3f4f6 0%, #eff6ff 100%); border-left: 4px solid #4f46e5; padding: 20px 24px; border-radius: 8px; margin: 28px 0;">
          <p style="font-size: 13px; color: #1f2937; margin: 0; line-height: 22px;">
            <strong style="color: #4f46e5;">What's Next?</strong> Our support team is available 24/7 to discuss your registration. They can provide guidance on any areas that need improvement or clarification.
          </p>
        </div>

        <p style="font-size: 14px; color: #4b5563; line-height: 24px; margin: 28px 0 0;">
          We value your interest and would love to help if there's any way we can.<br>
          <br>
          <strong style="color: #1f2937;">The ResolveHub Team</strong>
        </p>
      </td>
    </tr>
  `;

  return baseLayout(content, `${companyName} - ResolveHub Registration Status`);
};

// ─── Company Suspended Template ─────────────────────────────────────────────
const companySuspendedTemplate = ({ companyName, reason, supportEmail }) => {
  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 48px 40px 36px; text-align: center; border-bottom: 4px solid #b45309;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <div style="width: 80px; height: 80px; margin: 0 auto; background-color: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                ⚠
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">
                Account Suspended
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0; line-height: 24px; font-weight: 500;">
                Temporary suspension – Action required
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 40px;">
        <p style="font-size: 16px; color: #1f2937; line-height: 26px; margin: 0 0 24px; font-weight: 500;">
          Hello,
        </p>
        
        <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 0 0 24px;">
          We regret to inform you that <strong style="color: #1f2937; font-weight: 600;">${companyName}</strong>'s ResolveHub account has been temporarily suspended by our admin team.
        </p>

        ${reason ? `
        <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 4px solid #d97706; padding: 20px 24px; border-radius: 8px; margin: 24px 0;">
          <p style="font-size: 13px; color: #78350f; margin: 0 0 8px; font-weight: 600;">Reason for Suspension:</p>
          <p style="font-size: 14px; color: #4b5563; line-height: 24px; margin: 0;">
            ${reason}
          </p>
        </div>
        ` : ''}

        <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 28px 0;">
          During this suspension, your team will be <strong>unable to access the dashboard</strong> and cannot manage complaints or perform any platform operations. However, this is a temporary measure, and your account can be restored once the issue is resolved.
        </p>

        <!-- CTA Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
          <tr>
            <td align="center">
              <a href="mailto:${supportEmail}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 12px; box-shadow: 0 4px 15px rgba(217, 119, 6, 0.3); letter-spacing: 0.3px;">
                Contact Support Immediately
              </a>
            </td>
          </tr>
        </table>

        <!-- Important Info -->
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #dc2626; padding: 20px 24px; border-radius: 8px; margin: 28px 0;">
          <p style="font-size: 13px; color: #7f1d1d; margin: 0 0 8px; font-weight: 600;">⚡ What You Should Do:</p>
          <p style="font-size: 13px; color: #4b5563; line-height: 22px; margin: 0;">
            Contact our support team immediately to understand the issue and discuss resolution steps. We're here to help restore your account as quickly as possible.
          </p>
        </div>

        <p style="font-size: 14px; color: #4b5563; line-height: 24px; margin: 28px 0 0;">
          Our support team is available 24/7 and ready to assist you.<br>
          <br>
          <strong style="color: #1f2937;">The ResolveHub Team</strong>
        </p>
      </td>
    </tr>
  `;

  return baseLayout(content, `${companyName} - Account Suspension Notice`);
};

// ─── Company Reactivated Template ───────────────────────────────────────────
const companyReactivatedTemplate = ({ companyName, loginUrl }) => {
  const content = `
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
                Account Reactivated!
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0; line-height: 24px; font-weight: 500;">
                Your company is back online
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 40px;">
        <p style="font-size: 16px; color: #1f2937; line-height: 26px; margin: 0 0 24px; font-weight: 500;">
          Good news!
        </p>
        
        <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 0 0 24px;">
          <strong style="color: #059669; font-weight: 600;">${companyName}</strong> has been successfully reactivated. Your team can now access the dashboard and resume all operations immediately.
        </p>

        <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 0 0 28px;">
          We appreciate your patience and look forward to continuing to support your complaint management operations on ResolveHub.
        </p>

        <!-- CTA Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
          <tr>
            <td align="center">
              <a href="${loginUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 12px; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); letter-spacing: 0.3px;">
                Back to Dashboard →
              </a>
            </td>
          </tr>
        </table>

        <!-- Quick Reminder -->
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-left: 4px solid #059669; padding: 20px 24px; border-radius: 8px; margin: 28px 0;">
          <p style="font-size: 13px; color: #065f46; margin: 0; line-height: 22px;">
            <strong style="color: #059669;">Welcome Back!</strong> To keep your account in good standing, please ensure your team remains compliant with our platform policies.
          </p>
        </div>

        <p style="font-size: 14px; color: #4b5563; line-height: 24px; margin: 28px 0 0;">
          If you have any questions, our support team is ready to assist.<br>
          <br>
          <strong style="color: #1f2937;">The ResolveHub Team</strong>
        </p>
      </td>
    </tr>
  `;

  return baseLayout(content, `${companyName} - Welcome Back to ResolveHub!`);
};

// ─── Send email helper with retry logic ──────────────────────────────────────
const sendEmail = async ({ to, subject, html }, retries = 2) => {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: `"ResolveHub" <${config.smtp.from}>`,
        to,
        subject,
        html,
      });
      logger.info({ messageId: info.messageId, to, subject }, '✅ Email sent successfully');
      return info;
    } catch (err) {
      const errorMessage = err.message || 'Unknown error';
      const isLastAttempt = attempt > retries;

      logger.warn({
        attempt,
        totalAttempts: retries + 1,
        error: errorMessage,
        code: err.code,
        to,
        subject,
      }, `Email send failed (attempt ${attempt}/${retries + 1})`);

      // Only retry on connection errors
      const shouldRetry = !isLastAttempt && (
        err.code === 'ENOTFOUND' ||
        err.code === 'ECONNREFUSED' ||
        err.code === 'ECONNRESET' ||
        err.message?.includes('Connection') ||
        err.message?.includes('timeout')
      );

      if (shouldRetry) {
        // Exponential backoff: wait 2s, 4s, etc.
        const delayMs = 1000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      // Final error logging
      logger.error({
        error: errorMessage,
        code: err.code,
        to,
        subject,
        stack: err.stack,
      }, '❌ Failed to send email after retries');

      // Return without throwing — email failure shouldn't block operations
      return null;
    }
  }
};

// ─── Public API ─────────────────────────────────────────────────────────────
const sendCompanyApprovedEmail = async (company) => {
  const loginUrl = `${config.frontendUrl}/login`;
  return sendEmail({
    to: company.email,
    subject: '🎉 Your Company Has Been Approved — ResolveHub',
    html: companyApprovedTemplate({
      companyName: company.name,
      loginUrl,
    }),
  });
};

const sendCompanyRejectedEmail = async (company, reason) => {
  return sendEmail({
    to: company.email,
    subject: 'Registration Update — ResolveHub',
    html: companyRejectedTemplate({
      companyName: company.name,
      reason,
      supportEmail: config.smtp.from,
    }),
  });
};

const sendCompanySuspendedEmail = async (company, reason) => {
  return sendEmail({
    to: company.email,
    subject: 'Account Suspended — ResolveHub',
    html: companySuspendedTemplate({
      companyName: company.name,
      reason,
      supportEmail: config.smtp.from,
    }),
  });
};

const sendCompanyReactivatedEmail = async (company) => {
  const loginUrl = `${config.frontendUrl}/login`;
  return sendEmail({
    to: company.email,
    subject: '✅ Your Account Has Been Reactivated — ResolveHub',
    html: companyReactivatedTemplate({
      companyName: company.name,
      loginUrl,
    }),
  });
};

// ─── Billing & Subscription Emails ──────────────────────────────────────────
const { 
  trialStartedTemplate, 
  trialReminderTemplate, 
  trialExpiredTemplate, 
  paymentSuccessTemplate, 
  paymentFailedTemplate, 
  enterpriseActivationTemplate,
  newEnterpriseSignupAlert 
} = require('./emailTemplates');

const sendTrialStartedEmail = async (company, subscription) => {
  const dashboardUrl = `${config.frontendUrl}/company/dashboard`;
  return sendEmail({
    to: company.email,
    subject: '🎉 Your 14-Day Free Trial is Active — ResolveHub',
    html: baseLayout(trialStartedTemplate({
      companyName: company.name,
      planType: subscription.subscriptionPlan?.name || 'Free Trial',
      daysRemaining: 14,
      trialEndsAt: subscription.trialEndsAt,
      dashboardUrl,
    })),
  });
};

const sendTrialReminderEmail = async (company, subscription, daysRemaining) => {
  const dashboardUrl = `${config.frontendUrl}/company/dashboard`;
  return sendEmail({
    to: company.email,
    subject: `⏰ ${daysRemaining} Days Left on Your Free Trial — ResolveHub`,
    html: baseLayout(trialReminderTemplate({
      companyName: company.name,
      daysRemaining,
      trialEndsAt: subscription.trialEndsAt,
      dashboardUrl,
    })),
  });
};

const sendTrialExpiredEmail = async (company) => {
  const dashboardUrl = `${config.frontendUrl}/company/dashboard`;
  return sendEmail({
    to: company.email,
    subject: 'Your Trial Has Ended — ResolveHub',
    html: baseLayout(trialExpiredTemplate({
      companyName: company.name,
      dashboardUrl,
    })),
  });
};

const sendPaymentSuccessEmail = async (company, transaction, subscription) => {
  const billingDate = new Date();
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  return sendEmail({
    to: company.email,
    subject: '✅ Payment Confirmed — ResolveHub',
    html: baseLayout(paymentSuccessTemplate({
      companyName: company.name,
      planName: subscription.subscriptionPlan?.name || 'ResolveHub',
      amount: transaction.amount,
      currency: transaction.currency || '₵',
      invoiceUrl: `${config.frontendUrl}/company/billing/invoice/${transaction.id}`,
      billingDate,
      nextBillingDate,
    })),
  });
};

const sendPaymentFailedEmail = async (company, transaction) => {
  return sendEmail({
    to: company.email,
    subject: '⚠️ Payment Failed — Action Required — ResolveHub',
    html: baseLayout(paymentFailedTemplate({
      companyName: company.name,
      planName: transaction.subscriptionPlan?.name || 'ResolveHub',
      amount: transaction.amount,
      currency: transaction.currency || '₵',
      reason: transaction.failureReason || 'Please check your payment method and try again.',
      retryUrl: `${config.frontendUrl}/company/billing/retry/${transaction.id}`,
    })),
  });
};

const sendEnterpriseActivationEmail = async (company, contactPerson, supportEmail) => {
  return sendEmail({
    to: company.email,
    subject: '🚀 Your Custom Enterprise Plan is Active — ResolveHub',
    html: baseLayout(enterpriseActivationTemplate({
      companyName: company.name,
      contactPerson,
      planDetails: 'Custom enterprise plan',
      activationUrl: `${config.frontendUrl}/company/dashboard`,
      supportEmail: supportEmail || config.smtp.from,
    })),
  });
};

const sendSuperAdminNewEnterpriseAlert = async (adminEmail, inquiry) => {
  return sendEmail({
    to: adminEmail,
    subject: `📌 New Enterprise Inquiry — ${inquiry.companyName} — ResolveHub Admin`,
    html: baseLayout(newEnterpriseSignupAlert({
      companyName: inquiry.companyName,
      contactPerson: inquiry.contactName,
      contactEmail: inquiry.contactEmail,
      contactPhone: inquiry.contactPhone,
      industry: inquiry.industry,
      branches: inquiry.estimatedBranches || 'Not specified',
      users: inquiry.estimatedUsers || 'Not specified',
      requirements: inquiry.requirements,
      salesInquiryUrl: `${config.frontendUrl}/super-admin/sales-inquiries`,
    })),
  });
};

// ─── New Company Registration Notification for Super Admins ──────────────────
const sendNewCompanyRegistrationAlert = async (company, planType) => {
  const approvalUrl = `${config.frontendUrl}/super-admin/approvals`;
  const isPlanTrial = planType === 'STARTER_TRIAL' || !planType;
  const isEnterpriseMonthly = planType === 'ENTERPRISE_MONTHLY';

  const planLabel = isPlanTrial 
    ? '14-Day Free Trial'
    : isEnterpriseMonthly
    ? 'Enterprise Monthly'
    : 'Standard';

  const planBadgeColor = isEnterpriseMonthly 
    ? '#8b5cf6'
    : isPlanTrial
    ? '#3b82f6'
    : '#6366f1';

  const planBadgeBg = isEnterpriseMonthly 
    ? '#f3e8ff'
    : isPlanTrial
    ? '#eff6ff'
    : '#eef2ff';

  const planBadgeBorder = isEnterpriseMonthly 
    ? '#ddd6fe'
    : isPlanTrial
    ? '#bfdbfe'
    : '#c7d2fe';

  const content = `
    <tr>
      <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 48px 40px 36px; text-align: center; border-bottom: 4px solid #4338ca;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <div style="width: 80px; height: 80px; margin: 0 auto; background-color: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                📋
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">
                New Registration Pending
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 12px 0 0; line-height: 24px; font-weight: 500;">
                ${isEnterpriseMonthly ? 'Enterprise application' : 'Company signup'} awaiting approval
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 40px;">
        <p style="font-size: 16px; color: #1f2937; line-height: 26px; margin: 0 0 28px; font-weight: 500;">
          Action Required:
        </p>
        
        <p style="font-size: 15px; color: #4b5563; line-height: 26px; margin: 0 0 28px;">
          A new company has registered on ResolveHub and is waiting for your review. Please review their details and approve or reject their registration.
        </p>

        <!-- Company Details Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 28px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <!-- Company Name Row -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Company Name</p>
                    <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0;">
                      ${company.name}
                    </p>
                  </td>
                </tr>

                <!-- Email Row -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Email Address</p>
                    <p style="font-size: 15px; color: #4f46e5; margin: 0; font-family: 'Courier New', monospace;">
                      ${company.email}
                    </p>
                  </td>
                </tr>

                <!-- Plan Type Row -->
                <tr>
                  <td style="padding-bottom: 0;">
                    <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 6px;">Plan Type</p>
                    <div style="display: inline-block; background-color: ${planBadgeBg}; border: 1px solid ${planBadgeBorder}; border-radius: 20px; padding: 6px 12px;">
                      <span style="font-size: 13px; font-weight: 600; color: ${planBadgeColor};">
                        ${planLabel}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA Buttons -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 36px 0;">
          <tr>
            <td align="center">
              <a href="${approvalUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 12px; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); letter-spacing: 0.3px;">
                Review & Approve →
              </a>
            </td>
          </tr>
        </table>

        <!-- Quick Actions Info -->
        <div style="background: linear-gradient(135deg, #f3f4f6 0%, #eff6ff 100%); border-left: 4px solid #4f46e5; padding: 20px 24px; border-radius: 8px; margin: 28px 0;">
          <p style="font-size: 13px; color: #1f2937; margin: 0; line-height: 22px;">
            <strong style="color: #4f46e5;">Dashboard Link:</strong> You can also access the approvals page directly from your super-admin dashboard under "Approvals" to manage all pending registrations.
          </p>
        </div>

        <p style="font-size: 14px; color: #4b5563; line-height: 24px; margin: 28px 0 0;">
          Thank you for keeping ResolveHub secure and reliable.<br>
          <br>
          <strong style="color: #1f2937;">The ResolveHub Team</strong>
        </p>
      </td>
    </tr>
  `;

  const subject = isEnterpriseMonthly
    ? `🏢 New Enterprise Registration: ${company.name}`
    : `📋 New Company Registration: ${company.name}`;

  return sendEmail({
    to: config.smtp.from,
    subject,
    html: baseLayout(content, `New company registration: ${company.name}`),
  });
};

module.exports = {
  sendEmail,
  sendCompanyApprovedEmail,
  sendCompanyRejectedEmail,
  sendCompanySuspendedEmail,
  sendCompanyReactivatedEmail,
  sendNewCompanyRegistrationAlert,
  // Billing emails
  sendTrialStartedEmail,
  sendTrialReminderEmail,
  sendTrialExpiredEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendEnterpriseActivationEmail,
  sendSuperAdminNewEnterpriseAlert,
};
