const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(email, otp, name) {
  await transporter.sendMail({
    from: `SwiftDeliver <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your SwiftDeliver verification code',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px">
      <h2 style="color:#1A5CFF">📦 SwiftDeliver</h2>
      <p>Hi ${name}, your verification code is:</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1A5CFF;background:#EEF2FF;padding:16px 24px;border-radius:10px;text-align:center;margin:20px 0">${otp}</div>
      <p style="color:#888;font-size:13px">Expires in 10 minutes. Do not share this code.</p>
    </div>`
  });
}

module.exports = { generateOTP, sendOTP };
