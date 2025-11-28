const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  },
});

const maxSize = 1 * 1000 * 1000;

const uploadMiddleware = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(
      "Error: File upload only supports the following filetypes - " + filetypes
    );
  },
}).single("ProfileImagePath");

// ✔️ Wrap Multer so we can modify req.body
const upload = (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ error: err });

    // ✔️ If a file was uploaded, add its path to req.body
    if (req.file) {
      // req.body.ProfileImagePath = "/public/" + req.file.filename;
      //this line of code was returning wrong path in frontend that's why changed it
      req.body.ProfileImagePath = req.file.filename;
    }

    next();
  });
};

module.exports = upload;
