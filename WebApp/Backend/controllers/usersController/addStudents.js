const students = require("./../../models/students");

const addStudents = async (req, res) => {
  console.log(req.body);
  try {
    const newStudent = new students({
      ...req.body,
    });

    const existingStudent = await students.findOne({
      RollNo: req.body.RollNo,
    });

    if (existingStudent) {
      return res
        .status(400)
        .json({ error: "Student with provided Roll No already registered " });
    }
    await newStudent.save();
    return res
      .status(200)
      .json({ success: true, message: "Student added Successfully" });
  } catch (err) {
    console.error(`An error occured while adding Student. ${err}`);
    return res.status(500).json({
      error: `An error occured while adding Student. Internal server error`,
    });
  }
};

module.exports = addStudents;
