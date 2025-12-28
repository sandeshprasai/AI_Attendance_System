const students = require("./../../models/students");
const users = require("./../../models/users");
const bcryptjs = require("bcryptjs");
const logger = require("./../../logger/logger");
const generateCredentials = require("./../../middlewares/generateCredentials");
const sendCredentialsEmail = require("./../../middlewares/mailCredentials");
const uploadToCloudinary = require("./../../middlewares/cloudinaryUpload");

const addStudents = async (req, res) => {
  logger.info(`ADD_STUDENT request received: RollNo=${req.body?.RollNo}, IP=${req.ip}`);

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
    } = req.body;

    if (!RollNo || !FullName || !Email) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    
    const existingStudent = await students.findOne({ RollNo });
    if (existingStudent) {
      logger.warn(`Student with RollNo ${RollNo} already exists`);
      return res.status(400).json({ error: "Student already registered" });
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

    const newStudent = await students.create({
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
      ProfileImagePath: profileImageUrl,
      CloudinaryPublicId: cloudinaryId,
    });

    logger.info(`Student record created: RollNo=${RollNo}, Name=${FullName}`);

    let { username, password } = generateCredentials(FullName, RollNo);

  
    while (await users.findOne({ username })) {
      username = `${username}_${Math.floor(Math.random() * 1000)}`;
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await users.create({
      username,
      password: hashedPassword,
      name: FullName,
      role: "student",
      ProfileImagePath: profileImageUrl,
      CloudinaryPublicId: cloudinaryId,
    });

    logger.info(`User account created: username=${username}`);

  
    await sendCredentialsEmail(Email, username, password);

    return res.status(200).json({
      success: true,
      message: "Student registered and user account created",
    });

  } catch (err) {
    logger.error(`Error adding student: ${err.stack || err}`);

    return res.status(500).json({
      error: "An error occurred while adding the student",
      details: err.message,
    });
  }
};

module.exports = addStudents;
