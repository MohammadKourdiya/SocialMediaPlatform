const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const config = require("../config");

// Rota koruması
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Token'ı başlıktan al
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Token kontrolü
    if (!token) {
      return res.status(401).json({ message: "Bu rotaya erişim yetkiniz yok" });
    }

    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, config.jwtSecret);

      // Kullanıcıyı token'dan al
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "Kullanıcı bulunamadı" });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Bu rotaya erişim yetkiniz yok" });
    }
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};
