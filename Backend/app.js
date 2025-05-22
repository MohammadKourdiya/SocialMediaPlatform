require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("./socket/socket");
const connectDB = require("./utils/db");
const morgan = require("morgan");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const config = require("./config");
const logger = require("./middlewares/logger");
const { errorHandler } = require("./middlewares/error");
const path = require("path");

// Rotaları içe aktar
const messageRoutes = require("./routes/message.route");
const postRoutes = require("./routes/post.route");
const userRoutes = require("./routes/user.route");

// Uygulamayı başlat
const app = express();
const httpServer = createServer(app);

// Veritabanına bağlan
mongoose
  .connect(config.db.uri)
  .then(() => console.log("MongoDB'ye bağlandı"))
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

// Ara yazılımlar (Middleware)
app.use(helmet()); // Güvenlik
app.use(logger); // İstek günlüğü
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json()); // JSON ayrıştırma
app.use(express.urlencoded({ extended: true })); // URL-encoded ayrıştırma
app.use(morgan("dev"));

// تكوين معدل الطلبات
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد 100 طلب لكل IP
});

// إضافة دعم الملفات الثابتة
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// Swagger tanımı
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sosyal Medya Platformu API",
      version: "1.0.0",
      description: "Sosyal Medya Platformu API Dokümantasyonu",
      contact: {
        name: "API Desteği",
        email: "destek@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Geliştirme Sunucusu",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"], // API rotalarının bulunduğu dizin
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Sosyal Medya API Dokümantasyonu",
  })
);

// Ana rotalar

// Ana sayfa
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// Hata işleyici
app.use(errorHandler);

// Rotaları tanımla

app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "حدث خطأ في الخادم",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});
// 404 işleyici
app.use((req, res) => {
  res.status(404).json({ message: "Sayfa bulunamadı" });
});

module.exports = httpServer;
