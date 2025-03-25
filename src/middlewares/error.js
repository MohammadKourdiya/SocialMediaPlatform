// Hata işleme
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Veri doğrulama hatası
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      message: "Veri doğrulama hatası",
      errors: messages,
    });
  }

  // Tekrarlanan veri hatası
  if (err.code === 11000) {
    return res.status(400).json({
      message: "Bu veri zaten mevcut",
      field: Object.keys(err.keyPattern)[0],
    });
  }

  // JWT hatası
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Geçersiz token",
    });
  }

  // JWT süre dolumu hatası
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token süresi doldu",
    });
  }

  // Varsayılan hata
  res.status(500).json({
    message: "Sunucu hatası",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
