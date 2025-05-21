import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axios from "axios";
import { toast } from "sonner";
import { setPosts } from "../redux/postSlice";

const CommentDialog = ({ open, setOpen, post }) => {
  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  useEffect(() => {
    setComments(post?.comments || []);
  }, [post]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText);
  };

  const sendMessageHandler = async () => {
    if (!post?.id && !post?._id) {
      toast.error("لم يتم تحديد المنشور");
      return;
    }
    if (!text.trim()) {
      toast.error("يرجى إدخال نص التعليق");
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${post.id || post._id}/comments`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedComments = [...comments, res.data.comment];
        setComments(updatedComments);
        // تحديث تعليقات المنشور في redux
        const updatedPostData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedComments } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        toast.error("يرجى تسجيل الدخول أولاً");
      } else {
        toast.error(
          error.response?.data?.error || "حدث خطأ أثناء إضافة التعليق"
        );
      }
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center"
      >
        <DialogTitle className="text-center font-bold text-2xl text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mt-2 mb-2">
          التعليقات
        </DialogTitle>
        <DialogDescription className="text-center text-[#64748b] mb-4">
          يمكنك قراءة التعليقات أو إضافة تعليق جديد على هذا المنشور.
        </DialogDescription>
        <div className="flex-1 w-full flex flex-col justify-between">
          <div className="flex items-center justify-center p-4 border-b border-gray-200 w-full">
            <div className="flex gap-3 items-center">
              <Avatar>
                <AvatarImage src={post?.author?.profilePicture} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-xs text-[#1F2937]">
                {post?.author?.username}
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-96 p-4 w-full bg-white">
            {comments.length === 0 ? (
              <div className="text-center text-[#94a3b8]">
                لا توجد تعليقات بعد
              </div>
            ) : (
              comments.map((comment) => (
                <Comment key={comment._id || comment.id} comment={comment} />
              ))
            )}
          </div>
          <div className="p-4 w-full border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={text}
                onChange={changeEventHandler}
                placeholder="أضف تعليقًا..."
                className="w-full outline-none border border-gray-200 bg-[#f8fafc] text-sm text-[#1F2937] placeholder-[#94a3b8] p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-200 transition"
              />
              <Button
                disabled={!text.trim()}
                onClick={sendMessageHandler}
                variant="outline"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-60"
              >
                إرسال
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
