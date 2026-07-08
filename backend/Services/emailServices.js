
const nodemailer = require("nodemailer");


// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

  const sendResetEmail = async (email,token) => {
  const resetLink = `http://localhost:3000/reset-password/${token}`;
    try{

  const info = await transporter.sendMail({

    from:'"LockedIn" <servicelockedin@gmail.com>',
    to:email,
    subject:"Reset your password",
    html:`
    <h3>Reset your password</h3>
  <a href="${resetLink}">Click here to reset</a>
    `
  })}
  catch(err){
    console.error("Error while sending mail:", err);
 }

  };

module.exports = sendResetEmail;