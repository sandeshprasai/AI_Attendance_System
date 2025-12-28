const nodemailer = require("nodemailer"); // fix typo
require("dotenv").config();

const sendCredentialsEmail = async (email, username, password) => {
  try {
   
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: process.env.MAIL_USERNAME, 
        pass: process.env.APP_PASSWORD, 
      },
    });

    // 2. Mail options
    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: email,
      subject: "Hello From AI Attendance System",
      text: `Your account has been created.\n\nUsername: ${username}\nPassword: ${password}\n\nPlease login and change your password.`,
    };

    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error);
    return false;
  }
};

module.exports = sendCredentialsEmail;
