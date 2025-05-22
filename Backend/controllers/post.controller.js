const sharp = require("sharp");
const { cloudinary } = require("../utils/cloudinary.js");
const { Post } = require("../models/post.model.js");
const User = require("../models/user.model.js");
const { Comment } = require("../models/comment.model.js");
const { getReceiverSocketId, io } = require("../socket/socket.js");
const { getProfile } = require("./user.controller.js");

const addNewPost = async (req, res) => {
  try {
    const { content } = req.body;
    const file = req.file;
    const authorId = req.user;

    console.log(req.body);
    console.log(req.file);
    console.log("req.user:", req.user);

    if (!file) return res.status(400).json({ message: "File required" });

    let cloudResponse;

    // تحقق من نوع الملف المستلم (ملف فعلي أو buffer)
    if (file.buffer) {
      // إذا كان الملف في شكل buffer، قم بتحويله إلى base64 ورفعه
      const fileUri = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;
      cloudResponse = await cloudinary.uploader.upload(fileUri, {
        resource_type: "auto",
      });
    } else if (file.path) {
      // إذا كان الملف تم تخزينه على القرص، استخدم دالة uploadToCloudinary
      const { uploadToCloudinary } = require("../utils/cloudinary.js");
      cloudResponse = await uploadToCloudinary(file.path);
    } else {
      return res.status(400).json({ message: "Invalid file format" });
    }

    const post = await Post.create({
      content,
      image: cloudResponse.secure_url,
      author: authorId,
    });

    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate({ path: "author", select: "-password" });

    return res.status(201).json({
      message: "New post added",
      post,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "user",
          select: "username profilePicture",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username, profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "user",
          select: "username, profilePicture",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
const getUserPostById = async (req, res) => {
  try {
    const authorId = req.params.userId;

    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "user",
          select: "username profilePicture",
        },
      });
    return res.status(200).json({
      success: true,
      data: { posts },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
const likePost = async (req, res) => {
  try {
    const likeKrneWalaUserKiId = req.user;
    const postId = req.params.id;

    // التحقق من صحة معرف المنشور
    if (!postId || !likeKrneWalaUserKiId) {
      return res.status(400).json({
        message: "معرف المنشور أو المستخدم غير صالح",
        success: false,
      });
    }

    // البحث عن المنشور وتحديثه في عملية واحدة
    const post = await Post.findByIdAndUpdate(
      postId,
      [
        {
          $set: {
            likes: {
              $cond: {
                if: { $in: [likeKrneWalaUserKiId, "$likes"] },
                then: {
                  $filter: {
                    input: "$likes",
                    as: "like",
                    cond: { $ne: ["$$like", likeKrneWalaUserKiId] },
                  },
                },
                else: { $concatArrays: ["$likes", [likeKrneWalaUserKiId]] },
              },
            },
          },
        },
      ],
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        message: "لم يتم العثور على المنشور",
        success: false,
      });
    }

    const isLiked = post.likes.includes(likeKrneWalaUserKiId);

    // إرسال إشعار فقط عند الإعجاب (وليس عند إلغاء الإعجاب)
    if (isLiked) {
      const user = await User.findById(likeKrneWalaUserKiId).select(
        "username profilePicture"
      );

      const postOwnerId = post.author.toString();
      if (postOwnerId !== likeKrneWalaUserKiId) {
        const notification = {
          type: "like",
          userId: likeKrneWalaUserKiId,
          userDetails: user,
          postId,
          message: "تم الإعجاب بمنشورك",
        };
        const postOwnerSocketId = getReceiverSocketId(postOwnerId);
        io.to(postOwnerSocketId).emit("notification", notification);
      }
    }

    return res.status(200).json({
      message: isLiked ? "تم الإعجاب" : "تم إلغاء الإعجاب",
      success: true,
      isLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("خطأ في likePost:", error);
    return res.status(500).json({
      message: "خطأ في الخادم",
      success: false,
    });
  }
};
const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentKrneWalaUserKiId =
      req.user && req.user._id ? req.user._id : req.id;
    const { text } = req.body;

    // سجل القيم المرسلة لتسهيل تتبع الأخطاء
    console.log({ postId, commentKrneWalaUserKiId, text });

    if (!text)
      return res
        .status(400)
        .json({ message: "text is required", success: false });

    const post = await Post.findById(postId);

    if (!post) {
      console.log("Post not found:", postId);
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    const comment = await Comment.create({
      content: text,
      user: commentKrneWalaUserKiId,
      post: postId,
    });

    await comment.populate({
      path: "user",
      select: "username profilePicture",
    });

    post.comments.push(comment._id);
    await post.save();

    // تجهيز البيانات بالتنسيق المتوقع من الواجهة الأمامية
    const formattedComment = {
      _id: comment._id,
      text: comment.content, // إضافة حقل text لتوافق واجهة المستخدم
      content: comment.content,
      user: comment.user,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };

    return res.status(201).json({
      message: "Comment Added",
      comment: formattedComment,
      success: true,
    });
  } catch (error) {
    console.log("Error in addComment:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;

    // جلب التعليقات المرتبطة بالـ postId
    const comments = await Comment.find({ post: postId }).populate(
      "user",
      "username profilePicture"
    );

    // تحويل البيانات لتتناسب مع الواجهة الأمامية
    const formattedComments = comments.map((comment) => ({
      _id: comment._id,
      text: comment.content, // إضافة حقل text لتوافق واجهة المستخدم
      content: comment.content,
      user: comment.user,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));

    // حتى لو كانت المصفوفة فارغة نعيد مصفوفة فارغة
    return res.status(200).json({ success: true, comments: formattedComments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", success: false });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    // check if the logged-in user is the owner of the post
    if (post.author.toString() !== authorId)
      return res.status(403).json({ message: "Unauthorized" });

    // delete post
    await Post.findByIdAndDelete(postId);

    // remove the post id from the user's post
    let user = await User.findById(authorId);
    user.posts = user.posts.filter((id) => id.toString() !== postId);
    await user.save();

    // delete associated comments
    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    const user = await User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      // already bookmarked -> remove from the bookmark
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({
        type: "unsaved",
        message: "Post removed from bookmark",
        success: true,
      });
    } else {
      // bookmark krna pdega
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      await user.save();
      return res
        .status(200)
        .json({ type: "saved", message: "Post bookmarked", success: true });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports = {
  addNewPost,
  getAllPost,
  getUserPost,
  getUserPostById,
  likePost,
  addComment,
  getCommentsOfPost,
  deletePost,
  bookmarkPost,
  getProfile,
};
