const SENDER_API_URL = process.env.SENDER_API_URL || 'https://api.sender.net/v2/message/send';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const isSenderConfigured = () =>
  Boolean(process.env.SENDER_API_TOKEN && process.env.SENDER_FROM_EMAIL);

const sendWithSender = async ({ toEmail, toName, subject, html, text }) => {
  if (!isSenderConfigured()) {
    console.warn('[Email] Sender.net is not configured. Skipping email send.');
    return { skipped: true };
  }

  const response = await fetch(SENDER_API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SENDER_API_TOKEN}`,
    },
    body: JSON.stringify({
      from: {
        email: process.env.SENDER_FROM_EMAIL,
        name: process.env.SENDER_FROM_NAME || 'BantuTepat',
      },
      to: {
        email: toEmail,
        name: toName || toEmail,
      },
      subject,
      html,
      text,
    }),
  });

  const responseText = await response.text();
  let responseBody = null;

  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseBody = responseText;
  }

  if (!response.ok) {
    throw new Error(
      `Sender.net email failed with ${response.status}: ${JSON.stringify(responseBody).slice(0, 500)}`
    );
  }

  return responseBody || { success: true };
};

const sendPasswordResetEmail = async ({ toEmail, toName, resetUrl, expiresInMinutes }) => {
  const safeName = escapeHtml(toName || 'Pengguna');
  const safeResetUrl = escapeHtml(resetUrl);
  const safeExpiresInMinutes = escapeHtml(expiresInMinutes);

  return sendWithSender({
    toEmail,
    toName,
    subject: 'Reset Password BantuTepat',
    text: `Halo ${toName || 'Pengguna'}, gunakan link berikut untuk reset password BantuTepat: ${resetUrl}. Link berlaku ${expiresInMinutes} menit. Abaikan email ini jika Anda tidak meminta reset password.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <h2 style="color: #2563eb;">Reset Password BantuTepat</h2>
        <p>Halo ${safeName},</p>
        <p>Kami menerima permintaan reset password untuk akun BantuTepat Anda.</p>
        <p>
          <a href="${safeResetUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 700;">
            Reset Password
          </a>
        </p>
        <p>Link ini berlaku selama ${safeExpiresInMinutes} menit.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
      </div>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
};
