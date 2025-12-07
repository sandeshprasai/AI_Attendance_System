const teachers = require("../../models/teachers");
const users = require("../../models/users");
const logger = require("../../logger/logger");
const bcrypt = require("bcryptjs");
const generateTeacherCredentials = require("../../middlewares/generateTeacherCredentials");
const sendCredentialsEmail = require("../../middlewares/mailCredentials");
const uploadBufferToCloudinary = require("../../middlewares/cloudinaryUpload");

const addTeachers = async (req, res) => {
  try {
    const { FullName, Email, Phone, Departments, AssignedClass = [] } = req.body;

    logger.info(
      `ADD_TEACHER request → ${FullName}, ${Email}, ${Phone}, ${Departments}, ${AssignedClass}`
    );


    const existingTeacher = await teachers.findOne({ Email });
    if (existingTeacher) {
      logger.warn(`Teacher with email ${Email} already exists`);
      return res.status(400).json({
        success: false,
        message: "The teacher with the provided Email already exists",
      });
    }

  
    let ProfileImagePath = null;
    let CloudinaryPublicId = null;

    if (req.file && req.file.buffer) {
      try {
        const cloudResult = await uploadBufferToCloudinary(req.file, "teachers");
        ProfileImagePath = cloudResult.secure_url;
        CloudinaryPublicId = cloudResult.public_id;
        logger.info(`Image uploaded to Cloudinary: ${ProfileImagePath}`);
      } catch (err) {
        logger.error("Cloudinary upload failed:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile image",
        });
      }
    }

    const newTeacher = await teachers.create({
      FullName,
      Email,
      Phone,
      Departments,
      AssignedClass,
      ProfileImagePath,
      CloudinaryPublicId,
    });

    let { username, password } = generateTeacherCredentials(FullName, newTeacher._id);
    while (await users.findOne({ username })) {
      username = `${username}_${Math.floor(Math.random() * 1000)}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.create({
      username,
      password: hashedPassword,
      name: FullName,
      role: "teacher",
      ProfileImagePath,
      CloudinaryPublicId,
    });

    logger.info(`User account created for teacher → username=${username}`);

  
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
