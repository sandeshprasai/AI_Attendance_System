const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

/**
 * Upload a buffer to Cloudinary
 * @param {Object} file - Multer file object
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Object>} - Cloudinary result
 */
const uploadBufferToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error("No file buffer provided for Cloudinary upload"));
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(new Error("Cloudinary upload failed: " + error.message));
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

module.exports = uploadBufferToCloudinary;
