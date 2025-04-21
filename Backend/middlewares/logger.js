const morgan = require("morgan");

// Günlük mesaj formatı
const format = ":method :url :status :response-time ms - :res[content-length]";

// İstek günlüğü oluştur
const logger = morgan(format, {
  stream: {
    write: (message) => {
      console.log(message.trim());
    },
  },
});

module.exports = logger;
