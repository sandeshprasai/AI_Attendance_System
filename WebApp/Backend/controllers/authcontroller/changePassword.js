const users = require("../../models/users");
const bcrypt = require("bcryptjs");

const changePassword = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Missing authorization token" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid or modified token" });
    }

    
    const { oldpassword, newpassword, confirmpassword } = req.body;

    if (!oldpassword || !newpassword || !confirmpassword) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    if (newpassword !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newpassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    
    const user = await users.findById(userId).select("password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    const isMatch = await bcrypt.compare(oldpassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    
    const hashedPassword = await bcrypt.hash(newpassword, 10);

    const updateResult = await users.updateOne(
      { _id: userId },
      { $set: { password: hashedPassword } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        message: "Failed to change password",
      });
    }

    
    return res.status(200).json({
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error("Failed to change password:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = changePassword;
