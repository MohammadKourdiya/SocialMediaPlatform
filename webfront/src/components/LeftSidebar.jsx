import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../redux/authSlice";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "../redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification
  );
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      navigate("/chat");
    } else if (textType === "Search") {
      navigate("/search");
    }
  };

  const sidebarItems = [
    { icon: <Home className="w-5 h-5" />, text: "Home" },
    { icon: <Search className="w-5 h-5" />, text: "Search" },
    { icon: <TrendingUp className="w-5 h-5" />, text: "Explore" },
    { icon: <MessageCircle className="w-5 h-5" />, text: "Messages" },
    { icon: <Heart className="w-5 h-5" />, text: "Notifications" },
    { icon: <PlusSquare className="w-5 h-5" />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut className="w-5 h-5" />, text: "Logout" },
  ];

  return (
    <div className="h-full bg-white border-r border-[#E5E7EB]">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#1F2937]">LOGO</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              onClick={() => sidebarHandler(item.text)}
              className="group flex items-center gap-3 px-4 py-3 text-[#6B7280] rounded-xl hover:bg-[#F9FAFB] hover:text-[#3B82F6] transition-all duration-200 cursor-pointer"
            >
              <div className="text-[#6B7280] group-hover:text-[#3B82F6] transition-colors">
                {item.icon}
              </div>
              <span className="font-medium">{item.text}</span>

              {item.text === "Notifications" && likeNotification.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      className="ml-auto rounded-full h-5 w-5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium"
                    >
                      {likeNotification.length}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <div className="space-y-3">
                      {likeNotification.length === 0 ? (
                        <p className="text-[#6B7280] text-sm">
                          No new notifications
                        </p>
                      ) : (
                        likeNotification.map((notification) => (
                          <div
                            key={notification.userId}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F9FAFB] transition-colors"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={notification.userDetails?.profilePicture}
                              />
                              <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <p className="text-sm text-[#1F2937]">
                              <span className="font-semibold">
                                {notification.userDetails?.username}
                              </span>{" "}
                              liked your post
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          ))}
        </nav>
      </div>

      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default LeftSidebar;
