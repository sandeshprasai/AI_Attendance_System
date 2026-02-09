const teachers = require("../../models/teachers");
const users = require("../../models/users");
const logger = require("../../logger/logger");
const bcrypt = require("bcryptjs");
const generateTeacherCredentials = require("../../middlewares/generateTeacherCredentials");
const sendCredentialsEmail = require("../../middlewares/mailCredentials");
const uploadBufferToCloudinary = require("../../middlewares/cloudinaryUpload");

const addTeachers = async (req, res) => {
  try {
    const {
      EmployeeId,
      FullName,
      DateOfBirth,
      FullAddress,
      Phone,
      Email,
      Faculty,
      Subject,
      JoinedYear,
    } = req.body;

    logger.info(
      `ADD_TEACHER → ${EmployeeId}, ${FullName}, ${Email}, ${Faculty}, ${Subject}`,
    );

    // 🔍 Check existing teacher by EmployeeId
    const existingTeacher = await teachers.findOne({ EmployeeId });
    if (existingTeacher) {
      logger.warn(`Teacher with EmployeeId ${EmployeeId} already exists`);
      return res.status(400).json({
        success: false,
        message: "The teacher with the provided Employee ID already exists",
      });
    }

    // 📷 Profile image (REQUIRED by schema)
    let ProfileImagePath = null;

    try {
      if (req.file && req.file.buffer) {
        // If file uploaded, upload to Cloudinary
        const cloudResult = await uploadBufferToCloudinary(
          req.file,
          "teachers",
        );
        ProfileImagePath = cloudResult.secure_url;
        logger.info(`Profile image uploaded → ${ProfileImagePath}`);
      } else if (req.body.ProfileImagePath) {
        // If image URL provided in JSON, use it directly
        ProfileImagePath = req.body.ProfileImagePath;
        logger.info(`Profile image provided via JSON → ${ProfileImagePath}`);
      }

      if (!ProfileImagePath) {
        return res.status(400).json({
          success: false,
          message: "Profile image is required",
        });
      }
    } catch (err) {
      logger.error("Profile image handling failed:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to process profile image",
      });
    }

    // 🧑‍🏫 Create teacher
    const newTeacher = await teachers.create({
      EmployeeId,
      FullName,
      DateOfBirth,
      FullAddress,
      Phone,
      Email,
      Faculty,
      Subject,
      JoinedYear,
      ProfileImagePath,
    });

    // 🔐 Create user credentials
    let { username, password } = generateTeacherCredentials(
      FullName,
      newTeacher._id,
    );

    while (await users.findOne({ username })) {
      username = `${username}_${Math.floor(Math.random() * 1000)}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.create({
      username,
      password: hashedPassword,
      email: Email,
      name: FullName,
      role: "teacher",
      ProfileImagePath,
    });

    logger.info(`User created → username=${username}`);

    // 📧 Send credentials email
    const emailSent = await sendCredentialsEmail(Email, username, password);
    if (emailSent) {
      logger.info(`Credentials email sent → ${Email}`);
    } else {
      logger.warn(`Failed to send credentials email → ${Email}`);
    }

    return res.status(201).json({
      success: true,
      message: "Teacher added successfully",
    });
  } catch (error) {
    logger.error("Error while adding teacher:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = addTeachers;
