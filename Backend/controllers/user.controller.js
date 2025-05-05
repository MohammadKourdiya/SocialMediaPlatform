const User = require("../models/user.model");
const { generateToken } = require("../utils/jwt");
const { uploadToCloudinary } = require("../utils/cloudinary");

// تسجيل مستخدم جديد
const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // تحقق من تطابق كلمتي المرور
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "كلمة المرور وتأكيد كلمة المرور غير متطابقين",
      });
    }

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "البريد الإلكتروني أو اسم المستخدم موجود بالفعل",
      });
    }

    // إنشاء مستخدم جديد بدون تخزين confirmPassword
    const user = await User.create({
      username,
      email,
      password,
      confirmPassword,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "فشل إنشاء الحساب",
      });
    }

    // إنشاء التوكن
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
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
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      });
    }

    // إنشاء التوكن
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
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
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// الحصول على الملف الشخصي
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "المستخدم غير موجود",
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
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "المستخدم غير موجود",
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
        error: "يرجى تحميل صورة",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "المستخدم غير موجود",
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

// البحث عن مستخدمين
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("username email profilePicture");

    res.status(200).json({
      success: true,
      data: users,
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
};
