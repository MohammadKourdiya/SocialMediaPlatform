const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "المشاركون مطلوبون"],
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      trim: true,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deletedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        deletedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// إضافة فهارس لتحسين أداء البحث
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// إضافة دالة للتحقق مما إذا كان المستخدم مشاركاً في المحادثة
conversationSchema.methods.isParticipant = function (userId) {
  return this.participants.includes(userId);
};

// إضافة دالة لحذف المحادثة بشكل منطقي
conversationSchema.methods.deleteForUser = async function (userId) {
  if (!this.deletedBy.some((d) => d.user.toString() === userId.toString())) {
    this.deletedBy.push({ user: userId });
    await this.save();
  }
  return this;
};

// إضافة دالة للتحقق مما إذا كانت المحادثة محذوفة للمستخدم
conversationSchema.methods.isDeletedForUser = function (userId) {
  return this.deletedBy.some((d) => d.user.toString() === userId.toString());
};

// إضافة دالة لتحديث آخر رسالة
conversationSchema.methods.updateLastMessage = async function (messageId) {
  this.lastMessage = messageId;
  this.lastMessageAt = Date.now();
  await this.save();
};

// إضافة دالة لزيادة عدد الرسائل غير المقروءة
conversationSchema.methods.incrementUnreadCount = async function () {
  this.unreadCount += 1;
  await this.save();
};

// إضافة دالة لإعادة تعيين عدد الرسائل غير المقروءة
conversationSchema.methods.resetUnreadCount = async function () {
  this.unreadCount = 0;
  await this.save();
};

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
