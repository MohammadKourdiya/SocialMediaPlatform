const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const config = require("./config");
const logger = require("./middlewares/logger");
const { errorHandler } = require("./middlewares/error");

// Rotaları içe aktar
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

// Uygulamayı başlat
const app = express();

// Veritabanına bağlan
mongoose
  .connect(config.mongodbUri)
  .then(() => console.log("MongoDB veritabanına bağlandı"))
  .catch((err) => console.error("Veritabanı bağlantı hatası:", err));

// Ara yazılımlar (Middleware)
app.use(helmet()); // Güvenlik
app.use(logger); // İstek günlüğü
app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
  })
);
app.use(express.json()); // JSON ayrıştırma
app.use(express.urlencoded({ extended: true })); // URL-encoded ayrıştırma

// Ana rotalar
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

// Ana sayfa
app.get("/", (req, res) => {
  res.json({
    message: "API'ye Hoş Geldiniz",
    version: "1.0.0",
  });
});

// 404 işleyici
app.use((req, res) => {
  res.status(404).json({ message: "Sayfa bulunamadı" });
});

// Hata işleyici
app.use(errorHandler);

module.exports = app;
