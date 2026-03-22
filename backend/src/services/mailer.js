const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function sendUnlockEmail(toEmail, recipientName, senderName) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`📧 Email skipped (SMTP not configured) for ${toEmail}`)
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Georgia', serif; background: #FFF8F0; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #F59E0B, #F43F5E); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 8px 0 0; opacity: 0.9; }
        .body { padding: 40px 30px; }
        .body h2 { color: #1E1B4B; font-size: 22px; }
        .body p { color: #555; line-height: 1.7; }
        .cta { display: block; margin: 28px auto; width: fit-content; padding: 14px 32px; background: linear-gradient(135deg, #F59E0B, #F43F5E); color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; }
        .footer { text-align: center; padding: 20px; color: #aaa; font-size: 13px; border-top: 1px solid #f5e6d0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="font-size:48px; margin-bottom:10px">🎁</div>
          <h1>Your Time Capsule Has Unlocked!</h1>
          <p>A message from the past — just for you</p>
        </div>
        <div class="body">
          <h2>Dear ${recipientName},</h2>
          <p>
            The moment has finally arrived. A time capsule created by 
            <strong>${senderName || 'your batch'}</strong> has been unlocked and is now waiting for you to open it.
          </p>
          <p>
            This message was written years ago, from a chapter of life that now lives only in memories.
            Open it with the same emotions they wrote it with. 💙
          </p>
          <a class="cta" href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/capsules">
            Open Your Time Capsule →
          </a>
          <p style="font-size: 13px; color: #999; margin-top: 20px; text-align: center;">
            "They thought of you, always."
          </p>
        </div>
        <div class="footer">
          TimeCapsule Memories · Made with ❤️ for the memories that matter.
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"TimeCapsule Memories" <${process.env.FROM_EMAIL}>`,
      to: toEmail,
      subject: '🎁 Your Time Capsule Has Unlocked!',
      html,
    })
    console.log(`📧 Unlock email sent to ${toEmail}`)
  } catch (err) {
    console.error(`Failed to send email to ${toEmail}:`, err.message)
  }
}

async function sendPasswordResetEmail(toEmail, resetLink) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`📧 Rest email skipped (SMTP not configured) for ${toEmail}. Link: ${resetLink}`)
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Georgia', serif; background: #FFF8F0; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #4F46E5, #0ea5e9); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .body { padding: 40px 30px; text-align: center; }
        .body p { color: #555; line-height: 1.7; }
        .cta { display: inline-block; margin: 28px auto; padding: 14px 32px; background: linear-gradient(135deg, #4F46E5, #0ea5e9); color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; }
        .footer { text-align: center; padding: 20px; color: #aaa; font-size: 13px; border-top: 1px solid #f5e6d0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="font-size:48px; margin-bottom:10px">🔐</div>
          <h1>Password Reset</h1>
        </div>
        <div class="body">
          <p>We received a request to reset your password for TimeCapsule Memories.</p>
          <p>Click the button below to choose a new password. This link will expire in 1 hour.</p>
          <a class="cta" href="${resetLink}">Reset Password →</a>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          TimeCapsule Memories
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"TimeCapsule Memories" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: toEmail,
      subject: '🔐 Reset your TimeCapsule password',
      html,
    })
    console.log(`📧 Password reset email sent to ${toEmail}`)
  } catch (err) {
    console.error(`Failed to send reset email to ${toEmail}:`, err.message)
  }
}

async function sendTeaserEmail(toEmail, recipientName, senderName, yearsLeft) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`📧 Teaser email skipped (SMTP not configured) for ${toEmail}`)
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Georgia', serif; background: #FFF8F0; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .body { padding: 40px 30px; text-align: center; }
        .body p { color: #555; line-height: 1.7; font-size: 16px; }
        .number { font-size: 48px; font-weight: bold; color: #059669; margin: 20px 0; display: block; }
        .footer { text-align: center; padding: 20px; color: #aaa; font-size: 13px; border-top: 1px solid #f5e6d0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="font-size:48px; margin-bottom:10px">⏳</div>
          <h1>It's Safe and Sound!</h1>
        </div>
        <div class="body">
          <p>Hi ${recipientName},</p>
          <p>Just a quick update from the past! The time capsule created by <strong>${senderName || 'your batch'}</strong> is still locked securely in our vault.</p>
          <p>It will open in exactly...</p>
          <span class="number">${yearsLeft} Year${yearsLeft > 1 ? 's' : ''}</span>
          <p>We'll keep it safe until the day arrives. See you then!</p>
        </div>
        <div class="footer">
          TimeCapsule Memories
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"TimeCapsule Memories" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: toEmail,
      subject: '⏳ Your Time Capsule Anniversary!',
      html,
    })
    console.log(`📧 Teaser email sent to ${toEmail}`)
  } catch (err) {
    console.error(`Failed to send teaser email to ${toEmail}:`, err.message)
  }
}

module.exports = { sendUnlockEmail, sendPasswordResetEmail, sendTeaserEmail }
