const users = require("../../models/users");
const bcrypt = require("bcryptjs");

const resetPassword = async (req, res) => {
  const username = req.body?.username?.trim();
  const { otp, password, confirmPassword } = req.body;

  if (!username || !otp || !password || !confirmPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const user = await users.findOne(
      { username },
      { otp: 1, otpExpiry: 1, otpUsed: 1 }
    );

    if (!user || !user.otp || !user.otpExpiry || user.otpUsed) {
      return res.status(400).json({ message: "Invalid OTP or expired" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP or expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.updateOne(
      { username },
      {
        password: hashedPassword,
        otp: undefined,
        otpExpiry: undefined,
        otpUsed: true,
      }
    );

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error. Failed to update password",
    });
  }
};

module.exports =  resetPassword ;
