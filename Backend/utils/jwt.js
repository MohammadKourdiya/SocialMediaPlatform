const jwt = require("jsonwebtoken");
const config = require("../config");

/**
 * إنشاء توكن JWT للمستخدم
 * @param {Object} user - بيانات المستخدم
 * @param {string} user._id - معرف المستخدم
 * @param {string} user.username - اسم المستخدم
 * @param {string} user.email - البريد الإلكتروني للمستخدم
 * @returns {string} - توكن JWT
 */
const generateToken = (user) => {
  console.log("إنشاء توكن للمستخدم:", user);

  if (!user) {
    throw new Error("بيانات المستخدم غير صالحة");
  }

  // التحقق من وجود معرف المستخدم
  const userId = user._id || user.id;
  if (!userId) {
    throw new Error("معرف المستخدم غير موجود");
  }

  const payload = {
    id: userId.toString(),
    username: user.username,
    email: user.email,
  };

  console.log("بيانات التوكن:", payload);

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

module.exports = {
  generateToken,
};
