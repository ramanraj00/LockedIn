const nodemailer = require("nodemailer");
const path = require("path");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendResetEmail = async (email, token) => {
  // Use frontend URL from env or fallback to localhost
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password/${token}`;
  
  try {
    const info = await transporter.sendMail({
      from: '"LockedIn" <servicelockedin@gmail.com>',
      to: email,
      subject: "LockedIn - Reset your password",

      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px; }
            .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #f3f4f6; }
            .content-wrapper { padding: 40px; }
            .header { width: 100%; }
            .header h1 { color: #0f172a; font-size: 32px; margin: 0; font-weight: 800; letter-spacing: -1px; }
            .content p { color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px; }
            .button-container { text-align: center; margin: 36px 0; }
            .button { display: inline-block; background-color: #0f172a; color: #ffffff !important; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .footer { margin-top: 40px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 24px; }
            .footer p { color: #9ca3af; font-size: 14px; line-height: 1.5; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${frontendUrl}/msg.webp" alt="LockedIn" style="width: 100%; display: block; object-fit: cover;" />
            </div>
            <div class="content-wrapper">
              <div class="content">
              <p>Hi there,</p>
              <p>We received a request to reset your password for your LockedIn account. If you didn't make this request, you can safely ignore this email.</p>
              <p>To set a new password, click the button below:</p>
              <div class="button-container">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <div style="background-color: #f3f4f6; padding: 12px; border-radius: 8px; margin-top: 12px; word-break: break-all;">
                <a href="${resetLink}" style="color: #4b5563; text-decoration: none; font-size: 13px; font-family: monospace;">${resetLink}</a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} LockedIn. All rights reserved.</p>
            </div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    // Ye line terminal me confirm karegi ki mail successfully nikal gayi
    console.log("✅ EMAIL SUCCESSFULLY GAYI! Message ID:", info.messageId);
    return info;

  } catch(err) {
    // Agar fail hui toh yahan error dikhega
    console.error("❌ Error while sending mail:", err.message);
    throw err;
  }
};

module.exports = sendResetEmail;