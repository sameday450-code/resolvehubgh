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
  <style>td,th,div,p,a,h1,h2,h3,h4,h5,h6{font-family:"Segoe UI", Arial, sans-serif !important}</style>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background-color: #f1f5f9;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    img { max-width: 100%; height: auto; border: 0; display: block; }
    a { color: inherit; text-decoration: none; }
    table { border-collapse: collapse; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    .email-wrapper { width: 100%; background-color: #f1f5f9; }
    .email-container { max-width: 600px; width: 100%; margin: 0 auto; }
    .main-card { background-color: #ffffff; border-radius: 16px; overflow: hidden; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-body-padding { padding: 28px 24px !important; }
      .hero-padding { padding: 36px 24px 28px !important; }
      .hero-title { font-size: 22px !important; }
      .cta-button { padding: 14px 32px !important; font-size: 15px !important; }
      .feature-card-row td { display: block !important; width: 100% !important; }
      .feature-card-spacer { display: none !important; }
    }
  </style>
</head>
<body style="background-color: #f1f5f9; margin: 0; padding: 0; width: 100% !important; min-height: 100vh;" class="email-wrapper">
  ${preheader ? `<div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f1f5f9; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;" valign="top">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="email-container" style="max-width: 600px; width: 100%; margin: 0 auto;">

          <!-- Header: Brand Logo -->
          <tr>
            <td style="padding: 0 0 32px; text-align: center;">
              <a href="${config.frontendUrl}" style="display: inline-block; text-decoration: none;" target="_blank">
                <!-- Logo image with text fallback -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                  <tr>
                    <td align="center" style="background-color: #ffffff; border-radius: 12px; padding: 14px 28px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #e8ecf0;">
                      <img src="${config.frontendUrl}/logo.png" alt="ResolveHub" width="130" height="auto" style="max-width: 130px; height: auto; display: block;">
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08), 0 1px 4px rgba(15, 23, 42, 0.04); overflow: hidden; border: 1px solid #e8ecf0;" class="main-card">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${content}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 36px 20px 24px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top: 1px solid #e2e8f0; padding-top: 28px; text-align: center;">
                    <!-- Nav Links -->
                    <p style="font-size: 12px; color: #94a3b8; line-height: 22px; margin: 0 0 14px;">
                      <a href="${config.frontendUrl}" style="color: #6366f1; text-decoration: none; font-weight: 500; font-family: 'Inter', Arial, sans-serif;" target="_blank">Website</a>
                      &nbsp;&nbsp;<span style="color: #cbd5e1;">&middot;</span>&nbsp;&nbsp;
                      <a href="${config.frontendUrl}/contact" style="color: #6366f1; text-decoration: none; font-weight: 500; font-family: 'Inter', Arial, sans-serif;" target="_blank">Contact Support</a>
                      &nbsp;&nbsp;<span style="color: #cbd5e1;">&middot;</span>&nbsp;&nbsp;
                      <a href="${config.frontendUrl}/privacy" style="color: #6366f1; text-decoration: none; font-weight: 500; font-family: 'Inter', Arial, sans-serif;" target="_blank">Privacy Policy</a>
                    </p>
                    <!-- Powered By -->
                    <p style="font-size: 12px; color: #64748b; line-height: 20px; margin: 0 0 10px; font-family: 'Inter', Arial, sans-serif; font-weight: 500;">
                      Powered by <strong style="color: #6366f1;">ResolveHub</strong>
                    </p>
                    <!-- Copyright -->
                    <p style="font-size: 11px; color: #94a3b8; line-height: 18px; margin: 0 0 8px; font-family: 'Inter', Arial, sans-serif;">
                      &copy; ${new Date().getFullYear()} ResolveHub. All rights reserved.
                    </p>
                    <p style="font-size: 11px; color: #94a3b8; line-height: 18px; margin: 0; font-family: 'Inter', Arial, sans-serif;">
                      Powering smarter complaint resolution for modern businesses.
                    </p>
                    <p style="font-size: 10px; color: #b0bac4; line-height: 16px; margin: 10px 0 0; font-family: 'Inter', Arial, sans-serif;">
                      You received this email as part of your ResolveHub account activity. If this was unexpected, you may safely ignore it.
                    </p>
                  </td>
                </tr>
              </table>
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
    <!-- Hero -->
    <tr>
      <td style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%); padding: 52px 40px 40px; text-align: center;" class="hero-padding">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <!-- Check icon SVG -->
              <div style="width: 72px; height: 72px; margin: 0 auto; background-color: rgba(255,255,255,0.2); border-radius: 50%; line-height: 72px; text-align: center; border: 2px solid rgba(255,255,255,0.3);">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-top: 2px;">
                  <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0 0 10px; letter-spacing: -0.3px; line-height: 1.25; font-family: 'Inter', Arial, sans-serif;" class="hero-title">
                Your Company Is Approved!
              </h1>
              <p style="color: rgba(255,255,255,0.88); font-size: 15px; margin: 0; line-height: 24px; font-weight: 400; font-family: 'Inter', Arial, sans-serif;">
                Welcome to the ResolveHub platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 40px 40px 36px;" class="email-body-padding">
        <p style="font-size: 16px; color: #0f172a; line-height: 28px; margin: 0 0 16px; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
          Hi there,
        </p>
        <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 16px; font-family: 'Inter', Arial, sans-serif;">
          Great news! <strong style="color: #059669;">${companyName}</strong> has been reviewed and <strong style="color: #059669;">approved</strong> by our verification team. Your account is now fully activated and ready to use.
        </p>
        <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 32px; font-family: 'Inter', Arial, sans-serif;">
          Log in to your dashboard and start managing customer feedback efficiently with QR-powered complaint management.
        </p>

        <!-- Feature Cards -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px;" class="feature-card-row">
          <tr>
            <td width="48%" style="padding: 18px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; vertical-align: top;">
              <div style="margin-bottom: 10px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="9 22 9 12 15 12 15 22" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p style="font-size: 13px; font-weight: 600; color: #0f172a; margin: 0 0 4px; font-family: 'Inter', Arial, sans-serif;">Set Up Branches</p>
              <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 18px; font-family: 'Inter', Arial, sans-serif;">Configure your locations</p>
            </td>
            <td width="4%" class="feature-card-spacer" style="width: 16px;">&nbsp;</td>
            <td width="48%" style="padding: 18px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; vertical-align: top;">
              <div style="margin-bottom: 10px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
                  <rect x="3" y="3" width="7" height="7" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="14" y="3" width="7" height="7" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="3" y="14" width="7" height="7" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="14" y="14" width="7" height="7" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p style="font-size: 13px; font-weight: 600; color: #0f172a; margin: 0 0 4px; font-family: 'Inter', Arial, sans-serif;">Generate QR Codes</p>
              <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 18px; font-family: 'Inter', Arial, sans-serif;">Place at your locations</p>
            </td>
          </tr>
          <tr><td colspan="3" style="height: 14px;"></td></tr>
          <tr>
            <td width="48%" style="padding: 18px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; vertical-align: top;">
              <div style="margin-bottom: 10px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p style="font-size: 13px; font-weight: 600; color: #0f172a; margin: 0 0 4px; font-family: 'Inter', Arial, sans-serif;">Invite Your Team</p>
              <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 18px; font-family: 'Inter', Arial, sans-serif;">Add your staff members</p>
            </td>
            <td width="4%" class="feature-card-spacer" style="width: 16px;">&nbsp;</td>
            <td width="48%" style="padding: 18px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; vertical-align: top;">
              <div style="margin-bottom: 10px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
                  <line x1="18" y1="20" x2="18" y2="10" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="20" x2="12" y2="4" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="6" y1="20" x2="6" y2="14" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p style="font-size: 13px; font-weight: 600; color: #0f172a; margin: 0 0 4px; font-family: 'Inter', Arial, sans-serif;">Track Analytics</p>
              <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 18px; font-family: 'Inter', Arial, sans-serif;">Monitor and resolve issues</p>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px;">
          <tr>
            <td align="center">
              <a href="${loginUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 15px 44px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); letter-spacing: 0.2px; font-family: 'Inter', Arial, sans-serif;" class="cta-button">
                Access Your Dashboard &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Info box -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color: #f8fafc; border-left: 3px solid #4f46e5; border-radius: 0 8px 8px 0; padding: 16px 20px;">
              <p style="font-size: 13px; color: #374151; margin: 0; line-height: 22px; font-family: 'Inter', Arial, sans-serif;">
                <strong style="color: #4f46e5;">Getting Started:</strong> Log in with your registered email to set up your first branch and generate QR codes for your locations.
              </p>
            </td>
          </tr>
        </table>

        <p style="font-size: 13px; color: #94a3b8; line-height: 22px; margin: 28px 0 0; font-family: 'Inter', Arial, sans-serif;">
          Questions? Reply to this email or visit our <a href="${loginUrl.replace('/login', '')}/contact" style="color: #4f46e5; font-weight: 500; text-decoration: none;">support page</a>. We're happy to help.
        </p>

        <p style="font-size: 14px; color: #475569; line-height: 24px; margin: 20px 0 0; font-family: 'Inter', Arial, sans-serif;">
          Best regards,<br>
          <strong style="color: #0f172a;">The ResolveHub Team</strong>
        </p>
      </td>
    </tr>
  `;

  return baseLayout(content, `${companyName} - Your ResolveHub account has been approved!`);
};

// ─── Company Rejected Template ──────────────────────────────────────────────
const companyRejectedTemplate = ({ companyName, reason, supportEmail }) => {
  const content = `
    <!-- Hero -->
    <tr>
      <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 52px 40px 40px; text-align: center;" class="hero-padding">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <div style="width: 72px; height: 72px; margin: 0 auto; background-color: rgba(255,255,255,0.2); border-radius: 50%; line-height: 72px; text-align: center; border: 2px solid rgba(255,255,255,0.3);">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-top: 2px;">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0 0 10px; letter-spacing: -0.3px; line-height: 1.25; font-family: 'Inter', Arial, sans-serif;" class="hero-title">
                Registration Not Approved
              </h1>
              <p style="color: rgba(255,255,255,0.88); font-size: 15px; margin: 0; line-height: 24px; font-weight: 400; font-family: 'Inter', Arial, sans-serif;">
                We were unable to process your request at this time
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 40px 40px 36px;" class="email-body-padding">
        <p style="font-size: 16px; color: #0f172a; line-height: 28px; margin: 0 0 16px; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">Hello,</p>
        <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 16px; font-family: 'Inter', Arial, sans-serif;">
          Thank you for your interest in ResolveHub. We've carefully reviewed the registration for <strong style="color: #0f172a;">${companyName}</strong> and unfortunately cannot approve it at this time.
        </p>

        ${reason ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
          <tr>
            <td style="background-color: #fef2f2; border-left: 3px solid #dc2626; border-radius: 0 8px 8px 0; padding: 16px 20px;">
              <p style="font-size: 12px; color: #991b1b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 8px; font-family: 'Inter', Arial, sans-serif;">Reason for Rejection</p>
              <p style="font-size: 14px; color: #374151; line-height: 22px; margin: 0; font-family: 'Inter', Arial, sans-serif;">${reason}</p>
            </td>
          </tr>
        </table>
        ` : ''}

        <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 32px; font-family: 'Inter', Arial, sans-serif;">
          If you believe this is an error or would like to provide additional information, please contact our support team — we're happy to review your case.
        </p>

        <!-- CTA Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px;">
          <tr>
            <td align="center">
              <a href="mailto:${supportEmail}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 15px 44px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); letter-spacing: 0.2px; font-family: 'Inter', Arial, sans-serif;" class="cta-button">
                Contact Support Team
              </a>
            </td>
          </tr>
        </table>

        <!-- Info box -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color: #f8fafc; border-left: 3px solid #4f46e5; border-radius: 0 8px 8px 0; padding: 16px 20px;">
              <p style="font-size: 13px; color: #374151; margin: 0; line-height: 22px; font-family: 'Inter', Arial, sans-serif;">
                <strong style="color: #4f46e5;">What's Next?</strong> Our support team is available to discuss your registration and provide guidance on next steps.
              </p>
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #475569; line-height: 24px; margin: 28px 0 0; font-family: 'Inter', Arial, sans-serif;">
          We value your interest and look forward to hearing from you.<br><br>
          <strong style="color: #0f172a;">The ResolveHub Team</strong>
        </p>
      </td>
    </tr>
  `;

  return baseLayout(content, `${companyName} - ResolveHub Registration Status`);
};

// ─── Company Suspended Template ─────────────────────────────────────────────
const companySuspendedTemplate = ({ companyName, reason, supportEmail }) => {
  const content = `
    <!-- Hero -->
    <tr>
      <td style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 52px 40px 40px; text-align: center;" class="hero-padding">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <div style="width: 72px; height: 72px; margin: 0 auto; background-color: rgba(255,255,255,0.2); border-radius: 50%; line-height: 72px; text-align: center; border: 2px solid rgba(255,255,255,0.3);">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-top: 2px;">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0 0 10px; letter-spacing: -0.3px; line-height: 1.25; font-family: 'Inter', Arial, sans-serif;" class="hero-title">
                Account Suspended
              </h1>
              <p style="color: rgba(255,255,255,0.88); font-size: 15px; margin: 0; line-height: 24px; font-weight: 400; font-family: 'Inter', Arial, sans-serif;">
                Temporary suspension — Action required
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 40px 40px 36px;" class="email-body-padding">
        <p style="font-size: 16px; color: #0f172a; line-height: 28px; margin: 0 0 16px; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">Hello,</p>
        <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 16px; font-family: 'Inter', Arial, sans-serif;">
          We regret to inform you that <strong style="color: #0f172a;">${companyName}</strong>'s ResolveHub account has been temporarily suspended by our admin team.
        </p>

        ${reason ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
          <tr>
            <td style="background-color: #fffbeb; border-left: 3px solid #d97706; border-radius: 0 8px 8px 0; padding: 16px 20px;">
              <p style="font-size: 12px; color: #92400e; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 8px; font-family: 'Inter', Arial, sans-serif;">Reason for Suspension</p>
              <p style="font-size: 14px; color: #374151; line-height: 22px; margin: 0; font-family: 'Inter', Arial, sans-serif;">${reason}</p>
            </td>
          </tr>
        </table>
        ` : ''}

        <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 32px; font-family: 'Inter', Arial, sans-serif;">
          During this suspension, your team will be unable to access the dashboard or perform platform operations. This is a temporary measure — your account will be restored once the issue is resolved.
        </p>

        <!-- CTA Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px;">
          <tr>
            <td align="center">
              <a href="mailto:${supportEmail}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 15px 44px; border-radius: 10px; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35); letter-spacing: 0.2px; font-family: 'Inter', Arial, sans-serif;" class="cta-button">
                Contact Support Immediately
              </a>
            </td>
          </tr>
        </table>

        <!-- Action box -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color: #fef2f2; border-left: 3px solid #dc2626; border-radius: 0 8px 8px 0; padding: 16px 20px;">
              <p style="font-size: 13px; color: #374151; margin: 0; line-height: 22px; font-family: 'Inter', Arial, sans-serif;">
                <strong style="color: #dc2626;">Action Required:</strong> Contact our support team to understand the issue and discuss resolution steps. We're committed to restoring your account as quickly as possible.
              </p>
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #475569; line-height: 24px; margin: 28px 0 0; font-family: 'Inter', Arial, sans-serif;">
          Our support team is available and ready to assist.<br><br>
          <strong style="color: #0f172a;">The ResolveHub Team</strong>
        </p>
      </td>
    </tr>
  `;

  return baseLayout(content, `${companyName} - Account Suspension Notice`);
};

// ─── Company Reactivated Template ───────────────────────────────────────────
const companyReactivatedTemplate = ({ companyName, loginUrl }) => {
  const content = `
    <!-- Hero -->
    <tr>
      <td style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%); padding: 52px 40px 40px; text-align: center;" class="hero-padding">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <div style="width: 72px; height: 72px; margin: 0 auto; background-color: rgba(255,255,255,0.2); border-radius: 50%; line-height: 72px; text-align: center; border: 2px solid rgba(255,255,255,0.3);">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-top: 2px;">
                  <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0 0 10px; letter-spacing: -0.3px; line-height: 1.25; font-family: 'Inter', Arial, sans-serif;" class="hero-title">
                Account Reactivated!
              </h1>
              <p style="color: rgba(255,255,255,0.88); font-size: 15px; margin: 0; line-height: 24px; font-weight: 400; font-family: 'Inter', Arial, sans-serif;">
                Your company is back online
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 40px 40px 36px;" class="email-body-padding">
        <p style="font-size: 16px; color: #0f172a; line-height: 28px; margin: 0 0 16px; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">Good news!</p>
        <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 16px; font-family: 'Inter', Arial, sans-serif;">
          <strong style="color: #059669;">${companyName}</strong> has been successfully reactivated. Your team can now access the dashboard and resume all operations immediately.
        </p>
        <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 32px; font-family: 'Inter', Arial, sans-serif;">
          We appreciate your patience and look forward to continuing to support your complaint management operations.
        </p>

        <!-- CTA Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px;">
          <tr>
            <td align="center">
              <a href="${loginUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 15px 44px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); letter-spacing: 0.2px; font-family: 'Inter', Arial, sans-serif;" class="cta-button">
                Back to Dashboard &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Info box -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color: #f0fdf4; border-left: 3px solid #059669; border-radius: 0 8px 8px 0; padding: 16px 20px;">
              <p style="font-size: 13px; color: #374151; margin: 0; line-height: 22px; font-family: 'Inter', Arial, sans-serif;">
                <strong style="color: #059669;">Welcome Back!</strong> To keep your account in good standing, please ensure your team remains compliant with our platform policies.
              </p>
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #475569; line-height: 24px; margin: 28px 0 0; font-family: 'Inter', Arial, sans-serif;">
          If you have any questions, our support team is ready to assist.<br><br>
          <strong style="color: #0f172a;">The ResolveHub Team</strong>
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
    <!-- Hero -->
    <tr>
      <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 52px 40px 40px; text-align: center;" class="hero-padding">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <div style="width: 72px; height: 72px; margin: 0 auto; background-color: rgba(255,255,255,0.2); border-radius: 50%; line-height: 72px; text-align: center; border: 2px solid rgba(255,255,255,0.3);">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-top: 2px;">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="14 2 14 8 20 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  <polyline points="10 9 9 9 8 9" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0 0 10px; letter-spacing: -0.3px; line-height: 1.25; font-family: 'Inter', Arial, sans-serif;" class="hero-title">
                New Registration Pending
              </h1>
              <p style="color: rgba(255,255,255,0.88); font-size: 15px; margin: 0; line-height: 24px; font-weight: 400; font-family: 'Inter', Arial, sans-serif;">
                ${isEnterpriseMonthly ? 'Enterprise application' : 'Company signup'} awaiting approval
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 40px 40px 36px;" class="email-body-padding">
        <p style="font-size: 16px; color: #0f172a; line-height: 28px; margin: 0 0 16px; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
          Action Required:
        </p>
        <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 28px; font-family: 'Inter', Arial, sans-serif;">
          A new company has registered on ResolveHub and is waiting for your review. Please review their details and approve or reject their registration.
        </p>

        <!-- Company Details Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 0 0 28px;">
          <tr>
            <td style="padding: 24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 18px; border-bottom: 1px solid #e2e8f0;">
                    <p style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.6px; margin: 0 0 6px; font-family: 'Inter', Arial, sans-serif;">Company Name</p>
                    <p style="font-size: 17px; font-weight: 700; color: #0f172a; margin: 0; font-family: 'Inter', Arial, sans-serif;">${company.name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 0; border-bottom: 1px solid #e2e8f0;">
                    <p style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.6px; margin: 0 0 6px; font-family: 'Inter', Arial, sans-serif;">Email Address</p>
                    <p style="font-size: 14px; color: #4f46e5; margin: 0; font-family: 'Courier New', Courier, monospace;">${company.email}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 18px;">
                    <p style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.6px; margin: 0 0 8px; font-family: 'Inter', Arial, sans-serif;">Plan Type</p>
                    <span style="display: inline-block; background-color: ${planBadgeBg}; border: 1px solid ${planBadgeBorder}; border-radius: 20px; padding: 5px 14px;">
                      <span style="font-size: 13px; font-weight: 600; color: ${planBadgeColor}; font-family: 'Inter', Arial, sans-serif;">${planLabel}</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px;">
          <tr>
            <td align="center">
              <a href="${approvalUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 15px 44px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); letter-spacing: 0.2px; font-family: 'Inter', Arial, sans-serif;" class="cta-button">
                Review &amp; Approve &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Info box -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color: #f8fafc; border-left: 3px solid #4f46e5; border-radius: 0 8px 8px 0; padding: 16px 20px;">
              <p style="font-size: 13px; color: #374151; margin: 0; line-height: 22px; font-family: 'Inter', Arial, sans-serif;">
                <strong style="color: #4f46e5;">Dashboard:</strong> Access the Approvals page in your super-admin dashboard to manage all pending registrations.
              </p>
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #475569; line-height: 24px; margin: 28px 0 0; font-family: 'Inter', Arial, sans-serif;">
          Thank you for keeping ResolveHub secure and reliable.<br><br>
          <strong style="color: #0f172a;">The ResolveHub Team</strong>
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

/**
 * Send reply email to a customer who submitted a contact message.
 */
const sendContactReplyEmail = async ({ to, customerName, subject, replyMessage }) => {
  const replySubject = `Re: ${subject}`;

  const content = `
    <!-- Hero -->
    <tr>
      <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 52px 40px 40px; text-align: center;" class="hero-padding">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <div style="width: 72px; height: 72px; margin: 0 auto; background-color: rgba(255,255,255,0.2); border-radius: 50%; line-height: 72px; text-align: center; border: 2px solid rgba(255,255,255,0.3);">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-top: 2px;">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0 0 10px; letter-spacing: -0.3px; line-height: 1.25; font-family: 'Inter', Arial, sans-serif;" class="hero-title">
                Reply from ResolveHub
              </h1>
              <p style="color: rgba(255,255,255,0.88); font-size: 15px; margin: 0; line-height: 24px; font-weight: 400; font-family: 'Inter', Arial, sans-serif;">
                Response to your support message
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 40px 40px 36px;" class="email-body-padding">
        <p style="font-size: 16px; color: #0f172a; line-height: 28px; margin: 0 0 16px; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
          Hello ${customerName},
        </p>
        <p style="font-size: 15px; color: #475569; line-height: 26px; margin: 0 0 24px; font-family: 'Inter', Arial, sans-serif;">
          Thank you for reaching out to us. Here is our response to your message regarding <strong style="color: #0f172a;">"${subject}"</strong>:
        </p>

        <!-- Reply Content Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px;">
          <tr>
            <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #4f46e5; border-radius: 0 8px 8px 0; padding: 20px 24px;">
              <p style="font-size: 15px; color: #374151; line-height: 28px; margin: 0; font-family: 'Inter', Arial, sans-serif; white-space: pre-line;">${replyMessage}</p>
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #94a3b8; line-height: 22px; margin: 0; font-family: 'Inter', Arial, sans-serif;">
          If you have any further questions, don't hesitate to reach out — we're always happy to help.<br><br>
          <strong style="color: #0f172a;">Best regards,<br>ResolveHub Support Team</strong>
        </p>
      </td>
    </tr>
  `;

  return sendEmail({
    to,
    subject: replySubject,
    html: baseLayout(content, `ResolveHub reply: ${subject}`),
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
  // Contact message reply
  sendContactReplyEmail,
};
