import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector((store) => store.auth);

  return (
    <div className="space-y-4">
      {suggestedUsers.map((user) => (
        <div key={user._id} className="flex items-center justify-between group">
          <div className="flex items-center gap-3 min-w-0">
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
            className="text-[#3B82F6] hover:text-[#2563EB] hover:bg-[#EFF6FF] font-medium"
          >
            Follow
          </Button>
        </div>
      ))}
    </div>
  );
};

export default SuggestedUsers;
