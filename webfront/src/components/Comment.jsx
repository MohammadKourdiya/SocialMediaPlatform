import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Comment = ({ comment }) => {
  return (
    <div className="my-2">
      <div className="flex gap-3 items-center">
        <Avatar>
          <AvatarImage src={comment?.user?.profilePicture || "/default.png"} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h1 className="font-bold text-sm">
          {comment?.user?.username || "مستخدم غير معروف"}
          <span className="font-normal pl-1">{comment?.content}</span>
        </h1>
      </div>
    </div>
  );
};

export default Comment;
