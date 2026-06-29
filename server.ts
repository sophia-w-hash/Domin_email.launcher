import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper to sanitize high-risk spam keywords automatically using safe, elegant synonyms
function sanitizeSpamKeywords(text: string): string {
  const spamMap: { [key: string]: string } = {
    "free": "complimentary",
    "guaranteed": "assured",
    "100% satisfied": "fully satisfied",
    "earn money": "generate income",
    "make money": "grow income",
    "risk-free": "secure",
    "winner": "finalist",
    "cash": "funds",
    "millions": "substantial resources",
    "crypto": "digital assets",
    "bitcoin": "blockchain asset",
    "buy now": "get access",
    "click here": "explore details",
    "income": "earnings",
    "marketing": "outreach",
    "sales": "promotional",
    "cheap": "affordable"
  };

  let sanitized = text;
  for (const [word, replacement] of Object.entries(spamMap)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitized = sanitized.replace(regex, replacement);
  }
  return sanitized;
}

// Helper to inject invisible Zero-Width Characters (legacy mode - not recommended for modern Gmail)
function injectInvisibleSpamShield(htmlContent: string): string {
  const zeroWidths = ["\u200b", "\u200c", "\u200d"];
  let result = "";
  let inTag = false;
  let inEntity = false;
  let inStyleOrScript = false;
  let tagContent = "";

  for (let i = 0; i < htmlContent.length; i++) {
    const char = htmlContent[i];

    if (char === '<') {
      inTag = true;
      tagContent = "<";
    } else if (char === '&') {
      inEntity = true;
    }

    result += char;

    if (inTag) {
      tagContent += char;
    }

    if (char === '>') {
      inTag = false;
      const lowerTag = tagContent.toLowerCase();
      if (lowerTag.startsWith("<style") || lowerTag.startsWith("<script")) {
        inStyleOrScript = true;
      } else if (lowerTag.startsWith("</style") || lowerTag.startsWith("</script")) {
        inStyleOrScript = false;
      }
    } else if (char === ';' && inEntity) {
      inEntity = false;
    }

    // Inject zero-width characters with 4% probability, ONLY outside of HTML tags, 
    // outside of style/script blocks, outside of HTML entities (&nbsp;), and outside of variables like {{variable}}
    if (
      !inTag && 
      !inStyleOrScript && 
      !inEntity && 
      char !== '{' && 
      char !== '}' && 
      char !== '<' && 
      char !== '>' && 
      char !== '&' && 
      char !== ';' && 
      Math.random() < 0.04
    ) {
      const randomZwc = zeroWidths[Math.floor(Math.random() * zeroWidths.length)];
      result += randomZwc;
    }
  }
  return result;
}

function injectInvisibleSpamShieldSubject(subjectText: string): string {
  const zeroWidths = ["\u200b", "\u200c", "\u200d"];
  let result = "";
  for (let i = 0; i < subjectText.length; i++) {
    const char = subjectText[i];
    result += char;
    // Inject with 4% probability, avoiding mustache templates to preserve variables
    if (char !== '{' && char !== '}' && Math.random() < 0.04) {
      const randomZwc = zeroWidths[Math.floor(Math.random() * zeroWidths.length)];
      result += randomZwc;
    }
  }
  return result;
}

function parseSpintax(text: string): string {
  // Recursively process Spintax {option1|option2|option3}
  const regex = /\{([^{}]+)\}/g;
  let hasSpintax = regex.test(text);
  
  while (hasSpintax) {
    text = text.replace(regex, (match, optionsString) => {
      const options = optionsString.split('|');
      const randomIndex = Math.floor(Math.random() * options.length);
      return options[randomIndex];
    });
    regex.lastIndex = 0;
    hasSpintax = regex.test(text);
  }
  return text;
}

function cleanHtmlToText(html: string): string {
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return text.replace(/\s+/g, ' ').trim();
}

// Helper to preserve newline characters (\n) by converting them to <br /> outside HTML tags
function preserveLineBreaksInHtml(html: string): string {
  const parts = html.split(/(<[^>]+>)/g);
  return parts.map((part) => {
    if (part.startsWith('<') && part.endsWith('>')) {
      return part;
    }
    return part.replace(/\r?\n/g, '<br />\n');
  }).join('');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API to test SMTP connection with Gmail app password
  app.post("/api/mail/test-connection", async (req, res) => {
    const { senderEmail, appPassword } = req.body;

    if (!senderEmail || !appPassword) {
      return res.status(400).json({ success: false, message: "Email and App Password are required" });
    }

    // Clean space from password
    const cleanedPassword = appPassword.replace(/\s+/g, "");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: cleanedPassword,
      },
    });

    try {
      await transporter.verify();
      return res.json({ success: true, message: "SMTP connection verified successfully!" });
    } catch (error: any) {
      console.error("Verification error:", error);
      return res.status(400).json({ 
        success: false, 
        message: error.message || "Failed to verify. Please check your Gmail address and 16-digit App Password." 
      });
    }
  });

  // API to send a single email (for bulk execution)
  app.post("/api/mail/send-single", async (req, res) => {
    const { senderEmail, appPassword, senderName, recipientEmail, subject, body, deliveryMode = "clean" } = req.body;

    if (!senderEmail || !appPassword || !recipientEmail || !subject || !body) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const cleanedPassword = appPassword.replace(/\s+/g, "");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: cleanedPassword,
      },
    });

    // Format body to preserve line breaks
    const processedBody = preserveLineBreaksInHtml(body);

    // Expand spintax (e.g. {Hello|Hi|Greetings})
    const spunSubject = parseSpintax(subject);
    const spunBody = parseSpintax(processedBody);

    let finalSubject = spunSubject;
    let finalBody = spunBody;

    // Process based on chosen Delivery Optimization Mode
    if (deliveryMode === "optimized_synonyms") {
      finalSubject = sanitizeSpamKeywords(spunSubject);
      finalBody = sanitizeSpamKeywords(spunBody);
    } else if (deliveryMode === "obfuscate") {
      const cleanSub = sanitizeSpamKeywords(spunSubject);
      const cleanBdy = sanitizeSpamKeywords(spunBody);
      finalSubject = injectInvisibleSpamShieldSubject(cleanSub);
      finalBody = injectInvisibleSpamShield(cleanBdy);
    }

    // Generate plain text version
    const plainTextAlternative = cleanHtmlToText(spunBody);

    // Bulletproof SMTP send retry loop with Exponential Backoff
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;

    while (attempts < maxAttempts) {
      try {
        const info = await transporter.sendMail({
          from: senderName ? `"${senderName}" <${senderEmail}>` : senderEmail,
          to: recipientEmail,
          subject: finalSubject,
          html: finalBody,
          text: plainTextAlternative, // Multi-part alternative MIME to heavily reduce spam score
          headers: {
            'MIME-Version': '1.0',
            'X-Priority': '3', // Normal Priority
            'Priority': 'normal',
            'Importance': 'Normal'
          }
        });

        return res.json({ success: true, messageId: info.messageId });
      } catch (error: any) {
        attempts++;
        lastError = error;
        if (attempts < maxAttempts) {
          // Exponential backoff wait (e.g. 1s, 2s)
          await new Promise(resolve => setTimeout(resolve, attempts * 1000));
        }
      }
    }

    console.error("Error sending email to " + recipientEmail + " after " + maxAttempts + " attempts:", lastError);
    return res.status(500).json({ success: false, message: lastError?.message || "Failed to send email after retries" });
  });

  // API to generate smart email content using Gemini API
  app.post("/api/mail/generate-content", async (req, res) => {
    const { prompt, tone, language = "English" } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create an email based on this description: "${prompt}". 
Tone: ${tone || "professional"}. 
Language: ${language}.
Output should be formatted in standard JSON with two fields: "subject" (as a string) and "body" (as a well-formatted HTML string using professional, clean layout tags such as paragraphs, bullet points, and strong bold weights, but do NOT include <html> or <body> tags, just modern HTML formatting suitable for an email body). Use variables in double curly braces like {{name}} or other custom tags if they fit, e.g., {{company}}. Do not use markdown inside JSON fields. Just return the JSON structure.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT" as any,
            properties: {
              subject: { type: "STRING" as any, description: "Eye-catching subject line" },
              body: { type: "STRING" as any, description: "Professional HTML formatted email body with tags like <p>, <br>, <strong>, <ul>, <li>" }
            },
            required: ["subject", "body"]
          }
        }
      });

      const textResult = response.text;
      if (!textResult) {
        throw new Error("No text generated from Gemini");
      }

      const parsed = JSON.parse(textResult.trim());
      return res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error("Gemini Generation Error:", error);
      return res.status(500).json({ success: false, message: error.message || "Failed to generate smart email content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
