const students = require("./../../models/students");
const generateCredentials = require("./../../middlewares/generateCredentials");
const sendCredentialsEmail = require("./../../middlewares/mailCredentials");
const bcryptjs = require("bcryptjs");
const users = require("./../../models/users");
const logger = require("./../../logger/logger"); // Import Winston logger

const addStudents = async (req, res) => {
  const { RollNo, FullName, Email, ProfileImagePath } = req.body;

  logger.info(`ADD_STUDENT request received: RollNo=${RollNo}, FullName=${FullName}, IP=${req.ip}`);

  try {
    // Check if student exists
    const existingStudent = await students.findOne({ RollNo });
    if (existingStudent) {
      logger.warn(`ADD_STUDENT failed: RollNo ${RollNo} already registered`);
      return res.status(400).json({
        error: "Student with provided Roll No already registered",
      });
    }

    // Create new student instance
    const newStudent = new students({ ...req.body });
    let { username, password } = generateCredentials(FullName, RollNo);

    // Ensure unique username
    const userExists = await users.findOne({ username });
    if (userExists) {
      const oldUsername = username;
      username = `${username}_${Math.floor(Math.random() * 1000)}`;
      logger.info(`Username conflict resolved: ${oldUsername} -> ${username}`);
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    // Save student to DB
    await newStudent.save();
    logger.info(`Student record created: RollNo=${RollNo}, Name=${FullName}`);

    // Create associated user
    await users.create({
      username,
      password: hashedPassword,
      name: FullName,
      role: "student",
      ProfileImagePath,
    });
    logger.info(`User account created for student: username=${username}`);

    // Send credentials email
    const emailSent = await sendCredentialsEmail(Email, username, password);
    if (emailSent) {
      logger.info(`Credentials email sent successfully to ${Email}`);
    } else {
      logger.warn(`Failed to send credentials email to ${Email}`);
    }

    return res.status(200).json({
      success: true,
      message: "Student registered and user account created",
    });

  } catch (err) {
    logger.error(`Error while adding student: ${err.stack || err}`);

    // Duplicate key error
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern)[0];
      logger.warn(`ADD_STUDENT duplicate key error on field '${duplicateField}'`);
      return res.status(400).json({
        error: `Duplicate value for field '${duplicateField}'.`,
      });
    }

    // Generic server error
    return res.status(500).json({
      error: "An error occurred while adding student.",
    });
  }
};

module.exports = addStudents;
