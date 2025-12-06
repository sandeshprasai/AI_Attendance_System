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
        ProfileImagePath:
          "https://res.cloudinary.com/dckkxkwcg/image/upload/v1764951407/WhatsApp_Image_2025-12-05_at_21.59.21_cd7aa9ed_qwmkjf.jpg",
      },
      {
        username: process.env.USER1_USERNAME,
        password: process.env.USER1_PASSWORD,
        name: process.env.USER1_NAME,
        role: "admin",
        ProfileImagePath:
          "https://res.cloudinary.com/dckkxkwcg/image/upload/v1764951569/WhatsApp_Image_2025-12-05_at_22.03.54_e4ee571a_zwo0gf.jpg",
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
