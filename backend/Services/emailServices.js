const nodemailer = require("nodemailer");

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
  // Yahan par apne React frontend ka port daalna hai (Maine 5173 set kar diya hai)
  const resetLink = `http://localhost:5173/reset-password/${token}`;
  
  try {
    const info = await transporter.sendMail({
      from: '"LockedIn" <servicelockedin@gmail.com>',
      to: email,
      subject: "LockedIn - Reset your password",
      html: `
        <h3>Reset your password</h3>
        <p>Click the link below to set a new password:</p>
        <a href="${resetLink}">Click here to reset</a>
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