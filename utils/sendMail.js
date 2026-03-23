import nodemailer from 'nodemailer';

const sendMail = async (email, url, subject) => {
  try {
    let html;
    if (subject === 'Email') {
      html = `<h2>${subject} Verification</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${url}">Verify email</a>
        <p>This link expires in 10 minutes.</p> `;
    } else if (subject === 'Password') {
      html = `<h2>${subject} Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${url}">Reset your password</a>
        <p>This link expires in 10 minutes.</p> `;
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'Fail',
      message: 'Server error',
    });
  }
};

export { sendMail };
