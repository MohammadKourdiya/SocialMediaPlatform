const multer = require("multer");
const path = require("path");

// تكوين التخزين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// تصفية الملفات المسموح بها
const fileFilter = (req, file, cb) => {
  // أنواع الملفات المسموح بها
  const allowedMimeTypes = [
    // الصور
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    // الفيديوهات
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "video/webm",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("نوع الملف غير مسموح به! يسمح بالصور والفيديوهات فقط."),
      false
    );
  }
};

// إنشاء كائن multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB كحد أقصى (زيادة الحد بسبب الفيديوهات)
  },
});

module.exports = upload;
