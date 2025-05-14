import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SuggestedUsers from "./SuggestedUsers";

const RightSidebar = () => {
  const { user } = useSelector((store) => store.auth);

  return (
    <div className="sticky top-8">
      {/* User Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/profile/${user?._id}`}
            className="hover:opacity-90 transition-opacity"
          >
            <Avatar className="w-14 h-14">
              <AvatarImage src={user?.profilePicture} alt="profile_picture" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              to={`/profile/${user?._id}`}
              className="block font-semibold text-[#1F2937] hover:text-[#3B82F6] transition-colors truncate"
            >
              {user?.username}
            </Link>
            <p className="text-[#6B7280] text-sm truncate">
              {user?.bio || "Add your bio..."}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Users Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-4">
        <h2 className="text-[#1F2937] font-semibold mb-4">Suggested Users</h2>
        <SuggestedUsers />
      </div>
    </div>
  );
};

export default RightSidebar;
