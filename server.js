const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/send', async (req, res) => {
  const { gmail, appPassword, senderName, to, subject, bodyText, bodyHtml, format } = req.body;

  if (!gmail || !appPassword || !to || !subject) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmail,
        pass: appPassword.replace(/\s/g, '')
      }
    });

    const mailOptions = {
      from: `"${senderName || gmail}" <${gmail}>`,
      to: to,
      subject: subject,
    };

    if (format === 'html') {
      mailOptions.html = bodyHtml;
      mailOptions.text = bodyText;
    } else if (format === 'both') {
      mailOptions.html = bodyHtml;
      mailOptions.text = bodyText;
    } else {
      mailOptions.text = bodyText;
    }

    await transporter.sendMail(mailOptions);
    res.json({ success: true });

  } catch (err) {
    console.error(`Failed to send to ${to}:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
