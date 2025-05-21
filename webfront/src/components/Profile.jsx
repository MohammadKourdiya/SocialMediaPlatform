import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  AtSign,
  Heart,
  MessageCircle,
  Bookmark,
  Grid,
  Film,
  Tag,
  Settings,
  Archive,
  BarChart3,
} from "lucide-react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton";
import axios from "axios";
import { setUserProfile } from "../redux/authSlice";
import { setPosts, setSelectedPost } from "../redux/postSlice";
import EditProfile from "./EditProfile";
import { toast } from "sonner";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

const Profile = () => {
  const params = useParams();
  const username = params.id;
  const [forceUpdate, setForceUpdate] = useState(0);
  const {
    userProfile,
    user,
    forceUpdate: reduxForceUpdate,
  } = useSelector((store) => store.auth);
  console.log("userProfile", userProfile);

  const isLoggedInUserProfile = user?.username === userProfile?.username;
  const isFollowing = userProfile?.followers?.includes(user?._id);

  useGetUserProfile(username, reduxForceUpdate);

  const [activeTab, setActiveTab] = useState("posts");
  const [bioEdit, setBioEdit] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [loadingBio, setLoadingBio] = useState(false);
  const dispatch = useDispatch();
  const imageInputRef = useRef();
  const [loadingPic, setLoadingPic] = useState(false);
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState([]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleEditBio = () => {
    setBioEdit(userProfile?.bio || "");
    setIsEditingBio(true);
  };

  // دالة جلب البروفايل من السيرفر مباشرة
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/${username}?t=${Date.now()}`,
        { withCredentials: true }
      );
      if (res.data) {
        if (res.data.data) {
          dispatch(setUserProfile(res.data.data));
        } else {
          dispatch(setUserProfile(res.data));
        }
        setForceUpdate((f) => f + 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSaveBio = async () => {
    setLoadingBio(true);
    try {
      const res = await axios.put(
        "http://localhost:5000/api/users/profile",
        { bio: bioEdit },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setUserProfile(res.data));
        setIsEditingBio(false);
        toast.success("تم تحديث السيرة الذاتية بنجاح");
        await fetchUserProfile();
      }
    } catch (error) {
      alert("حدث خطأ أثناء تحديث السيرة الذاتية");
    } finally {
      setLoadingBio(false);
    }
  };

  // دالة رفع الصورة الشخصية
  const handleProfilePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingPic(true);
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);
      const res = await axios.put(
        "http://localhost:5000/api/users/profile/picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setUserProfile(res.data.data));
        toast.success("تم تحديث الصورة الشخصية بنجاح");
        await fetchUserProfile();
      }
    } catch (error) {
      alert("حدث خطأ أثناء تحديث الصورة الشخصية");
    } finally {
      setLoadingPic(false);
    }
  };

  // جلب منشورات المستخدم من الباك اند
  const fetchUserPosts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/posts/user/${
          userProfile?._id || userProfile?.id
        }`
      );
      if (res.data.success) {
        setUserPosts(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    if (userProfile?._id || userProfile?.id) {
      fetchUserPosts();
    }
  }, [userProfile?._id, userProfile?.id]);

  console.log(user.Profile);

  const displayedPost =
    activeTab === "posts" ? userPosts : userProfile?.bookmarks;

  if (!userProfile || Object.keys(userProfile).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <h2 className="text-2xl font-bold mb-4">لا يوجد مستخدم بهذا الاسم</h2>
        <p className="text-md">تأكد من صحة الرابط أو اسم المستخدم.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 max-w-6xl">
      <Card className="p-6 sm:p-8 shadow-lg bg-white rounded-xl border border-gray-100">
        {/* Cover Image - Added for better visual appearance */}
        <div className="h-48 md:h-64 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 md:mb-8 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-t-xl relative overflow-hidden">
          {/* Could add actual cover image here if available */}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>

        {/* Profile Header - Redesigned layout */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-10 mb-10 items-center md:items-start">
          {/* Profile Image - Enhanced with larger size and better positioning */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center relative -mt-28 md:-mt-36">
            <Avatar className="h-36 w-36 sm:h-44 sm:w-44 border-4 border-white shadow-xl rounded-full">
              <AvatarImage
                src={userProfile?.profilePicture}
                alt={userProfile?.username}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {userProfile?.username?.substring(0, 2)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* زر تغيير الصورة يظهر فقط لصاحب الحساب - Enhanced button */}
            {isLoggedInUserProfile && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  className="hidden"
                  onChange={handleProfilePicChange}
                  disabled={loadingPic}
                />
                <Button
                  size="sm"
                  className="mt-3 bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all duration-200"
                  onClick={() => imageInputRef.current.click()}
                  disabled={loadingPic}
                >
                  {loadingPic ? "جاري التحديث..." : "تغيير الصورة الشخصية"}
                </Button>
              </>
            )}
          </div>

          {/* Profile Info - Improved layout and styling */}
          <div className="flex-grow w-full space-y-5 mt-4 md:mt-0">
            {/* Username and Actions - Better alignment and spacing */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {userProfile?.username}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100">
                    <AtSign size={14} className="mr-1" />
                    <span>{userProfile?.username}</span>
                  </Badge>
                  {userProfile?.email && (
                    <span className="text-gray-500 text-sm">
                      {userProfile.email}
                    </span>
                  )}
                </div>
                {/* Full Name - Better positioning */}
                {(userProfile?.firstName || userProfile?.lastName) && (
                  <div className="text-gray-700 font-medium mt-1">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </div>
                )}
              </div>

              {/* Action Buttons - Enhanced styling */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-end mt-2 sm:mt-0">
                {isLoggedInUserProfile ? (
                  <Link to="/account/edit">
                    <Button
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md transition-all duration-200 flex items-center gap-2"
                      size="sm"
                    >
                      <Settings size={14} /> تعديل الملف الشخصي
                    </Button>
                  </Link>
                ) : isFollowing ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                    >
                      إلغاء المتابعة
                    </Button>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      size="sm"
                    >
                      مراسلة
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-colors"
                    size="sm"
                  >
                    متابعة
                  </Button>
                )}
              </div>
            </div>

            {/* Stats - Redesigned with cards */}
            <div className="grid grid-cols-3 gap-4 my-6">
              <div className="bg-white shadow-sm rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <span className="font-bold text-xl text-blue-600">
                  {userProfile?.posts?.length || 0}
                </span>
                <p className="text-gray-600 text-sm mt-1">منشور</p>
              </div>
              <div className="bg-white shadow-sm rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <span className="font-bold text-xl text-blue-600">
                  {userProfile?.followers?.length || 0}
                </span>
                <p className="text-gray-600 text-sm mt-1">متابع</p>
              </div>
              <div className="bg-white shadow-sm rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <span className="font-bold text-xl text-blue-600">
                  {userProfile?.following?.length || 0}
                </span>
                <p className="text-gray-600 text-sm mt-1">متابَع</p>
              </div>
            </div>

            {/* Bio - Enhanced styling */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h2 className="font-semibold text-lg text-gray-800 flex items-center gap-2 mb-2">
                السيرة الذاتية
              </h2>
              <p className="text-gray-700 whitespace-pre-line break-words leading-relaxed">
                {user?.bio || "لا توجد سيرة ذاتية حتى الآن..."}
              </p>
            </div>
          </div>
        </div>

        {/* Content Tabs - Improved styling */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-8 bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-hidden">
            <TabsTrigger
              value="posts"
              onClick={() => handleTabChange("posts")}
              className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:border-t-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Grid size={18} /> المنشورات
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              onClick={() => handleTabChange("saved")}
              className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:border-t-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Bookmark size={18} /> المحفوظات
            </TabsTrigger>
            <TabsTrigger
              value="reels"
              className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:border-t-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Film size={18} /> الفيديوهات
            </TabsTrigger>
            <TabsTrigger
              value="tags"
              className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:border-t-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Tag size={18} /> التسميات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            <PostsGrid posts={userPosts.posts} />
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            <PostsGrid posts={userProfile?.bookmarks} />
          </TabsContent>

          <TabsContent value="reels" className="mt-0">
            <div className="flex flex-col justify-center items-center h-60 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 p-6">
              <Film size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">
                لا توجد فيديوهات لعرضها
              </h3>
              <p className="text-sm">ابدأ بمشاركة لحظاتك المميزة كفيديوهات</p>
            </div>
          </TabsContent>

          <TabsContent value="tags" className="mt-0">
            <div className="flex flex-col justify-center items-center h-60 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 p-6">
              <Tag size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">
                لا توجد تسميات لعرضها
              </h3>
              <p className="text-sm">عندما يتم تسميتك في المنشورات ستظهر هنا</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

// Component for showing posts in a grid
const PostsGrid = ({ posts = [] }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [selectedPost, setSelectedPostLocal] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts: allPosts } = useSelector((store) => store.post);

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 p-8">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Grid size={32} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-medium mb-2">لا توجد منشورات</h3>
        <p className="text-sm text-center max-w-md">
          ابدأ بمشاركة لحظاتك المميزة مع أصدقائك والعالم
        </p>
        <Button
          className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          size="sm"
          onClick={() => navigate("/create-post")}
        >
          إنشاء منشور جديد
        </Button>
      </div>
    );
  }

  const handlePostClick = (post) => {
    setSelectedPostLocal(post);
    dispatch(setSelectedPost(post));
    setShowPostDialog(true);
  };

  // وظيفة معالجة الإعجاب على المنشور
  const handleLikePost = async () => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }

    if (isLiking) return; // منع النقرات المتعددة السريعة

    setIsLiking(true);

    try {
      const postId = selectedPost?._id || selectedPost?.id;
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        // تحديث حالة المنشور المحدد
        const updatedPost = {
          ...selectedPost,
          likes: res.data.isLiked
            ? [...(selectedPost.likes || []), user._id]
            : (selectedPost.likes || []).filter((id) => id !== user._id),
        };
        setSelectedPostLocal(updatedPost);

        // تحديث حالة المنشورات في القائمة
        const updatedPosts = posts.map((p) =>
          p._id === postId || p.id === postId ? updatedPost : p
        );

        // تحديث الريدكس
        dispatch(setPosts(updatedPosts));

        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("خطأ في الإعجاب:", error);
      toast.error(
        error.response?.data?.message || "حدث خطأ أثناء إضافة الإعجاب"
      );
    } finally {
      setIsLiking(false);
    }
  };

  // وظيفة معالجة إضافة تعليق
  const handleAddComment = async () => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }

    if (!commentText.trim()) {
      toast.error("يرجى إدخال نص التعليق");
      return;
    }

    if (isSubmittingComment) return;

    setIsSubmittingComment(true);

    try {
      const postId = selectedPost?._id || selectedPost?.id;
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments`,
        { text: commentText },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        // تحديث حالة المنشور المحدد مع التعليق الجديد
        const newComment = res.data.comment;
        const updatedPost = {
          ...selectedPost,
          comments: [...(selectedPost.comments || []), newComment],
        };
        setSelectedPostLocal(updatedPost);

        // تحديث حالة المنشورات في القائمة
        const updatedPosts = posts.map((p) =>
          p._id === postId || p.id === postId ? updatedPost : p
        );

        // تحديث الريدكس
        dispatch(setPosts(updatedPosts));

        // إعادة تعيين حقل التعليق
        setCommentText("");
        toast.success("تمت إضافة التعليق بنجاح");
      }
    } catch (error) {
      console.error("خطأ في إضافة التعليق:", error);
      toast.error(
        error.response?.data?.message || "حدث خطأ أثناء إضافة التعليق"
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Card
          key={post?._id || post.id}
          className="overflow-hidden group relative cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 rounded-2xl"
          onClick={() => handlePostClick(post)}
        >
          <div className="aspect-square overflow-hidden bg-gray-100">
            <img
              src={post?.image}
              alt="صورة المنشور"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300">
            <div className="flex flex-col items-center text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              {/* اسم المستخدم */}
              {post?.author?.username && (
                <span
                  className="font-bold text-lg cursor-pointer hover:underline mb-3"
                  onClick={(e) => {
                    e.stopPropagation(); // منع انتشار الحدث
                    navigate(`/profile/${post.author.username}`);
                  }}
                >
                  {post.author.username}
                </span>
              )}
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Heart className="fill-white text-white" size={22} />
                  <span className="font-semibold text-lg">
                    {post?.likes?.length || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="text-white" size={22} />
                  <span className="font-semibold text-lg">
                    {post?.comments?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* نافذة عرض المنشور بالكامل - تصميم محسن */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white border-0 shadow-xl rounded-2xl p-0">
          <div className="flex flex-col lg:flex-row h-full">
            {/* قسم الصورة - جعلناه على النصف الأيسر في الشاشات الكبيرة */}
            <div className="lg:w-1/2 bg-black flex items-center justify-center">
              <img
                src={selectedPost?.image}
                alt="صورة المنشور"
                className="w-full h-full object-contain max-h-[500px]"
              />
            </div>

            {/* قسم التفاصيل - جعلناه على النصف الأيمن في الشاشات الكبيرة */}
            <div className="lg:w-1/2 p-6 flex flex-col max-h-[90vh] lg:max-h-[500px] overflow-y-auto">
              <DialogHeader className="border-b pb-3 mb-4">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold text-gray-800">
                    عرض المنشور
                  </DialogTitle>
                  <button
                    className="p-1 rounded-full hover:bg-gray-100"
                    onClick={() => setShowPostDialog(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </DialogHeader>

              {selectedPost && (
                <div className="flex flex-col h-full">
                  {/* معلومات الكاتب */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={selectedPost?.author?.profilePicture} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {selectedPost?.author?.username
                          ?.substring(0, 2)
                          ?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <span
                            className="font-semibold text-base cursor-pointer hover:underline text-gray-800 block"
                            onClick={() => {
                              setShowPostDialog(false);
                              navigate(
                                `/profile/${selectedPost?.author?.username}`
                              );
                            }}
                          >
                            {selectedPost?.author?.username}
                          </span>
                          <p className="text-xs text-gray-500">
                            @{selectedPost?.author?.username}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {selectedPost?.createdAt
                            ? new Date(
                                selectedPost.createdAt
                              ).toLocaleDateString("ar-EG")
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* محتوى المنشور */}
                  <div className="mb-4 flex-grow">
                    <p className="text-gray-700 whitespace-pre-line text-base leading-relaxed bg-gray-50 p-4 rounded-xl">
                      {selectedPost?.content}
                    </p>
                  </div>

                  {/* معلومات التفاعل */}
                  <div className="border-t border-b py-3 my-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <FaHeart className="text-red-500" size={18} />
                          <span className="font-medium text-gray-700">
                            {selectedPost?.likes?.length || 0} إعجاب
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle size={18} className="text-blue-500" />
                          <span className="font-medium text-gray-700">
                            {selectedPost?.comments?.length || 0} تعليق
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className={`rounded-full transition-all flex items-center gap-1 ${
                            selectedPost?.likes?.includes(user?._id)
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                          onClick={handleLikePost}
                          disabled={isLiking}
                        >
                          {selectedPost?.likes?.includes(user?._id) ? (
                            <FaHeart className="text-white" size={16} />
                          ) : (
                            <FaRegHeart size={16} />
                          )}
                          <span>{isLiking ? "..." : "إعجاب"}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full flex items-center gap-1 bg-gray-100 hover:bg-gray-200 border-0 text-gray-700"
                          onClick={() =>
                            document.getElementById("commentInput").focus()
                          }
                        >
                          <MessageCircle size={16} />
                          تعليق
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* قسم التعليقات */}
                  <div className="flex-grow overflow-y-auto my-3">
                    {Array.isArray(selectedPost?.comments) &&
                    selectedPost.comments.length > 0 ? (
                      <div>
                        <h3 className="font-bold mb-3 text-gray-800 flex items-center gap-2">
                          <MessageCircle size={16} className="text-blue-500" />
                          التعليقات{" "}
                          <span className="text-sm text-gray-500 font-normal">
                            ({selectedPost.comments.length})
                          </span>
                        </h3>
                        <div className="space-y-3">
                          {selectedPost.comments.map((comment) => (
                            <div
                              key={comment?._id || comment?.id}
                              className="p-3 bg-gray-50 rounded-xl flex items-start gap-3 hover:bg-gray-100 transition-colors"
                            >
                              <Avatar className="h-8 w-8 border-2 border-white shadow-sm flex-shrink-0">
                                <AvatarImage
                                  src={comment?.author?.profilePicture}
                                />
                                <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                                  {comment?.author?.username
                                    ?.substring(0, 2)
                                    ?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold text-sm text-gray-800 hover:underline cursor-pointer">
                                    {comment?.author?.username}
                                  </span>
                                  {comment?.createdAt && (
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                      {new Date(
                                        comment.createdAt
                                      ).toLocaleDateString("ar-EG")}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 break-words">
                                  {comment?.text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <MessageCircle
                          size={24}
                          className="mx-auto mb-2 text-gray-300"
                        />
                        <p>لا توجد تعليقات حتى الآن</p>
                        <p className="text-sm mt-1">
                          كن أول من يعلق على هذا المنشور
                        </p>
                      </div>
                    )}
                  </div>

                  {/* إضافة تعليق جديد */}
                  <div className="mt-3 pt-2 sticky bottom-0 bg-white">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={user?.profilePicture} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                          {user?.username?.substring(0, 2)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-2 w-full bg-gray-50 rounded-full p-1 shadow-sm border">
                          <input
                            id="commentInput"
                            type="text"
                            placeholder="أضف تعليقاً..."
                            className="flex-1 px-4 py-2 text-gray-700 bg-transparent outline-none text-sm focus:outline-none rounded-full"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment();
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            className={`rounded-full transition-all ${
                              commentText.trim()
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                            onClick={handleAddComment}
                            disabled={
                              isSubmittingComment || !commentText.trim()
                            }
                          >
                            {isSubmittingComment ? (
                              <svg
                                className="animate-spin h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
                              "إرسال"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Loading skeleton - تصميم محسن
const ProfileSkeleton = () => {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 max-w-6xl">
      <Card className="p-6 sm:p-8 shadow-lg bg-white rounded-xl border border-gray-100">
        {/* Cover Image Skeleton */}
        <div className="h-48 md:h-64 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6 md:mb-8 bg-gray-200 rounded-t-xl animate-pulse"></div>

        <div className="flex flex-col md:flex-row gap-8 mb-10">
          {/* Profile Image Skeleton */}
          <div className="flex-shrink-0 flex flex-col items-center -mt-28 md:-mt-36">
            <Skeleton className="h-36 w-36 sm:h-44 sm:w-44 rounded-full" />
            <Skeleton className="h-8 w-32 mt-4 rounded-full" />
          </div>

          {/* Profile Info Skeleton */}
          <div className="flex-grow space-y-6 mt-4 md:mt-0">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-8 w-40 rounded-lg" />
                <Skeleton className="h-5 w-32 rounded-lg" />
                <Skeleton className="h-5 w-60 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-3 gap-4 my-6">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>

            {/* Bio Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-4 w-full max-w-md rounded-lg" />
              <Skeleton className="h-4 w-full max-w-sm rounded-lg" />
              <Skeleton className="h-4 w-full max-w-xs rounded-lg" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <Skeleton className="h-14 w-full mb-8 rounded-xl" />

        {/* Posts Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Skeleton key={item} className="w-full aspect-square rounded-2xl" />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Profile;
