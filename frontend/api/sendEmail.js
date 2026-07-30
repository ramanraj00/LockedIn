import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ message: 'Missing email or token' });
  }

  // Use the env variables from Vercel
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const frontendUrl = "https://locked-in-five-olive.vercel.app";
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
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background-color: #ffffff; text-align: center; }
            .content { padding: 30px; color: #333333; line-height: 1.6; }
            .content h2 { color: #333333; font-size: 24px; margin-bottom: 20px; text-align: center;}
            .content p { font-size: 16px; margin-bottom: 20px; text-align: center;}
            .btn-container { text-align: center; margin-top: 30px; }
            .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; }
            .footer { background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #dddddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${frontendUrl}/msg.webp" alt="LockedIn" style="width: 100%; display: block; object-fit: cover;" />
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>Hi there,</p>
              <p>We received a request to reset your password for your LockedIn account. If you didn't make this request, you can safely ignore this email.</p>
              <p>Click the button below to set a new password:</p>
              <div class="btn-container">
                <a href="${resetLink}" class="btn">Reset Password</a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} LockedIn. All rights reserved.</p>
              <p>If you have any questions, reply to this email or contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Vercel Email Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
