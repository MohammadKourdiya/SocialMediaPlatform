const socketIO = require("socket.io");
const { protectSocket } = require("../middlewares/auth");

// تخزين المستخدمين المتصلين
const connectedUsers = new Map();

// تهيئة Socket.IO
const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // التحقق من المصادقة عند الاتصال
  io.use(protectSocket);

  // معالجة اتصال العميل
  io.on("connection", (socket) => {
    console.log("مستخدم متصل:", socket.user.username);

    // تخزين معرف المستخدم مع معرف الاتصال
    connectedUsers.set(socket.user._id.toString(), socket.id);

    // إرسال قائمة المستخدمين المتصلين للجميع
    io.emit("usersOnline", Array.from(connectedUsers.keys()));

    // معالجة الرسائل المباشرة
    socket.on("sendMessage", async (data) => {
      const { receiverId, content, attachments } = data;

      // التحقق من أن المستخدم المستقبل متصل
      const receiverSocketId = connectedUsers.get(receiverId);

      if (receiverSocketId) {
        // إرسال الرسالة للمستقبل
        io.to(receiverSocketId).emit("newMessage", {
          sender: socket.user._id,
          content,
          attachments,
          timestamp: new Date(),
        });
      }

      // إرسال تأكيد للمرسل
      socket.emit("messageSent", {
        receiverId,
        content,
        attachments,
        timestamp: new Date(),
      });
    });

    // معالجة حالة الكتابة
    socket.on("typing", (data) => {
      const { receiverId, isTyping } = data;
      const receiverSocketId = connectedUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          userId: socket.user._id,
          isTyping,
        });
      }
    });

    // معالجة حالة القراءة
    socket.on("markAsRead", (data) => {
      const { senderId } = data;
      const senderSocketId = connectedUsers.get(senderId);

      if (senderSocketId) {
        io.to(senderSocketId).emit("messageRead", {
          userId: socket.user._id,
        });
      }
    });

    // معالجة انقطاع الاتصال
    socket.on("disconnect", () => {
      console.log("مستخدم غير متصل:", socket.user.username);
      connectedUsers.delete(socket.user._id.toString());
      io.emit("usersOnline", Array.from(connectedUsers.keys()));
    });
  });

  return io;
};

module.exports = {
  initSocket,
  connectedUsers,
};
