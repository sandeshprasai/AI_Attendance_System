const mongoose =require("mongoose");

// helper function to format date
function formatDate(date) {
  if (!date) return null;
  const pad = (n) => (n < 10 ? "0" + n : n);

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}
const studentSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    roll_no:{
        type:Number,
        required:true,
        unique:true,
        validate: {
        validator: (v) => Number.isInteger(v) && v > 0,
        message: '{VALUE} is not a valid positive integer roll number'
        
  }
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    image_path:{
        type:String,
        required:true
    },
    student_faculty: {
      type: String,
      required: true,
      enum: ["civil", "ict", "humanities", "management"], // ✅ restrict to allowed faculties
    },
    createdAt:{
        type:Date,
        default:Date.now,
        get: formatDate, // 👈 format when retrieving
    }

    },
    {
        
    toJSON: { getters: true }, // ensure getters apply on JSON
    toObject: { getters: true },
  }
    
);
module.exports=mongoose.model("Student",studentSchema);