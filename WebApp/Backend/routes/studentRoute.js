const express= require("express");
const router= express.Router();
const {addStudent, getStudentData}= require("../controllers/studentController");

router.post("/add-student", addStudent);
router.get("/get-students", getStudentData);

module.exports= router;