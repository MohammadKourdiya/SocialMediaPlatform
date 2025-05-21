const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const config = require("../config");

exports.protect = async (req, res, next) => {
  try {
    console.log("Middleware التحقق - Start");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    
    let token;

    // التحقق من وجود التوكن في الرأس
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("تم العثور على التوكن:", token.substring(0, 20) + "...");
    } else {
      console.log("لم يتم العثور على التوكن في الرأس");
    }

    // التحقق من وجود التوكن
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "يرجى تسجيل الدخول للوصول إلى هذه الخدمة",
      });
    }

    try {
      // التحقق من صحة التوكن
      const decoded = jwt.verify(token, config.jwt.secret);
      console.log("تم فك تشفير التوكن:", decoded);

      // البحث عن المستخدم
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        console.log("لم يتم العثور على المستخدم بالمعرف:", decoded.id);
        return res.status(401).json({
          success: false,
          message: "المستخدم غير موجود",
        });
      }

      console.log("تم العثور على المستخدم:", user.username);

      // إضافة المستخدم إلى الطلب
      req.user = user;
      next();
    } catch (error) {
      console.error("خطأ في التحقق من التوكن:", error);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى",
        });
      }
      return res.status(401).json({
        success: false,
        message: "توكن غير صالح",
      });
    }
  } catch (error) {
    console.error("خطأ في middleware المصادقة:", error);
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في المصادقة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
