const nodemailer = require("nodemailer");
const logger = require("../logger/logger");

const sendOtpMail = async (email, otp) => {
  try {
    logger.info("OTP mail request initiated");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `AI Attendance System <${process.env.MAIL_USERNAME}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP to reset your password is ${otp}.
Do not share this OTP with anyone.`,
    };

    await transporter.sendMail(mailOptions);
    logger.info("OTP email sent successfully");
    return true;

  } catch (error) {
    logger.error(`OTP email error | ${error.message}`);
    return false;
  }
};

module.exports = sendOtpMail;
