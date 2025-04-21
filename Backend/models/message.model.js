const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'المرسل مطلوب']
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'المستقبل مطلوب']
    },
    content: {
      type: String,
      trim: true
    },
    attachments: [{
      type: String,
      trim: true
    }],
    isRead: {
      type: Boolean,
      default: false
    },
    deletedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// إضافة فهارس لتحسين أداء البحث
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ createdAt: -1 });

// إضافة دالة لحذف الرسالة بشكل منطقي
messageSchema.methods.deleteForUser = async function(userId) {
  if (!this.deletedBy.includes(userId)) {
    this.deletedBy.push(userId);
    await this.save();
  }
  return this;
};

// إضافة دالة للتحقق مما إذا كانت الرسالة محذوفة للمستخدم
messageSchema.methods.isDeletedForUser = function(userId) {
  return this.deletedBy.includes(userId);
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 