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
        console.log(savedStudent);

    }
    catch(error){
        res.status(500).json({message:"Error adding student",error:error.message});

    }

}
const getStudentData =async(req,res)=>{
    try{

        const {name, roll_no, email,student_faculty, sort, page=1, limit=10}=req.query;
        //filtering
        let queryObject={};
        if(roll_no) queryObject.roll_no= roll_no;
        if(email) queryObject.email=email;
        if(name) queryObject.name={$regex:name, $options:"i"};//case insensitive, partial match
        if(student_faculty) queryObject.student_faculty=student_faculty;
       

         // Sorting
        let sortList;
        if (sort) {
        sortList = sort.split(",").join(" ");
        } else {
        sortList = "-createdAt"; // default sort
        }


        //pagination
        const pageNumber=Number(page) || 1;
        const limitNumber=Number(limit) ||10;
        const skip= (pageNumber-1)*limitNumber;

        // result=result.skip(skip).limit(limitNumber);
        //execute query
        // const students= await result;

        // Execute queries in parallel
        const [students, totalStudent] = await Promise.all([
        Student.find(queryObject).skip(skip).limit(limit).sort(sortList),
        Student.countDocuments(queryObject)
        ]);

        // Handle empty result
       if (students.length === 0) {
        return res.status(200).json({
        students: [],
        nbHits: 0,
        total: totalStudent,
        page: pageNumber,
        totalPages: 0
       });
        }
        //response
        res.status(200).json({
            students,
            nbHits: students.length,
            total:totalStudent,
            page:pageNumber,
            limit:limitNumber,
            totalPages: Math.ceil(totalStudent/limitNumber)


        });
        

    }
    catch(error){
        res.status(500).json({
            message:"Error fetching student data",
            error:error.message
        });

    }

}
module.exports={addStudent, getStudentData};
