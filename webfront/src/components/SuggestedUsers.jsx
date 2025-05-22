import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { setUserProfile } from "../redux/authSlice";

const SuggestedUsers = () => {
  const { suggestedUsers, user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [followLoading, setFollowLoading] = useState({});
  const [followingStates, setFollowingStates] = useState({});

  // Initialize following states based on user's followers
  React.useEffect(() => {
    if (suggestedUsers && user) {
      const initialStates = {};
      suggestedUsers.forEach((suggestedUser) => {
        initialStates[suggestedUser._id] =
          suggestedUser.followers?.includes(user._id) || false;
      });
      setFollowingStates(initialStates);
    }
  }, [suggestedUsers, user]);

  const handleFollow = async (userId) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً للمتابعة");
      return;
    }

    try {
      setFollowLoading((prev) => ({ ...prev, [userId]: true }));
      const res = await axios.post(
        `http://localhost:5000/api/users/follow/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setFollowingStates((prev) => ({ ...prev, [userId]: true }));
        toast.success("تمت المتابعة بنجاح");
      }
    } catch (error) {
      console.error("خطأ في متابعة المستخدم:", error);
      toast.error(error.response?.data?.error || "حدث خطأ أثناء المتابعة");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    try {
      setFollowLoading((prev) => ({ ...prev, [userId]: true }));
      const res = await axios.post(
        `http://localhost:5000/api/users/unfollow/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setFollowingStates((prev) => ({ ...prev, [userId]: false }));
        toast.success("تم إلغاء المتابعة بنجاح");
      }
    } catch (error) {
      console.error("خطأ في إلغاء متابعة المستخدم:", error);
      toast.error(
        error.response?.data?.error || "حدث خطأ أثناء إلغاء المتابعة"
      );
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {suggestedUsers.map((user) => (
        <div key={user?._id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={`/profile/${user?.username}`}
              className="flex-shrink-0 hover:opacity-90 transition-opacity"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={
                    user?.profilePicture ||
                    "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
                  }
                  alt="profile_picture"
                  onError={(e) => {
                    e.target.src =
                      "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";
                  }}
                />
                <AvatarFallback>
                  {user?.username?.substring(0, 2)?.toUpperCase() || "UN"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0">
              <Link
                to={`/profile/${user?.username}`}
                className="block font-semibold text-[#1F2937] hover:text-[#3B82F6] transition-colors truncate"
              >
                {user?.username}
              </Link>
              <p className="text-[#6B7280] text-sm truncate">
                {user?.bio || "Add your bio..."}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={
              followingStates[user._id]
                ? "text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                : "text-[#3B82F6] hover:text-[#2563EB] hover:bg-[#EFF6FF] font-medium"
            }
            onClick={() =>
              followingStates[user._id]
                ? handleUnfollow(user._id)
                : handleFollow(user._id)
            }
            disabled={followLoading[user._id]}
          >
            {followLoading[user._id]
              ? "جاري التحميل..."
              : followingStates[user._id]
              ? "إلغاء المتابعة"
              : "متابعة"}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default SuggestedUsers;
