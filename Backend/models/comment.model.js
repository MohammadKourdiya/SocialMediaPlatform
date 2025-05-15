const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    // المرحلة الأولى - وظائف أساسية فقط
  },
  {
    timestamps: true,
  }
);

// تحويل البيانات للعرض العام
commentSchema.methods.toJSON = function () {
  return {
    id: this._id,
    content: this.content,
    user: this.user,
    post: this.post,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Comment = mongoose.model("Comment", commentSchema);
module.exports = { Comment };
