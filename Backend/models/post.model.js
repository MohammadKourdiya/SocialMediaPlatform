const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String, // <-- أضف هذا السطر
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        
      },
    ],
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
    author: this.author,
    image: this.image,
    likes: this.likes,
    likesCount: this.likes.length,
    comments: this.comments,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Post = mongoose.model("Post", postSchema);
module.exports = { Post };
