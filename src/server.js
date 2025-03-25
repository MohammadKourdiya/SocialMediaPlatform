const app = require("./app");
const config = require("./config");

const server = app.listen(config.port, () => {
  console.log(
    `Sunucu ${config.port} portunda ${config.nodeEnv} modunda çalışıyor`
  );
});

// Beklenmeyen hataları işle
process.on("unhandledRejection", (err) => {
  console.log("Beklenmeyen hata! 💥 Sunucu kapatılıyor...");
  console.error("Hata:", err);
  server.close(() => {
    process.exit(1);
  });
});

// SIGTERM sinyalini işle
process.on("SIGTERM", () => {
  console.log(
    "👋 SIGTERM sinyali alındı. Sunucu güvenli bir şekilde kapatılıyor"
  );
  server.close(() => {
    console.log("💥 İşlem sonlandırıldı!");
  });
});
