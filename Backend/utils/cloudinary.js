const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config({});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// دالة لتحميل الملفات إلى Cloudinary
exports.uploadToCloudinary = async (filePath) => {
  try {
    // التحقق من وجود الملف
    if (!fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      throw new Error(`File not found at path: ${filePath}`);
    }

    console.log(`Uploading file to Cloudinary: ${filePath}`);

    // تحميل الملف إلى Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    console.log(`Successfully uploaded to Cloudinary: ${result.secure_url}`);

    // حذف الملف المحلي بعد الرفع
    fs.unlinkSync(filePath);

    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

module.exports.cloudinary = cloudinary;
