const teachers = require("../../models/teachers");
const users = require("../../models/users");
const logger = require("./../../logger/logger");
const generateTeacherCredentials = require("../../middlewares/generateTeacherCredentials");
const bcrypt = require("bcryptjs");
const sendCredentialsEmail = require("../../middlewares/mailCredentials");

const addTeachers = async (req, res) => {
  try {
    const {
      FullName,
      Email,
      Phone,
      Departments,
      AssignedClass = [],
      ProfileImagePath,
      CloudinaryPublicId,
    } = req.body;

    logger.info(
      `Received Teacher → ${FullName}, ${Email}, ${Phone}, ${Departments}, ${AssignedClass}, ${ProfileImagePath}`
    );

    const existingTeacher = await teachers.findOne({ Email });
    if (existingTeacher) {
      logger.warn(`Teacher with email ${Email} already exists`);
      return res.status(400).json({
        success: false,
        message: "The teacher with the provided Email already exists",
      });
    }

    const newTeacher = new teachers({
      FullName,
      Email,
      Phone,
      Departments,
      AssignedClass,
      ProfileImagePath,
      CloudinaryPublicId,
    });
    await newTeacher.save();

    let { username, password } = generateTeacherCredentials(
      FullName,
      newTeacher._id
    );

    let isUnique = false;
    while (!isUnique) {
      const userExists = await users.findOne({ username });
      if (!userExists) {
        isUnique = true; // username is free
      } else {
        const oldUsername = username;
        username = `${username}_${Math.floor(Math.random() * 1000)}`;
        logger.info(
          `Username conflict resolved: ${oldUsername} -> ${username}`
        );
      }
    }
    await newTeacher.save();
    const hashedPassword = await bcrypt.hash(password, 10);
    await users.create({
      username,
      password: hashedPassword,
      name: FullName,
      role: "teacher",
      ProfileImagePath,
      CloudinaryPublicId,
    });

    logger.info(`User account created for teacher: username=${username}`);

    const emailSent = await sendCredentialsEmail(Email, username, password);
    if (emailSent) {
      logger.info(`Credentials email sent successfully to ${Email}`);
    } else {
      logger.warn(`Failed to send credentials email to ${Email}`);
    }

    return res.status(201).json({
      success: true,
      message: "Teacher added successfully",
    });
  } catch (error) {
    logger.error("Error while adding teacher: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = addTeachers;
