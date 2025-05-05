const jwt = require("jsonwebtoken");

/**
 * إنشاء توكن JWT للمستخدم
 * @param {Object} user - بيانات المستخدم
 * @param {string} user._id - معرف المستخدم
 * @param {string} user.username - اسم المستخدم
 * @param {string} user.email - البريد الإلكتروني للمستخدم
 * @returns {string} - توكن JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d", // صلاحية التوكن 30 يوم
    }
  );
};

module.exports = {
  generateToken,
};
