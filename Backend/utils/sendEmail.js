const nodemailer = require('nodemailer');

/**
 * sendEmail utility sends a styled HTML email using Nodemailer.
 * If SMTP credentials are not configured properly (default placeholder values),
 * it prints a warning and the code to the console as a fallback.
 */
const sendEmail = async (options) => {
  const isDefaultConfig = 
    !process.env.SMTP_EMAIL || 
    process.env.SMTP_EMAIL === 'your_email@gmail.com' || 
    !process.env.SMTP_PASSWORD || 
    process.env.SMTP_PASSWORD === 'your_app_password';

  if (isDefaultConfig) {
    console.warn('\n⚠️  [EMAIL CONFIG WARNING]: SMTP environment variables not configured in .env file.');
    console.log(`✉️  [SIMULATED EMAIL TO ${options.email.toUpperCase()}]:`);
    console.log(`   Subject: ${options.subject}`);
    console.log(`   OTP Code: ${options.otp}`);
    console.log('=========================================\n');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // Gorgeous Neon Dark-Theme HTML Email Template
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Placement Quest OTP Verification</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #05070c;
          color: #ffffff;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #0b0f19;
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 243, 255, 0.05);
          text-align: center;
        }
        .header {
          margin-bottom: 30px;
        }
        .logo-icon {
          font-size: 40px;
          margin-bottom: 10px;
          display: inline-block;
        }
        .logo-text {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #00F3FF;
          text-transform: uppercase;
          margin: 0;
        }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #00F3FF, transparent);
          margin: 20px 0;
        }
        h2 {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-top: 0;
        }
        p {
          font-size: 15px;
          line-height: 1.6;
          color: #94a3b8;
          margin: 15px 0;
        }
        .code-box {
          font-family: 'Courier New', Courier, monospace;
          font-size: 36px;
          font-weight: 800;
          color: #00F3FF;
          letter-spacing: 6px;
          background-color: rgba(0, 243, 255, 0.08);
          border: 1px dashed rgba(0, 243, 255, 0.4);
          border-radius: 12px;
          padding: 15px 30px;
          display: inline-block;
          margin: 25px 0;
          box-shadow: 0 0 15px rgba(0, 243, 255, 0.1);
        }
        .footer {
          margin-top: 40px;
          font-size: 12px;
          color: #475569;
        }
        .footer p {
          font-size: 12px;
          color: #475569;
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-icon">🎮</div>
          <h1 class="logo-text">Placement Quest</h1>
        </div>
        
        <div class="divider"></div>
        
        <h2>VERIFICATION SECURITY PROTOCOL</h2>
        <p>Hello Developer,</p>
        <p>We received a request to reset the password for your Placement Quest user account. Please use the following 6-digit verification code to proceed with the update:</p>
        
        <div class="code-box">${options.otp}</div>
        
        <p style="font-size: 13px; color: #e11d48; font-weight: 600;">This code is active for 10 minutes. If you did not initiate this request, please ignore this email.</p>
        
        <div class="divider"></div>
        
        <div class="footer">
          <p>This is an automated security transmission from Placement Quest Metropolis Hub.</p>
          <p>&copy; 2026 Placement Quest. All system protocols active.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: htmlTemplate
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
