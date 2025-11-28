const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Validate email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('⚠️  Email credentials not configured. OTP emails will fail.');
  console.warn('💡 Set EMAIL_USER and EMAIL_PASS environment variables');
}

async function sendOtpEmail(to, otp, userName) {
  const mailOptions = {
    from: `"MediTrack Hospital" <${process.env.EMAIL_USER || 'noreply@meditrack.com'}>`,
    to,
    subject: 'MediTrack Login Verification - OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">🏥 MediTrack Hospital System</h2>
        <p>Hello ${userName},</p>
        <p>Your One-Time Password (OTP) for login verification is:</p>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #667eea; font-size: 2em; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p><strong>This OTP expires in 5 minutes.</strong></p>
        <p>If you didn't request this, please contact your system administrator.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 0.9em;">MediTrack Hospital Management System</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    console.error('📧 Email config:', {
      service: 'gmail',
      user: process.env.EMAIL_USER,
      passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
    });
    console.error('🔍 Full error:', error);
    return false;
  }
}

module.exports = { sendOtpEmail };