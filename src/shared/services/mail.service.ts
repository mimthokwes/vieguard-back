import nodemailer from 'nodemailer';
import { env } from '../../config/env';

/**
 * Mail service powered by Nodemailer.
 * Reads SMTP credentials from environment variables (e.g. Mailtrap or custom SMTP).
 */
export const mailTransporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_PORT === 465, // true for 465, false for other ports (587, 2525)
  auth: {
    user: env.MAIL_USERNAME,
    pass: env.MAIL_PASSWORD,
  },
});

export class MailService {
  /**
   * Send Password Reset OTP email to the recipient.
   */
  static async sendOtpEmail(to: string, otpCode: string, recipientName?: string): Promise<void> {
    const senderName = env.MAIL_FROM_APP || 'VIEGUARD';
    const senderEmail = env.MAIL_FROM_ADDRESS || env.MAIL_USERNAME || 'no-reply@vieguard.com';
    const displayName = recipientName?.trim() || 'Pelanggan';

    const subject = `${otpCode} adalah Kode Verifikasi Lupa Password Akun VIEGUARD Anda`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password VIEGUARD</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7f6f0;
      color: #1a1a1a;
      line-height: 1.6;
    }
    .wrapper {
      width: 100%;
      background-color: #f7f6f0;
      padding: 40px 16px;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5e5dc;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: #1c2826;
      color: #ffffff;
      padding: 28px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 2px;
      font-weight: 800;
      color: #ffffff;
    }
    .content {
      padding: 32px 28px;
    }
    .title {
      font-size: 18px;
      font-weight: 700;
      color: #1c2826;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .otp-box {
      margin: 28px 0;
      padding: 20px;
      background: #fdfbf7;
      border: 2px dashed #3f5e55;
      border-radius: 12px;
      text-align: center;
    }
    .otp-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #3f5e55;
      margin-bottom: 8px;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #1c2826;
      font-family: 'Courier New', Courier, monospace;
      margin: 0;
    }
    .info {
      font-size: 13px;
      color: #666660;
      margin-top: 16px;
      line-height: 1.5;
    }
    .footer {
      border-top: 1px solid #f0efe8;
      padding: 20px 28px;
      text-align: center;
      font-size: 11px;
      color: #999990;
      background: #faf9f5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${senderName}</h1>
      </div>
      <div class="content">
        <h2 class="title">Permintaan Reset Kata Sandi</h2>
        <p>Halo <strong>${displayName}</strong>,</p>
        <p>Kami menerima permintaan untuk mereset kata sandi akun VIEGUARD Anda. Gunakan kode verifikasi (OTP) di bawah ini untuk melanjutkan:</p>
        
        <div class="otp-box">
          <div class="otp-title">Kode Verifikasi (OTP)</div>
          <div class="otp-code">${otpCode}</div>
        </div>

        <p class="info">
          ⏰ <strong>Penting:</strong> Kode ini hanya berlaku selama <strong>15 menit</strong>. Demi keamanan, jangan bagikan kode ini kepada siapapun, termasuk staf VIEGUARD.
        </p>
        <p class="info">
          Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini. Akun Anda tetap aman dan kata sandi tidak akan berubah.
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ${senderName}. Hak cipta dilindungi undang-undang.
      </div>
    </div>
  </div>
</body>
</html>
`;

    const plainText = `Halo ${displayName},

Kami menerima permintaan untuk mereset kata sandi akun VIEGUARD Anda.

Kode Verifikasi (OTP) Anda adalah: ${otpCode}

Kode ini berlaku selama 15 menit. Demi keamanan, jangan berikan kode ini kepada siapapun.
Jika Anda tidak merasa meminta reset password, abaikan email ini.

Salam,
Tim ${senderName}`;

    try {
      await mailTransporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to,
        subject,
        text: plainText,
        html: htmlContent,
      });

      console.log('[MAIL SERVICE] OTP email sent successfully.');
    } catch (error) {
      console.error('[MAIL SERVICE ERROR] Failed to send OTP email:', error);
      throw error;
    }
  }
}
