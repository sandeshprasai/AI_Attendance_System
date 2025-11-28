const DataBaseConnection = require("../../config/DbConfig");
const users = require("./../../models/users");
require("dotenv").config();
const bcryptjs = require("bcryptjs");

const seedUsers = async () => {
  try {
    DataBaseConnection();

    // Array of users to seed
    const userList = [
      {
        username: process.env.ADMIN_USER,
        password: process.env.ADMIN_PASSWORD,
        name: process.env.ADMIN_NAME,
        role: "admin",
        ProfileImagePath: "santu.jpg",
      },
      {
        username: process.env.USER1_USERNAME,
        password: process.env.USER1_PASSWORD,
        name: process.env.USER1_NAME,
        role: "admin",
        ProfileImagePath: "ProfileImagePath-1764237999077.jpg",
      },
      {
        username: process.env.USER2_USERNAME,
        password: process.env.USER2_PASSWORD,
        name: process.env.USER2_NAME,
        role: "admin",
        ProfileImagePath: "shiv.jpg",
      },
    ];

    for (const u of userList) {
      const existingUser = await users.findOne({ username: u.username });
      if (existingUser) {
        console.log(`Username ${u.username} already exists`);
        continue; // skip existing users
      }

      const hashedPassword = await bcryptjs.hash(u.password, 10);
      const newUser = new users({
        ...u,
        password: hashedPassword,
      });

      await newUser.save();
      console.log(`User ${u.username} saved successfully`);
    }

    console.log("All users seeded!");
    process.exit();
  } catch (error) {
    console.error(`Error seeding users: ${error}`);
    process.exit(1);
  }
};

seedUsers();