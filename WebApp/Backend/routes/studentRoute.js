const express= require("express");
const router= express.Router();
const {addStudent}= require("../controllers/studentController");

router.post("/add-student", addStudent);

module.exports= router;