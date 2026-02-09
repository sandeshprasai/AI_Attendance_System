const bcrypt = require("bcryptjs");
const users = require("../../models/users");
const generateOtp = require("../../middlewares/generateOpt");
const sendOtpMail = require("../../middlewares/mailOtp");
const logger = require("../../logger/logger");
const { Mongoose, default: mongoose } = require("mongoose");
const { date } = require("joi");

const resetPassword = async (req, res) => {
  const username = req.body?.username?.trim();

  if (!username) {
    logger.warn(`Missing or empty username | IP: ${req.ip} `);
    return res.status(400).json({ message: "Username is required", data: [] });
  }

  try {
    const isValidUser = await users.findOne(
      { username: username },
      { username: 1, email: 1 },
    );

    if (!isValidUser) {
      logger.warn(
        `Password reset requested for non-existing user | ${username}`,
      );
      return res.status(200).json({
        message: "If the account exists, an OTP has been sent",
        data: [],
      });
    }

    const plainOtp = generateOtp();
    const hashedOtp = await bcrypt.hash(plainOtp, 10);
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    logger.info(`Password reset initiated | User: ${username} | IP: ${req.ip}`);

    await users.updateOne(
      { _id: new mongoose.Types.ObjectId(isValidUser._id) },
      {
        otp: hashedOtp,
        otpExpiry: otpExpiry,
      },
    );

    const otpSent = await sendOtpMail(isValidUser.email, plainOtp);

    if (!otpSent) {
      logger.warn(`OTP email failed | User: ${username}`);
      return res
        .status(500)
        .json({
          message:
            "`Internal Server error while sending OTP. Please try again later `",
          data: [],
        });
    }

    return res.status(200).json({
      message: "If the account exists, an OTP has been sent",
      data: [],
    });
  } catch (error) {
    logger.error(
      `Error while resetting the password ${error} || ${error.stack}`,
    );
    return res
      .status(500)
      .json({ message: "Internal server error ", data: [] });
  }
};

module.exports = resetPassword;
