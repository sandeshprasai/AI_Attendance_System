const express = require("express");
const academicClassRoutes = express.Router();

// ------------------------------------------------Import Middleware ------------------------------------------------
const preventAccess = require("../middlewares/adminAccessControl");
const validateAcademicClass = require("../middlewares/validateAcademicClass");

// ------------------------------------------------Import Controllers ------------------------------------------------
const createAcademicClass = require("../controllers/AcademicClass/createClass");
const {
  getAllAcademicClasses,
  getAcademicClassById,
  updateAcademicClassStatus,
  getAvailableClassrooms,
  getSubjectsByDepartment,
  getTeachersByDepartment,
  getStudentsByDepartment,
} = require("../controllers/AcademicClass/academicHelpers");

// ------------------------------------------------Helper Routes (GET Resources) ------------------------------------------------
academicClassRoutes.get("/classrooms", preventAccess, getAvailableClassrooms);
academicClassRoutes.get("/subjects", preventAccess, getSubjectsByDepartment);
academicClassRoutes.get("/teachers", preventAccess, getTeachersByDepartment);
academicClassRoutes.get("/students", preventAccess, getStudentsByDepartment);

// ------------------------------------------------Academic Class CRUD Routes ------------------------------------------------
academicClassRoutes.post("/", preventAccess, validateAcademicClass, createAcademicClass);
academicClassRoutes.get("/", preventAccess, getAllAcademicClasses);
academicClassRoutes.get("/:id", preventAccess, getAcademicClassById);
academicClassRoutes.patch("/:id/status", preventAccess, updateAcademicClassStatus);

module.exports = academicClassRoutes;
