const students = require("./../../models/students");
const generateCredentials = require("./../../middlewares/generateCredentials");
const sendCredentialsEmail = require("./../../middlewares/mailCredentials");
const bcryptjs = require("bcryptjs");
const users = require("./../../models/users");
const mongoose = require("mongoose");

const addStudents = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingStudent = await students.findOne(
      { RollNo: req.body.RollNo },
      null,
      { session }
    );

    if (existingStudent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Student with provided Roll No already registered",
      });
    }

    const newStudent = new students({ ...req.body });
    let { username, password } = generateCredentials(
      newStudent.FullName,
      newStudent.RollNo
    );
    const userExists = await users.findOne({ username: username }, null, {
      session,
    });
    if (userExists) {
      username = `${username}_${Math.floor(Math.random() * 1000)}`;
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await newStudent.save({ session });
    await users.create(
      [
        {
          username: username,
          password: hashedPassword,
          name: newStudent.FullName,
          role: "student",
        },
      ],
      { session }
    );
    const emailSent = await sendCredentialsEmail(
      newStudent.Email,
      username,
      password
    );

    if (!emailSent) {
      throw new Error("Failed to send credentials email");
    }
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Student registered and user account created",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(`Error while adding student: ${err.stack} || ${err}`);
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        error: `Duplicate value for field '${duplicateField}'.`,
      });
    }
    return res.status(500).json({
      error:
        "An error occurred while adding student. All changes were rolled back.",
    });
  }
};

module.exports = addStudents;
