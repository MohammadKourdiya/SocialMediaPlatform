const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("./socket/socket");
const connectDB = require("./utils/db");

const config = require("./config/config");
const logger = require("./middlewares/logger");
const { errorHandler } = require("./middlewares/error");

// Rotaları içe aktar
const messageRoutes = require("./routes/message.route");
const postRoutes = require("./routes/post.route");
const userRoutes = require("./routes/user.route");

// Uygulamayı başlat
const app = express();
const httpServer = createServer(app);

// Veritabanına bağlan
mongoose
  .connect(config.db.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB'ye bağlandı"))
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

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

// تكوين معدل الطلبات
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد 100 طلب لكل IP
});

app.use(limiter);

// تكوين Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// تهيئة Socket.IO
initSocket(io);

// Ana rotalar

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

// المسارات

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "حدث خطأ في الخادم",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// تشغيل الخادم
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`الخادم يعمل على المنفذ ${PORT}`);
    });
  } catch (error) {
    console.error("فشل في تشغيل الخادم:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
