import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: config.SMTP_EMAIL, // your email address
    pass: config.SMTP_PASS, // your app password or real password (if not using Gmail)
  },
});

export const sendWelcomeEmail = async function (email: string) {
  const mailOptions = {
    from: '"Divakar" <onboarding@email.agent.divakar10x.com>', // From email address
    to: email,
    subject: 'Hey, I’m Divakar — Thanks for checking out Email Agent!',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <p>Hey, I’m Divakar 👋</p>
        <p>Thanks for trying out my new project — <strong>Email Agent</strong>. It took a bit of time to get here, but it’s working pretty well now!</p>
        <p>You might find some features super interesting... and some where you’ll be like “Why did he do *that*?” 😂</p>
        <p>This is the first prototype, and I’m just getting started. If you're a dev, check out the GitHub repo — I’ll be raising some issues soon, so feel free to jump in if you’re curious or want to learn.</p>
        <p>Who knows? We might end up building a SaaS together. Let’s make AI work for us. Who’s laughing now? 😎</p>
        <p>Catch you soon,<br/>Divakar</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    return { error };
  }
};
