const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

// Allow self-signed certs for SMTP
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Send email endpoint
app.post('/send', async (req, res) => {
  const { gmail, appPassword, senderName, to, subject, bodyText, bodyHtml, format } = req.body;

  // Validate required fields
  if (!gmail || !appPassword || !to || !subject) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // Clean app password — remove spaces
  const cleanPass = appPassword.replace(/\s/g, '');

  // Build mail options — safe headers for inbox delivery
  const mailOptions = {
    from: `"${senderName || gmail}" <${gmail}>`,
    to: to,
    subject: subject,
    headers: {
      'X-Mailer': 'Nodemailer',
      'X-Priority': '3',
      'Importance': 'Normal',
    }
  };

  // Set body based on format
  if (format === 'html') {
    mailOptions.html = bodyHtml;
    mailOptions.text = bodyText || stripHtml(bodyHtml);
  } else if (format === 'both') {
    mailOptions.html = bodyHtml;
    mailOptions.text = bodyText;
  } else {
    // Plain text — best for inbox delivery
    mailOptions.text = bodyText;
  }

  // Try port 587 first (STARTTLS) — most reliable
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: gmail, pass: cleanPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 30000,
      socketTimeout: 30000,
    });

    await transporter.sendMail(mailOptions);
    console.log(`✅ Sent [587] → ${to}`);
    return res.json({ success: true });

  } catch (err1) {
    console.log(`⚠️ Port 587 failed: ${err1.message} — trying 465...`);

    // Fallback to port 465 (SSL)
    try {
      const transporter2 = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: gmail, pass: cleanPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 30000,
        socketTimeout: 30000,
      });

      await transporter2.sendMail(mailOptions);
      console.log(`✅ Sent [465] → ${to}`);
      return res.json({ success: true });

    } catch (err2) {
      console.error(`❌ Both ports failed → ${to}: ${err2.message}`);
      return res.status(500).json({ success: false, error: err2.message });
    }
  }
});

// Strip HTML tags for plain text fallback
function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '';
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Secure Mail Server running on port ${PORT}`);
});
