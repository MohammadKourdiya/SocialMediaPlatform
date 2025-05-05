require("dotenv").config();

const config = {
  db: {
    uri: "mongodb://localhost:27017/socialmedia",
  },
  port: 5000,
  nodeEnv: "development",
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "7d",
  },
  cors: {
    clientUrl: process.env.CLIENT_URL || "http://localhost:19006",
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:19006"],
  },
  serverUrl: "http://localhost:5000",
};

module.exports = config;
