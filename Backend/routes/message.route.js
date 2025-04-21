const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const upload = require("../middlewares/multer");

// استيراد دوال الـ controller
const {
  sendMessage,
  getConversation,
  getConversations,
  deleteMessage,
  markAsRead,
  createGroupChat,
  updateGroupChat,
} = require("../controllers/message.controller");

// استيراد نموذج الرسالة
const Message = require("../models/message.model");

// إرسال رسالة جديدة
router.post("/send", protect, upload.array("attachments", 5), sendMessage);

// الحصول على محادثة بين مستخدمين
router.get("/conversation/:userId", protect, getConversation);

// الحصول على قائمة المحادثات
router.get("/conversations", protect, getConversations);

// حذف رسالة
router.delete("/:messageId", protect, deleteMessage);

// تحديث حالة القراءة للرسائل
router.put("/read/:userId", protect, markAsRead);

// إنشاء محادثة جماعية
router.post("/group", protect, createGroupChat);

// تحديث معلومات المحادثة الجماعية
router.put("/group/:conversationId", protect, updateGroupChat);

module.exports = router;
