import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import axios from "axios";
import { Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  setAuthUser,
  setUserProfile,
  setForceUpdate,
} from "../redux/authSlice";

const EditProfile = () => {
  const imageRef = useRef();
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    username: user?.username,
    email: user?.email,
    bio: user?.bio,
    profilePhoto: user?.profilePicture,
    gender: user?.gender,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setInput({ ...input, profilePhoto: file });
  };

  const selectChangeHandler = (value) => {
    setInput({ ...input, gender: value });
  };

  // دالة جلب البروفايل من السيرفر مباشرة بعد التعديل
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/${user?.username}?t=${Date.now()}`,
        { withCredentials: true }
      );
      if (res.data) {
        if (res.data.data) {
          dispatch(setUserProfile(res.data.data));
        } else {
          dispatch(setUserProfile(res.data));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const editProfileHandler = async () => {
    try {
      setLoading(true);
      const res = await axios.put(
        "http://localhost:5000/api/users/profile",
        {
          username: input.username,
          email: input.email,
          bio: input.bio,
          gender: input.gender,
          profilePhoto: input.profilePhoto,
        },

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setAuthUser(res.data.data));
        dispatch(setUserProfile(res.data.data));
        await fetchUserProfile();
        dispatch(setForceUpdate(Date.now()));
        navigate(`/profile/${res.data.data.username}`);
        toast.success("تم تحديث البروفايل بنجاح");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.error || "حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="flex flex-col gap-8 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 my-12 border border-gray-100 dark:border-gray-800">
        {user && (
          <Button
            variant="outline"
            style={{
              background: "#e0e7ff",
              border: "2px solid #6366f1",
              color: "#3730a3",
            }}
            className="w-fit self-start mb-2 flex items-center gap-1"
            onClick={() => navigate(`/profile/${user?.username}`)}
          >
            <ArrowRight size={18} className="rtl:rotate-180" />
            العودة للبروفايل
          </Button>
        )}
        <h1 className="font-bold text-2xl text-center text-blue-700 dark:text-blue-300 mb-2">
          تعديل الملف الشخصي
        </h1>
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <Avatar className="w-32 h-32 border-4 border-blue-200 dark:border-blue-700 shadow-md">
              <AvatarImage src={user?.profilePicture} alt="profile_image" />
              <AvatarFallback className="text-3xl">
                {user?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <input
              ref={imageRef}
              onChange={fileChangeHandler}
              type="file"
              accept="image/*"
              className="hidden"
            />
            <Button
              onClick={() => imageRef?.current.click()}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full shadow-md text-xs hover:from-blue-600 hover:to-purple-600"
            >
              تغيير الصورة الشخصية
            </Button>
          </div>
          <div className="text-center mt-2">
            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">
              {user?.username}
            </h2>
            <span className="text-gray-500 text-sm block mt-1">
              {user?.email}
            </span>
          </div>
        </div>
        <div>
          <h1 className="font-bold text-lg mb-2 text-gray-700 dark:text-gray-200">
            السيرة الذاتية
          </h1>
          <Textarea
            value={input.bio}
            onChange={(e) => setInput({ ...input, bio: e.target.value })}
            name="bio"
            placeholder="اكتب نبذة عنك أو حدث سيرتك الذاتية..."
            className="focus-visible:ring-blue-400 border border-gray-200 dark:border-gray-700 bg-[#f8fafc] dark:bg-gray-800 text-[#1F2937] dark:text-gray-100 placeholder-[#94a3b8] rounded-lg min-h-[80px]"
          />
        </div>
        <div>
          <h1 className="font-bold mb-2 text-gray-700 dark:text-gray-200">
            الجنس
          </h1>
          <Select
            defaultValue={input.gender}
            onValueChange={selectChangeHandler}
          >
            <SelectTrigger className="w-full bg-[#f8fafc] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#1F2937] dark:text-gray-100 rounded-lg">
              <SelectValue placeholder="اختر الجنس" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">ذكر</SelectItem>
                <SelectItem value="female">أنثى</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end mt-4">
          {loading ? (
            <Button className="w-fit bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              يرجى الانتظار
            </Button>
          ) : (
            <Button
              onClick={editProfileHandler}
              className="w-fit bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            >
              حفظ التعديلات
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
