const Post = require("../models/post.model");
const User = require("../models/user.model");
const { uploadToCloudinary } = require("../utils/cloudinary");

// إنشاء منشور جديد
exports.createPost = async (req, res) => {
  try {
    const { content, location, privacyLevel } = req.body;
    const media = req.files ? req.files.map((file) => file.path) : [];

    // تحميل الملفات إلى Cloudinary
    const mediaUrls = [];
    for (const file of media) {
      const result = await uploadToCloudinary(file);
      mediaUrls.push(result.secure_url);
    }

    const post = await Post.create({
      content,
      location,
      privacyLevel: privacyLevel || "public",
      user: req.user._id,
      media: mediaUrls,
    });

    // إضافة المنشور إلى منشورات المستخدم
    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: post._id },
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// الحصول على منشورات التغذية
exports.getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // الحصول على أصدقاء المستخدم
    const user = await User.findById(req.user._id);
    const friends = user.friends;

    const posts = await Post.find({
      $or: [
        { user: req.user._id },
        {
          user: { $in: friends },
          privacyLevel: { $in: ["public", "friends"] },
        },
        { privacyLevel: "public" },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profilePicture")
      .populate("likes", "username profilePicture")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username profilePicture",
        },
      });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// الحصول على منشورات مستخدم معين
exports.getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.params.userId };

    // إذا كان المستخدم غير مسجل الدخول، يرى المنشورات العامة فقط
    if (!req.user) {
      query.privacyLevel = "public";
    } else if (req.user._id.toString() !== req.params.userId) {
      // إذا كان المستخدم يرى منشورات شخص آخر
      const user = await User.findById(req.params.userId);
      if (!user.friends.includes(req.user._id)) {
        query.privacyLevel = "public";
      } else {
        query.privacyLevel = { $in: ["public", "friends"] };
      }
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profilePicture")
      .populate("likes", "username profilePicture")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username profilePicture",
        },
      });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// الحصول على منشور واحد
exports.getPost = async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // إذا كان المستخدم غير مسجل الدخول، يرى المنشورات العامة فقط
    if (!req.user) {
      query.privacyLevel = "public";
    } else {
      const post = await Post.findById(req.params.id);
      if (post.user.toString() !== req.user._id.toString()) {
        const user = await User.findById(post.user);
        if (!user.friends.includes(req.user._id)) {
          query.privacyLevel = "public";
        } else {
          query.privacyLevel = { $in: ["public", "friends"] };
        }
      }
    }

    const post = await Post.findOne(query)
      .populate("user", "username profilePicture")
      .populate("likes", "username profilePicture")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username profilePicture",
        },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "المنشور غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// تحديث منشور
exports.updatePost = async (req, res) => {
  try {
    const { content, location, privacyLevel } = req.body;
    const media = req.files ? req.files.map((file) => file.path) : [];

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "المنشور غير موجود",
      });
    }

    // التحقق من أن المستخدم هو صاحب المنشور
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "غير مصرح لك بتحديث هذا المنشور",
      });
    }

    // تحميل الملفات الجديدة إلى Cloudinary
    const mediaUrls = [];
    for (const file of media) {
      const result = await uploadToCloudinary(file);
      mediaUrls.push(result.secure_url);
    }

    // تحديث المنشور
    post.content = content || post.content;
    post.location = location || post.location;
    post.privacyLevel = privacyLevel || post.privacyLevel;
    post.media = mediaUrls.length > 0 ? mediaUrls : post.media;

    await post.save();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// حذف منشور
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "المنشور غير موجود",
      });
    }

    // التحقق من أن المستخدم هو صاحب المنشور
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "غير مصرح لك بحذف هذا المنشور",
      });
    }

    // حذف المنشور من منشورات المستخدم
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { posts: post._id },
    });

    await post.remove();

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

// الإعجاب/إلغاء الإعجاب بمنشور
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "المنشور غير موجود",
      });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      // إضافة إعجاب
      post.likes.push(req.user._id);
    } else {
      // إزالة إعجاب
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        likes: post.likes,
        likeCount: post.likes.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
