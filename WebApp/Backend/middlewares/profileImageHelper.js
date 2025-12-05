const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Multer in-memory storage (Cloudinary does not need disk storage)
const storage = multer.memoryStorage();

const maxSize = 1 * 1000 * 1000; // 1MB limit

const uploadMiddleware = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      require("path").extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb("Error: Only jpeg, jpg, png formats are supported!");
  },
}).single("ProfileImagePath");
const upload = (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ error: err });
    if (!req.file) return next();
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "profile_images" },
      (error, result) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: "Cloudinary upload failed" });
        }
        req.body.ProfileImagePath = result.secure_url;
        req.body.CloudinaryPublicId = result.public_id;
        next();
      }
    );

    uploadStream.end(req.file.buffer);
  });
};

module.exports = upload;
