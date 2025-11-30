const students = require("./../../models/students");
const generateCredentials = require("./../../middlewares/generateCredentials");
const sendCredentialsEmail = require("./../../middlewares/mailCredentials");
const bcryptjs = require("bcryptjs");
const users = require("./../../models/users");

const addStudents = async (req, res) => {
  try {
    // Check for existing student by RollNo
    const existingStudent = await students.findOne({ RollNo: req.body.RollNo });
    if (existingStudent) {
      return res.status(400).json({
        error: "Student with provided Roll No already registered",
      });
    }

    // Create new student
    const newStudent = new students({ ...req.body });
    let { username, password } = generateCredentials(
      newStudent.FullName,
      newStudent.RollNo
    );

    // Ensure unique username
    const userExists = await users.findOne({ username });
    if (userExists) {
      username = `${username}_${Math.floor(Math.random() * 1000)}`;
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    await newStudent.save();

    // Create associated user
    await users.create({
      username,
      password: hashedPassword,
      name: newStudent.FullName,
      role: "student",
      ProfileImagePath: req.body.ProfileImagePath,
    });

    // Send credentials email
    const emailSent = await sendCredentialsEmail(newStudent.Email, username, password);
    if (!emailSent) {
      console.warn("Failed to send credentials email");
    }

    return res.status(200).json({
      success: true,
      message: "Student registered and user account created",
    });

  } catch (err) {
    console.error(`Error while adding student: ${err.stack} || ${err}`);

    // Duplicate key error
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern)[0];
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