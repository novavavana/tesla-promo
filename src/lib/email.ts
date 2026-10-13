import tls from 'node:tls';
import crypto from 'node:crypto';

export interface SendConfirmationEmailParams {
  to: string;
  fullName: string;
  refCode: string;
  phoneNumber?: string;
  residentialAddress?: string;
  announcementDate?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
}

interface RawSmtpOptions {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Pure Node.js SMTP client over TLS (Port 465).
 * Works with Gmail SMTP (smtp.gmail.com:465) using Google App Passwords,
 * or any standard SSL/TLS SMTP server without external npm dependencies.
 */
function sendSmtpOverTls(options: RawSmtpOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return new Promise((resolve) => {
    const { host, port, user, pass, from, to, subject, text, html } = options;
    const cleanPass = pass.replace(/\s+/g, ''); // Strip spaces in 16-character Google App Passwords

    let stage = 'GREETING';
    let buffer = '';

    const boundary = 'bnd_' + crypto.randomBytes(12).toString('hex');
    const messageId = `<${Date.now()}.${crypto.randomBytes(6).toString('hex')}@${host}>`;

    const mimeMessage = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`,
      `Message-ID: ${messageId}`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      text,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      html,
      ``,
      `--${boundary}--`,
      ``,
      `.`
    ].join('\r\n') + '\r\n';

    const sendCmd = (cmd: string) => {
      socket.write(cmd + '\r\n');
    };

    let resolved = false;
    const cleanup = (res: { success: boolean; messageId?: string; error?: string }) => {
      if (resolved) return;
      resolved = true;
      try {
        socket.end();
        socket.destroy();
      } catch {}
      resolve(res);
    };

    const socket = tls.connect(
      {
        host,
        port,
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
        timeout: 15000,
      },
      () => {
        // Connected, waiting for server 220 banner
      }
    );

    socket.on('error', (err) => {
      cleanup({ success: false, error: `SMTP Socket Error: ${err.message}` });
    });

    socket.on('timeout', () => {
      cleanup({ success: false, error: 'SMTP connection timed out (15s)' });
    });

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf-8');

      const lines = buffer.split('\r\n');
      if (lines.length < 2) return;

      const lastLine = lines[lines.length - 2];
      // In SMTP, multiline replies end with code followed by a space (e.g. "250 OK")
      if (!/^\d{3}\s/.test(lastLine)) {
        return;
      }

      const code = parseInt(lastLine.substring(0, 3), 10);
      buffer = '';

      if (stage === 'GREETING') {
        if (code !== 220) return cleanup({ success: false, error: `Greeting rejected: ${lastLine}` });
        stage = 'EHLO';
        sendCmd('EHLO localhost');
      } else if (stage === 'EHLO') {
        if (code !== 250) return cleanup({ success: false, error: `EHLO rejected: ${lastLine}` });
        stage = 'AUTH';
        sendCmd('AUTH LOGIN');
      } else if (stage === 'AUTH') {
        if (code !== 334) return cleanup({ success: false, error: `AUTH LOGIN error: ${lastLine}` });
        stage = 'USER';
        sendCmd(Buffer.from(user).toString('base64'));
      } else if (stage === 'USER') {
        if (code !== 334) return cleanup({ success: false, error: `Username rejected: ${lastLine}` });
        stage = 'PASS';
        sendCmd(Buffer.from(cleanPass).toString('base64'));
      } else if (stage === 'PASS') {
        if (code !== 235) return cleanup({ success: false, error: `Authentication failed (Check password/app password): ${lastLine}` });
        stage = 'MAIL_FROM';
        const match = from.match(/<([^>]+)>/);
        const fromEmail = match ? match[1] : from;
        sendCmd(`MAIL FROM:<${fromEmail}>`);
      } else if (stage === 'MAIL_FROM') {
        if (code !== 250) return cleanup({ success: false, error: `MAIL FROM rejected: ${lastLine}` });
        stage = 'RCPT_TO';
        sendCmd(`RCPT TO:<${to}>`);
      } else if (stage === 'RCPT_TO') {
        if (code !== 250) return cleanup({ success: false, error: `RCPT TO rejected: ${lastLine}` });
        stage = 'DATA';
        sendCmd('DATA');
      } else if (stage === 'DATA') {
        if (code !== 354) return cleanup({ success: false, error: `DATA command rejected: ${lastLine}` });
        stage = 'SEND_BODY';
        socket.write(mimeMessage);
      } else if (stage === 'SEND_BODY') {
        if (code !== 250) return cleanup({ success: false, error: `Message dispatch rejected: ${lastLine}` });
        stage = 'QUIT';
        sendCmd('QUIT');
        cleanup({ success: true, messageId });
      }
    });
  });
}

/**
 * Generates plain text version of the confirmation email
 */
function buildPlainTextEmail(params: SendConfirmationEmailParams, supportEmail: string, whatsappNumber: string): string {
  const { fullName, refCode, announcementDate } = params;
  const firstName = fullName.split(' ')[0];

  return [
    `Hello ${firstName},`,
    ``,
    `Thank you for submitting your registration for the Tesla Discount Promotion.`,
    `Your application has been received and successfully recorded in our registry.`,
    ``,
    `--------------------------------------------------`,
    `REGISTRATION REFERENCE: #${refCode}`,
    `NAME: ${fullName}`,
    `STATUS: Pending Review`,
    announcementDate ? `EXPECTED ANNOUNCEMENT: ${announcementDate}` : `EXPECTED ANNOUNCEMENT: December 15th, 2026`,
    `--------------------------------------------------`,
    ``,
    `WHAT HAPPENS NEXT?`,
    `Please stay tuned for an announcement regarding the selection date and chosen applicants. Registration is completely free and does not guarantee selection or the award of any discount.`,
    ``,
    `NEED ASSISTANCE OR HAVE QUESTIONS?`,
    `- WhatsApp Support: +${whatsappNumber}`,
    `- Email Support: ${supportEmail}`,
    ``,
    `IMPORTANT: If this email arrived in your Spam or Junk folder, please mark it as "Not Spam" or add ${supportEmail} to your contacts so you don't miss our announcement updates.`,
    ``,
    `Thank you for your interest!`,
    ``,
    `--`,
    `Independent Promotions Team`,
    `Disclaimer: This is an independent promotion and is not affiliated with, endorsed by, or sponsored by Tesla, Inc.`
  ].join('\n');
}

/**
 * Generates modern, dark-mode themed HTML email matching the vehicle promotion branding
 */
function buildHtmlEmail(params: SendConfirmationEmailParams, supportEmail: string, whatsappNumber: string): string {
  const { fullName, refCode, announcementDate } = params;
  const firstName = fullName.split(' ')[0];
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello! I just received my email confirmation for the Tesla Discount Promotion (Ref: #${refCode}).`
  )}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tesla Discount Promotion Registration</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0d0d0d; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #181818; border: 1px solid #2e2e2e; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; background: linear-gradient(180deg, #242424 0%, #181818 100%); border-bottom: 1px solid #2e2e2e; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background-color: #2b2b2b; border: 1px solid #3d3d3d; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #d1d5db; margin-bottom: 14px;">
                Independent Promotions
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">
                Exclusive Vehicle Discount
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #9ca3af;">
                Registration Confirmation
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #f3f4f6;">
                Hello <strong>${firstName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #d1d5db;">
                Thank you for submitting your application. We have safely recorded your details in our system. Your reference code is generated below:
              </p>

              <!-- Reference Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #222222; border: 1px solid #383838; border-radius: 10px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; font-weight: 600; margin-bottom: 6px;">
                      Your Registration Reference
                    </span>
                    <span style="display: inline-block; font-size: 24px; font-family: monospace; font-weight: 700; color: #ffffff; letter-spacing: 3px; background-color: #111111; padding: 8px 20px; border-radius: 8px; border: 1px solid #444444;">
                      #${refCode}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Details Summary -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 28px; font-size: 13px; color: #d1d5db; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2b2b2b; color: #9ca3af; width: 40%;">Full Name</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2b2b2b; font-weight: 600; color: #ffffff;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2b2b2b; color: #9ca3af;">Status</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2b2b2b;">
                    <span style="display: inline-block; background-color: #362f1d; color: #fef08a; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                      Pending Review
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2b2b2b; color: #9ca3af;">Expected Announcement</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2b2b2b; font-weight: 600; color: #ffffff;">
                    ${announcementDate || 'December 15th, 2026'}
                  </td>
                </tr>
              </table>

              <!-- Next Steps Notice -->
              <div style="background-color: #1c241c; border: 1px solid #2d4530; border-radius: 10px; padding: 18px; margin-bottom: 28px;">
                <h3 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #4ade80; text-transform: uppercase; letter-spacing: 1px;">
                  What Happens Next?
                </h3>
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
                  Applicants chosen for the promotion discount will be contacted upon official announcement. Please save this email and keep your reference code handy.
                </p>
              </div>

              <!-- Action Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td align="center" style="padding: 6px;">
                    <a href="${whatsappLink}" target="_blank" style="display: inline-block; width: 85%; padding: 14px 20px; background-color: #25D366; color: #000000; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 8px; text-align: center; box-shadow: 0 4px 12px rgba(37,211,102,0.3);">
                      Chat on WhatsApp Support
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
                Need help? You can also reply directly to this email at <a href="mailto:${supportEmail}" style="color: #60a5fa; text-decoration: underline;">${supportEmail}</a>
              </p>

              <div style="margin-top: 20px; padding: 12px; background-color: #242016; border: 1px solid #4a3e20; border-radius: 8px; text-align: center; font-size: 11px; color: #fde047; line-height: 1.5;">
                <strong>Delivery Notice:</strong> If this email arrived in your Spam, Junk, or Promotions folder, please mark it as <em>&quot;Not Spam&quot;</em> or add <span style="text-decoration: underline;">${supportEmail}</span> to your contacts so you don&apos;t miss the official selection announcement!
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #121212; border-top: 1px solid #262626; text-align: center; font-size: 11px; color: #6b7280; line-height: 1.5;">
              <p style="margin: 0 0 8px 0;">
                &copy; 2026 Independent Promotions. All rights reserved.
              </p>
              <p style="margin: 0;">
                Disclaimer: This is an independent promotion offering potential discounts on electric vehicles to selected applicants. This promotion is not affiliated with, endorsed by, or sponsored by Tesla, Inc. Registration does not guarantee selection.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Sends automated confirmation email to applicant.
 * Prioritizes:
 * 1. Resend API (if RESEND_API_KEY is configured)
 * 2. SendGrid API (if SENDGRID_API_KEY is configured)
 * 3. Gmail SMTP / SSL port 465 (if GMAIL_APP_PASSWORD or SMTP_PASS is configured)
 * 
 * If credentials are not yet added, it gracefully logs and returns without interrupting registration.
 */
export async function sendConfirmationEmail(params: SendConfirmationEmailParams): Promise<SendEmailResult> {
  const { to, fullName, refCode } = params;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'teslaspaceinnovation34@gmail.com';
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '19193093163';
  const announcementDate = process.env.NEXT_PUBLIC_ANNOUNCEMENT_DATE;

  const subject = `Registration Received - Tesla Discount Promotion (#${refCode})`;
  const text = buildPlainTextEmail(params, supportEmail, whatsappNumber);
  const html = buildHtmlEmail(params, supportEmail, whatsappNumber);

  // 1. Try Resend API if key is present
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && !resendApiKey.includes('your_')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.SMTP_FROM || `Tesla Promotion Support <${supportEmail}>`,
          to: [to],
          subject,
          text,
          html,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`[Email Service] Automated confirmation sent to ${to} via Resend (${data.id})`);
        return { success: true, messageId: data.id, provider: 'resend' };
      } else {
        console.warn(`[Email Service] Resend error:`, data);
      }
    } catch (err: any) {
      console.error('[Email Service] Resend failed:', err.message);
    }
  }

  // 2. Try SendGrid API if key is present
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (sendgridApiKey && !sendgridApiKey.includes('your_')) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to, name: fullName }] }],
          from: { email: supportEmail, name: 'Tesla Promotion Support' },
          subject,
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html },
          ],
        }),
      });

      if (res.ok || res.status === 202) {
        console.log(`[Email Service] Automated confirmation sent to ${to} via SendGrid`);
        return { success: true, provider: 'sendgrid' };
      }
    } catch (err: any) {
      console.error('[Email Service] SendGrid failed:', err.message);
    }
  }

  // 3. Try Gmail SMTP / Direct SMTPS
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
  const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER || supportEmail;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const fromHeader = process.env.SMTP_FROM || `Tesla Promotion Support <${smtpUser}>`;

  if (gmailPass && gmailPass.trim() !== '' && !gmailPass.includes('your_')) {
    try {
      const smtpResult = await sendSmtpOverTls({
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        pass: gmailPass,
        from: fromHeader,
        to,
        subject,
        text,
        html,
      });

      if (smtpResult.success) {
        console.log(`[Email Service] Automated confirmation sent to ${to} via Gmail SMTP (${smtpResult.messageId})`);
        return { success: true, messageId: smtpResult.messageId, provider: 'smtp' };
      } else {
        console.warn(`[Email Service] SMTP error:`, smtpResult.error);
        return { success: false, error: smtpResult.error, provider: 'smtp' };
      }
    } catch (err: any) {
      console.error('[Email Service] SMTP exception:', err.message);
      return { success: false, error: err.message, provider: 'smtp' };
    }
  }

  // Not yet configured
  console.log(`[Email Service] Automated email to ${to} skipped: GMAIL_APP_PASSWORD not set in .env.local yet.`);
  return {
    success: false,
    error: 'Email credentials not configured yet (add GMAIL_APP_PASSWORD to .env.local to activate automated sending)',
    provider: 'none'
  };
}
