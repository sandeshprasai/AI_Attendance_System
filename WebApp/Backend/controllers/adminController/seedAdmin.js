const DataBaseConnection = require("../../config/DbConfig");
const users = require("./../../models/users");
require("dotenv").config();
const bcryptjs = require("bcryptjs");

const seedAdmin = async (req, res) => {
  try {
    DataBaseConnection();
    const password = await bcryptjs.hash(process.env.ADMIN_PASSWORD, 10);

    const newAdmin = new users({
      email: process.env.ADMIN_EMAIL,
      password,
      name: process.env.ADMIN_NAME,
      role: "admin",
    });

    const existingEmail = await users.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingEmail) {
      console.log("Email already Registered");
      process.exit();
    }
    await newAdmin.save();
    console.log("Admin info Saved");
    process.exit();
  } catch (error) {
    console.error(
      `An error occoured while creating the admin account${error} `
    );
    ``;
  }
};

seedAdmin();
