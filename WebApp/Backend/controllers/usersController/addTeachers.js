const mongoose = require("mongoose");
const teachers = require("../../models/teachers");
const users = require("../../models/users");
const logger = require("../../logger/logger");
const bcrypt = require("bcryptjs");
const generateTeacherCredentials = require("../../middlewares/generateTeacherCredentials");
const sendCredentialsEmail = require("../../middlewares/mailCredentials");
const uploadBufferToCloudinary = require("../../middlewares/cloudinaryUpload");

const addTeachers = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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

    /* ----------------------------------------------------
       1️⃣ PRE-CHECK DUPLICATES (teachers + users)
    ---------------------------------------------------- */

    const existingTeacher = await teachers.findOne(
      { $or: [{ EmployeeId }, { Phone }, { Email }] },
      null,
      { session },
    );

    if (existingTeacher) {
      await session.abortTransaction();
      session.endSession();

      return res.status(409).json({
        success: false,
        message:
          "Teacher with same Employee ID / Phone / Email already exists",
      });
    }

    const existingUser = await users.findOne(
      { email: Email },
      null,
      { session },
    );

    if (existingUser) {
      await session.abortTransaction();
      session.endSession();

      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    /* ----------------------------------------------------
       2️⃣ PROFILE IMAGE (required)
    ---------------------------------------------------- */

    let ProfileImagePath = null;

    if (req.file?.buffer) {
      const cloudResult = await uploadBufferToCloudinary(req.file, "teachers");
      ProfileImagePath = cloudResult.secure_url;
      logger.info(`Profile image uploaded → ${ProfileImagePath}`);
    } else if (req.body.ProfileImagePath) {
      ProfileImagePath = req.body.ProfileImagePath;
      logger.info(`Profile image provided via JSON → ${ProfileImagePath}`);
    }

    if (!ProfileImagePath) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }

    /* ----------------------------------------------------
       3️⃣ CREATE TEACHER (TRANSACTION)
    ---------------------------------------------------- */

    const [newTeacher] = await teachers.create(
      [
        {
          EmployeeId,
          FullName,
          DateOfBirth,
          FullAddress,
          Phone,
          Email,
          Faculty,
          Subjects: Subject,
          JoinedYear,
          ProfileImagePath,
        },
      ],
      { session },
    );

    /* ----------------------------------------------------
       4️⃣ CREATE USER (TRANSACTION)
    ---------------------------------------------------- */

    let { username, password } = generateTeacherCredentials(
      FullName,
      newTeacher._id,
    );

    while (await users.findOne({ username })) {
      username = `${username}_${Math.floor(Math.random() * 1000)}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.create(
      [
        {
          username,
          password: hashedPassword,
          email: Email,
          name: FullName,
          role: "teacher",
          ProfileImagePath,
        },
      ],
      { session },
    );

    /* ----------------------------------------------------
       5️⃣ COMMIT TRANSACTION
    ---------------------------------------------------- */

    await session.commitTransaction();
    session.endSession();

    logger.info(`Teacher + User created → username=${username}`);

    /* ----------------------------------------------------
       6️⃣ SEND EMAIL (AFTER COMMIT)
    ---------------------------------------------------- */

    sendCredentialsEmail(Email, username, password)
      .then(() =>
        logger.info(`Credentials email sent → ${Email}`),
      )
      .catch((err) =>
        logger.warn("Failed to send credentials email:", err),
      );

    return res.status(201).json({
      success: true,
      message: "Teacher added successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error("Error while adding teacher:", error);

    /* ----------------------------------------------------
       DUPLICATE KEY SAFETY NET
    ---------------------------------------------------- */

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      const fieldMap = {
        email: "Email",
        Phone: "Phone number",
        EmployeeId: "Employee ID",
      };

      return res.status(409).json({
        success: false,
        message: `${fieldMap[field] || field} already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = addTeachers;