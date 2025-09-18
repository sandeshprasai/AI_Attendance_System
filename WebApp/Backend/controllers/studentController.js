const Student =require("../models/studentModel");

const addStudent= async(req,res)=>{
    try{
        const studentData= new Student(req.body);
        const {roll_no}=studentData;
        const existingStudent= await Student.findOne({roll_no});
        if(existingStudent){
            return res.status(400).json({message:"Student with this roll number already exists"});
        };
        const savedStudent= await studentData.save();
        res.status(201).json({message:"Student added successfully",student:savedStudent});

    }
    catch(error){
        res.status(500).json({message:"Error adding student",error:error.message});

    }

}
module.exports={addStudent};
