const User = require("../models/user.model.js");
const { generateToken } = require("../utils/jwt.js");
const { uploadToCloudinary } = require("../utils/cloudinary.js");

// تسجيل مستخدم جديد
const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // التحقق من وجود جميع الحقول المطلوبة
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "جميع الحقول مطلوبة",
      });
    }

    // تحقق من تطابق كلمتي المرور
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "كلمات المرور غير متطابقة",
      });
    }

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل",
      });
    }

    // إنشاء مستخدم جديد
    const user = await User.create({
      username,
      email,
      password,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "حدث خطأ أثناء إنشاء المستخدم",
      });
    }

    // إنشاء التوكن
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "مرحباً بك في منصتنا الاجتماعية!",
      data: {
        user: {
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// تسجيل الدخول
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // التحقق من وجود المستخدم وكلمة المرور
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: "The email or password is incorrect",
      });
    }

    // إنشاء التوكن
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "successfully logged in",
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
        },
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// الحصول على الملف الشخصي بواسطة اسم المستخدم
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// تحديث الملف الشخصي
const updateProfile = async (req, res) => {
  try {
    const { username, email, bio } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "the user not found",
      });
    }

    // تحديث الحقول
    if (username) user.username = username;
    if (email) user.email = email;
    if (bio) user.bio = bio;

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// تحديث صورة الملف الشخصي
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "please upload a file",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "the user not found",
      });
    }

    // تحميل الصورة إلى Cloudinary
    const result = await uploadToCloudinary(req.file.path);

    // تحديث صورة الملف الشخصي
    user.profilePicture = result.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// تغيير كلمة المرور
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "المستخدم غير موجود",
      });
    }

    // التحقق من كلمة المرور الحالية
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        error: "كلمة المرور الحالية غير صحيحة",
      });
    }

    // تحديث كلمة المرور
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// البحث عن المستخدمين
const searchUsers = async (req, res) => {
  try {
    console.log("🔍 البحث عن مستخدمين:", req.query);
    const { query } = req.query;

    // التحقق من وجود استعلام
    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "يرجى تقديم استعلام للبحث",
      });
    }

    // التحقق من توكن المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "يرجى تسجيل الدخول للوصول إلى هذه الخدمة",
      });
    }

    // بناء شروط البحث
    const searchQuery = {
      username: { $regex: query, $options: "i" },
    };

    // استثناء المستخدم الحالي
    if (req.user._id) {
      searchQuery._id = { $ne: req.user._id };
    }

    console.log("شروط البحث:", searchQuery);

    // البحث عن المستخدمين
    const users = await User.find(searchQuery)
      .select("username email profilePicture bio firstName lastName")
      .limit(10);

    console.log(`تم العثور على ${users.length} مستخدم`);

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("خطأ في البحث عن المستخدمين:", {
      message: error.message,
      stack: error.stack,
      user: req.user,
      query: req.query.query,
    });

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء البحث عن المستخدمين",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// متابعة مستخدم
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // التحقق من أن المستخدم لا يحاول متابعة نفسه
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: "لا يمكنك متابعة نفسك",
      });
    }

    // البحث عن المستخدم المراد متابعته
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: "المستخدم غير موجود",
      });
    }

    // البحث عن المستخدم الحالي
    const currentUser = await User.findById(req.user._id);

    // التحقق مما إذا كان المستخدم يتابع بالفعل هذا المستخدم
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: "أنت تتابع هذا المستخدم بالفعل",
      });
    }

    // إضافة المستخدم المراد متابعته إلى قائمة المتابعين للمستخدم الحالي
    await User.findByIdAndUpdate(req.user._id, {
      $push: { following: userId },
    });

    // إضافة المستخدم الحالي إلى قائمة المتابعين للمستخدم المراد متابعته
    await User.findByIdAndUpdate(userId, {
      $push: { followers: req.user._id },
    });

    res.status(200).json({
      success: true,
      message: "تمت المتابعة بنجاح",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// إلغاء متابعة مستخدم
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // التحقق من أن المستخدم لا يحاول إلغاء متابعة نفسه
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: "لا يمكنك إلغاء متابعة نفسك",
      });
    }

    // البحث عن المستخدم المراد إلغاء متابعته
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        error: "المستخدم غير موجود",
      });
    }

    // البحث عن المستخدم الحالي
    const currentUser = await User.findById(req.user._id);

    // التحقق مما إذا كان المستخدم لا يتابع هذا المستخدم
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: "أنت لا تتابع هذا المستخدم",
      });
    }

    // إزالة المستخدم المراد إلغاء متابعته من قائمة المتابعين للمستخدم الحالي
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: userId },
    });

    // إزالة المستخدم الحالي من قائمة المتابعين للمستخدم المراد إلغاء متابعته
    await User.findByIdAndUpdate(userId, {
      $pull: { followers: req.user._id },
    });

    res.status(200).json({
      success: true,
      message: "تم إلغاء المتابعة بنجاح",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// الحصول على قائمة المتابعين
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    // البحث عن المستخدم
    const user = await User.findById(userId).populate(
      "followers",
      "username profilePicture bio"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "المستخدم غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      data: user.followers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// الحصول على قائمة المتابعين
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    // البحث عن المستخدم
    const user = await User.findById(userId).populate(
      "following",
      "username profilePicture bio"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "المستخدم غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      data: user.following,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updateProfilePicture,
  changePassword,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
