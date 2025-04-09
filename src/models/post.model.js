const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
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
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // المرحلة الأولى - وظائف أساسية فقط
  },
  {
    timestamps: true,
  }
);

// تحويل البيانات للعرض العام
postSchema.methods.toJSON = function () {
  return {
    id: this._id,
    content: this.content,
    user: this.user,
    likes: this.likes,
    likesCount: this.likes.length,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
