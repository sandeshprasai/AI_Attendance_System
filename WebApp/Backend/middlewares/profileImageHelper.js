const multer = require("multer");

// Only store file in memory. Do NOT upload to Cloudinary here.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1000 * 1000 }, // 1MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      require("path").extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) return cb(null, true);
    cb("Only jpeg, jpg, png formats are supported!");
  },
}).single("ProfileImagePath");

module.exports = upload;
