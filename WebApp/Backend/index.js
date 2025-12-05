const express = require("express");
const bodyparser = require("body-parser");
const authRoute = require("./routes/authRoute");
const userRouter = require("./routes/usersRoutes");
const DbConnection = require("./config/DbConfig");
require("dotenv").config();
const cors = require("cors");

const port = process.env.PORT || 5500;

const app = express();
DbConnection();

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
})
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require("path");
app.use("/public", express.static(path.join(__dirname, "public")));



app.use("/api/v1/auth/", authRoute);
app.use("/api/v1/users", userRouter);


app.listen(port, () => {
  console.log(`Server is up and running at http://localhost:${port}/ `);
});
