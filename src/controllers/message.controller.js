const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");
const User = require("../models/user.model");
const { uploadToCloudinary } = require("../utils/cloudinary");

// إرسال رسالة جديدة
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const attachments = req.files ? req.files.map((file) => file.path) : [];

    // التحقق من وجود المحادثة
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    });

    // إذا لم تكن هناك محادثة، قم بإنشاء واحدة
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
      });
    }

    // تحميل المرفقات إلى Cloudinary
    const attachmentUrls = [];
    for (const file of attachments) {
      const result = await uploadToCloudinary(file);
      attachmentUrls.push(result.secure_url);
    }

    // إنشاء الرسالة
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      attachments: attachmentUrls,
      conversation: conversation._id,
    });

    // تحديث المحادثة
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = Date.now();
    conversation.unreadCount += 1;
    await conversation.save();

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// الحصول على محادثة
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // البحث عن المحادثة
    const conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "المحادثة غير موجودة",
      });
    }

    // الحصول على الرسائل
    const messages = await Message.find({
      conversation: conversation._id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture");

    // تحديث عدد الرسائل غير المقروءة
    conversation.unreadCount = 0;
    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        conversation,
        messages: messages.reverse(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// الحصول على قائمة المحادثات
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "username profilePicture")
      .populate("lastMessage");

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// حذف رسالة
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "الرسالة غير موجودة",
      });
    }

    // التحقق من أن المستخدم هو المرسل
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "غير مصرح لك بحذف هذه الرسالة",
      });
    }

    // حذف الرسالة بشكل منطقي
    await message.deleteForUser(req.user._id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// تحديث حالة القراءة للرسائل
exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    // تحديث حالة القراءة في المحادثة
    await Conversation.updateOne(
      {
        participants: { $all: [req.user._id, userId] },
      },
      {
        unreadCount: 0,
      }
    );

    // تحديث حالة القراءة في الرسائل
    await Message.updateMany(
      {
        receiver: req.user._id,
        sender: userId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "تم تحديث حالة القراءة",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// إنشاء محادثة جماعية
exports.createGroupChat = async (req, res) => {
  try {
    const { name, participants } = req.body;

    // التحقق من عدد المشاركين
    if (participants.length < 2) {
      return res.status(400).json({
        success: false,
        error: "يجب إضافة مشاركين على الأقل",
      });
    }

    // إضافة المستخدم الحالي إلى المشاركين
    participants.push(req.user._id);

    // إنشاء المحادثة الجماعية
    const conversation = await Conversation.create({
      participants,
      isGroup: true,
      groupName: name,
      groupAdmin: req.user._id,
      groupMembers: participants,
    });

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// تحديث معلومات المحادثة الجماعية
exports.updateGroupChat = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { name, participants } = req.body;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "المحادثة غير موجودة",
      });
    }

    // التحقق من أن المستخدم هو مدير المجموعة
    if (conversation.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "غير مصرح لك بتحديث هذه المحادثة",
      });
    }

    // تحديث معلومات المحادثة
    if (name) conversation.groupName = name;
    if (participants) {
      conversation.participants = [
        ...new Set([...conversation.participants, ...participants]),
      ];
      conversation.groupMembers = conversation.participants;
    }

    await conversation.save();

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
