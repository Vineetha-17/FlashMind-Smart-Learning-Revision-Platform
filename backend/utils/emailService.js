const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.log('Nodemailer: EMAIL_USER or EMAIL_PASS not configured in environment. Skipping email dispatch.');
      return null;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"FlashMind Learning Platform" <${user}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Nodemailer: Email sent successfully! MessageId:', info.messageId);
    return info;
  } catch (error) {
    console.error('Nodemailer Error sending email:', error.message);
    return null;
  }
};

const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to FlashMind! 🦉';
  const text = `Hi ${name},\n\nRegistered Successfully to FlashMind!\n\nWe are thrilled to help you master any subject and forget nothing. Start creating subjects and reviewing your flashcards using spaced repetition today.\n\nHappy Learning!\nThe FlashMind Team`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 12px; background-color: #fafafa;">
      <h2 style="color: #4f46e5; text-align: center;">Welcome to FlashMind! 🦉</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p style="font-size: 16px; font-weight: bold; color: #10b981; text-align: center;">Registered Successfully to FlashMind!</p>
      <p>We are thrilled to have you join our active recall and smart learning community.</p>
      <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #4f46e5;">Get Started Today:</h4>
        <ul style="padding-left: 20px; font-size: 14px; line-height: 1.5;">
          <li>Create custom subject decks.</li>
          <li></li>
          <li>Build visual learning paths for any technology.</li>
          <li>Self-test with our active-recall revision mode.</li>
        </ul>
      </div>
      <p style="font-size: 14px; color: #64748b;">Happy learning! Keep your streaks alive and boost your knowledge.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; text-align: center; color: #94a3b8;">&copy; 2026 FlashMind Inc. All Rights Reserved.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

const sendDailyReminderEmail = async (email, name, dueCount, weakTopic, streak) => {
  const subject = `Your FlashMind Daily Revision Summary! 🦉`;
  const text = `Hi ${name},\n\nYou have ${dueCount} cards due today.\nYour weak area is ${weakTopic || 'general topics'}.\nKeep your ${streak}-day streak alive!\n\nLog in now to study!`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; background-color: #fafafa;">
      <h2 style="color: #4f46e5;">Daily Learning Check-in 🦉</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Here is your daily study status report to keep you on track:</p>
      
      <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0; display: flex; flex-direction: column; gap: 10px;">
        <p style="margin: 0; font-size: 15px;">⏳ Revisions Due Today: <strong style="color: #ef4444;">${dueCount}</strong></p>
        <p style="margin: 0; font-size: 15px;">⚠️ Current Focus/Weak Topic: <strong style="color: #f59e0b;">${weakTopic || 'No weak areas identified! Keep it up!'}</strong></p>
        <p style="margin: 0; font-size: 15px;">🔥 Streak Status: <strong style="color: #f97316;">${streak} Days Active</strong></p>
      </div>

      <p style="font-size: 15px; font-weight: bold; text-align: center; margin: 25px 0;">
        <a href="http://localhost:5173/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Start Reviewing Now
        </a>
      </p>

      <p style="font-size: 13px; color: #64748b; font-style: italic; text-align: center;">
        "Consistent learning of 5-10 minutes daily outperforms 3 hours of cramming."
      </p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 11px; text-align: center; color: #94a3b8;">
        To unsubscribe from daily email summaries, update your notification settings in your Profile Page.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendWelcomeEmail,
  sendDailyReminderEmail,
};

