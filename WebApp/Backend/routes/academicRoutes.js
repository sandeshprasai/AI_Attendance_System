const express = require("express");
const academicRoutes = express.Router();

// ------------------------------------------------Import Middleware ------------------------------------------------

const preventAccess = require("../middlewares/adminAccessControl");
const validateDepartment = require("../middlewares/validateDepartment");
const validateSubject = require("../middlewares/validateSubject");
const validateClass = require("../middlewares/validateClass");

// ------------------------------------------------Import Middleware Compleyed ------------------------------------------------

// ------------------------------------------------Import Controllers ------------------------------------------------

const addDepartments = require("../controllers/academicController/addDepartments");
const addSubjects = require("../controllers/academicController/addSubjects");
const getAllDepartments = require("../controllers/academicController/getAllDepartment");
const getAllSubjects = require("../controllers/academicController/getSubjects");
const addClasses = require("../controllers/academicController/addClasses");

// ------------------------------------------------Import Controllers Completed ------------------------------------------------

// ------------------------------------------------All get requests ------------------------------------------------------------

// ------------------------------------------------All get requests Completed---------------------------------------------------

academicRoutes.get("/allDepartments", preventAccess, getAllDepartments);
academicRoutes.get("/allSubjects/", preventAccess, getAllSubjects);

// ------------------------------------------------All Post requests ------------------------------------------------

academicRoutes.post(
  "/departments",
  validateDepartment,
  addDepartments
);
academicRoutes.post("/subjects", preventAccess, validateSubject, addSubjects);
academicRoutes.post("/classes", validateClass,addClasses);

// ------------------------------------------------All Post request  completed ------------------------------------------------

module.exports = academicRoutes;
