const httpServer = require("./app");
const config = require("./config");

const cors = require("cors");

// ⚠️ إذا كنت بحاجة إلى CORS هنا، الأفضل يكون داخل app.js بدل ما تكرره
// ممكن تتجاهله هنا لأنك عرّفته مسبقاً في app.js

httpServer.listen(config.port, () => {
  console.log(
    `Sunucu ${config.port} portunda ${config.nodeEnv} modunda çalışıyor`
  );
  console.log(`Server URL: http://${config.host}:${config.port}`);
  console.log(`API Docs: http://localhost:${config.port}/api-docs`);
});
