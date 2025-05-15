const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");
const config = require("../config");

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Token'ı al
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Token yoksa
    if (!token) {
      return res
        .status(401)
        .json({ message: "Token bulunamadı, erişim reddedildi" });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, config.jwt.secret);

    // Kullanıcıyı al
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Kullanıcı bulunamadı" });
    }

    // Kullanıcıyı isteğe ekle
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Geçersiz veya süresi dolmuş token" });
  }
};
