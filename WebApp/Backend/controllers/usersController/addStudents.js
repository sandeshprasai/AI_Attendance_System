const students = require("./../../models/students");
const users = require("./../../models/users");
const FacultySchema = require("./../../models/department");
const SubjectSchema = require("./../../models/subjects");
const bcryptjs = require("bcryptjs");
const logger = require("./../../logger/logger");
const generateCredentials = require("./../../middlewares/generateCredentials");
const sendCredentialsEmail = require("./../../middlewares/mailCredentials");
const uploadToCloudinary = require("./../../middlewares/cloudinaryUpload");
const { default: mongoose } = require("mongoose");

const addStudents = async (req, res) => {
  logger.info(
    `ADD_STUDENT request received: RollNo=${req.body?.RollNo}, IP=${req.ip}`,
  );

  try {
    const {
      RollNo,
      FullName,
      Email,
      UniversityReg,
      FullAddress,
      Class,
      DateOfBirth,
      GuardianName,
      GuardianPhone,
      Phone,
      YearOfEnrollment,
      Faculty,
      Section,
    } = req.body;

    // Check if student already exists (check all unique fields)
    const existingStudent = await students.findOne({
      $or: [
        { RollNo },
        { Email: Email.toLowerCase() },
        { UniversityReg }
      ]
    });
    
    if (existingStudent) {
      let errorMessage = "Student already registered";
      let fieldName = "RollNo";
      
      if (existingStudent.RollNo === RollNo) {
        errorMessage = `Roll number "${RollNo}" is already registered`;
        fieldName = "RollNo";
      } else if (existingStudent.Email === Email.toLowerCase()) {
        errorMessage = `Email "${Email}" is already registered`;
        fieldName = "Email";
      } else if (existingStudent.UniversityReg === UniversityReg) {
        errorMessage = `University registration number "${UniversityReg}" is already registered`;
        fieldName = "UniversityReg";
      }
      
      logger.warn(`Duplicate student registration attempt: ${fieldName} = ${existingStudent[fieldName]}`);
      
      return res.status(400).json({ 
        error: errorMessage,
        field: fieldName
      });
    }

    logger.info("Uploading student image to Cloudinary...");

    let profileImageUrl = null;
    let cloudinaryId = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file, "students");
      profileImageUrl = uploadResult.secure_url;
      cloudinaryId = uploadResult.public_id;

      logger.info(`Uploaded Student Image: ${profileImageUrl}`);
    } else {
      logger.warn("No image uploaded for student.");
    }

    // Find faculty/department
    const facultyDoc = await FacultySchema.findOne({ DepartmentName: Faculty });
    if (!facultyDoc) {
      logger.error(`Invalid faculty selected: ${Faculty}`);
      return res.status(400).json({ error: "Invalid faculty selected" });
    }

    logger.info(`Faculty found: ${Faculty} (ID: ${facultyDoc._id})`);

    // AUTO-ASSIGN ALL SUBJECTS: Fetch all subjects for this faculty/department
    const subjectDocs = await SubjectSchema.find({
      DepartmentID: facultyDoc._id,
    });

    if (!subjectDocs || subjectDocs.length === 0) {
      logger.error(`No subjects found for faculty: ${Faculty}`);
      return res.status(400).json({
        error:
          "No subjects available for the selected faculty. Please add subjects to this department first.",
      });
    }

    // Extract all subject IDs
    const subjectIds = subjectDocs.map((s) => s._id);
    logger.info(
      `Auto-assigned ${subjectIds.length} subjects to student from faculty ${Faculty}`,
    );

    // Create student record with all subjects from the faculty
    const newStudent = await students.create({
      RollNo,
      FullName,
      Email,
      UniversityReg,
      FullAddress,
      Classroom: Class,
      DateOfBirth,
      GuardianName,
      GuardianPhone,
      Phone,
      YearOfEnrollment,
      Subjects: subjectIds, // All subjects from the faculty
      Faculty: facultyDoc._id,
      Section,
      ProfileImagePath: profileImageUrl,
      CloudinaryPublicId: cloudinaryId,
    });

    logger.info(`Student record created: RollNo=${RollNo}, Name=${FullName}`);

    // Generate credentials
    let { username, password } = generateCredentials(FullName, RollNo);

    // Ensure unique username
    while (await users.findOne({ username })) {
      username = `${username}_${Math.floor(Math.random() * 1000)}`;
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user account
    await users.create({
      username,
      password: hashedPassword,
      email: Email,
      name: FullName,
      role: "student",
      ProfileImagePath: profileImageUrl,
      CloudinaryPublicId: cloudinaryId,
    });

    logger.info(`User account created: username=${username}`);

    // Send credentials via email
    await sendCredentialsEmail(Email, username, password);

    return res.status(200).json({
      success: true,
      message: "Student registered and user account created",
      subjectsAssigned: subjectIds.length,
    });
  } catch (err) {
    console.log(err);
    logger.error(`Error adding student: ${err.stack || err}`);

    // Handle MongoDB duplicate key error (code 11000)
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern || {})[0];
      const duplicateValue = err.keyValue?.[duplicateField];
      
      logger.warn(
        `Duplicate key error on field: ${duplicateField}, value: ${duplicateValue}`
      );

      let errorMessage = "This record already exists";
      let fieldName = duplicateField;

      // Create user-friendly messages based on the field
      switch (duplicateField) {
        case "Email":
          errorMessage = `Email "${duplicateValue}" is already registered`;
          fieldName = "Email";
          break;
        case "RollNo":
          errorMessage = `Roll number "${duplicateValue}" is already registered`;
          fieldName = "RollNo";
          break;
        case "UniversityReg":
          errorMessage = `University registration number "${duplicateValue}" is already registered`;
          fieldName = "UniversityReg";
          break;
        case "Phone":
          errorMessage = `Phone number "${duplicateValue}" is already registered`;
          fieldName = "Phone";
          break;
        default:
          errorMessage = `${duplicateField} "${duplicateValue}" already exists`;
      }

      return res.status(400).json({
        error: errorMessage,
        field: fieldName,
        value: duplicateValue,
      });
    }

    return res.status(500).json({
      error: "An error occurred while adding the student",
      details: err.message,
    });
  }
};

module.exports = addStudents;
