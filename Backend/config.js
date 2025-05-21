require("dotenv").config();

const config = {
  db: {
    uri: "mongodb://localhost:27017/socialmedia",
  },
  port: 5000,
  nodeEnv: "development",
  jwt: {
    secret: process.env.JWT_SECRET || "your_jwt_secret_key_here",
    expiresIn: "7d",
  },
  cors: {
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:5173"],
  },
  serverUrl: "http://localhost:5000",
};

// طباعة إعدادات JWT للتشخيص
console.log("إعدادات JWT:", {
  secret: config.jwt.secret ? "تم تعيين السر" : "لم يتم تعيين السر",
  expiresIn: config.jwt.expiresIn,
});

module.exports = config;
