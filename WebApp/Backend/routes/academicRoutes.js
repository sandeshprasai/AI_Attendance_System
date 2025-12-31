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
const getAllDepartments = require("../controllers/academicController/getAllDepartment")
const getAllSubjects = require("../controllers/academicController/getSubjects")

// ------------------------------------------------Import Controllers Completed ------------------------------------------------

// ------------------------------------------------All get requests ------------------------------------------------



// ------------------------------------------------All get requests Completed------------------------------------------------

academicRoutes.get("/allDepaerments", preventAccess, getAllDepartments)
academicRoutes.get("/allSubjects/",preventAccess,getAllSubjects)

// ------------------------------------------------All Post requests ------------------------------------------------

academicRoutes.post("/departments", preventAccess,validateDepartment ,addDepartments);
academicRoutes.post("/subjects", preventAccess,validateSubject ,addSubjects);

// ------------------------------------------------All Post request  completed ------------------------------------------------

module.exports = academicRoutes;
