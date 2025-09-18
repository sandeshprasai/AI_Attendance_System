const express=require('express');
require('dotenv').config();
const PORT=process.env.PORT || 8081;
const app=express();
const connectDB=require("./config/connect");
const bodyParser = require('body-parser');
// const cors = require("cors");
app.use(express.static("public"));

// app.use(cors()); // <-- Enable CORS for all routes
app.use(express.json());
app.use(bodyParser.json());


app.get('/', (req, res)=>{
  res.send("Hello from backend🥰 ")
  
});



const start= async()=>{
    try{
        await connectDB(process.env.MONGODB_URI);
        console.log("Connected to database");
        app.listen(PORT,()=>{
            console.log(`Server is running on http://localhost:${PORT}/`);
        });
    }
    catch(error){
        console.log(error);
    }

}
start();