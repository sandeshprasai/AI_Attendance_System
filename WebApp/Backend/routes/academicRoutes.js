const express = require("express");
const academicRoutes = express.Router();

// ------------------------------------------------Import Middleware ------------------------------------------------

const preventAccess = require("../middlewares/adminAccessControl");
const validateDepartment = require("../middlewares/validateDepartment");
const validateSubject = require("../middlewares/validateSubject");

// ------------------------------------------------Import Middleware Compleyed ------------------------------------------------

// ------------------------------------------------Import Controllers ------------------------------------------------

const addDepartments = require("../controllers/academicController/addDepartments");
const addSubjects = require("../controllers/academicController/addSubjects");

// ------------------------------------------------Import Controllers Completed ------------------------------------------------

academicRoutes.post("/departments", preventAccess,validateDepartment ,addDepartments);
academicRoutes.post("/subjects", preventAccess,validateSubject ,addSubjects);

module.exports = academicRoutes;
