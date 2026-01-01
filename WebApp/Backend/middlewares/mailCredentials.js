const nodemailer = require("nodemailer");
require("dotenv").config();

const sendCredentialsEmail = async (email, username, password) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,          // IMPORTANT
      secure: false,      // IMPORTANT
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"AI Attendance System" <${process.env.MAIL_USERNAME}>`,
      to: email,
      subject: "Hello From AI Attendance System",
      text: `Your account has been created.

Username: ${username}
Password: ${password}

Please login and change your password.`
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email error:", error.message);
    return false;
  }
};

module.exports = sendCredentialsEmail;
