import React, { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "../redux/postSlice";
import { Badge } from "./ui/badge";

const Post = ({ post }) => {
  // التحقق من البيانات عند استلام المنشور
  console.log("Post Data:", post);

  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const postId = post?.id || post?._id;
  // التأكد من وجود البيانات الأساسية وتوحيد استخدام المعرف
  const postData = useMemo(
    () => ({
      _id: post?.id,
      likes: Array.isArray(post?.likes) ? post.likes : [],
      comments: Array.isArray(post?.comments) ? post.comments : [],
      content: post?.content || "",
      author: post?.author || {},
    }),
    [post]
  );

  console.log("sasdsad,", postData._id);
  const [liked, setLiked] = useState(
    postData.likes.includes(user?._id) || false
  );
  const [postLike, setPostLike] = useState(postData.likes.length);
  const [comment, setComment] = useState(postData.comments);
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };
  const likeOrDislikeHandler = async () => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }

    // التحقق من وجود معرف المنشور
    const postIdentifier = post?._id || post?.id;
    if (!postIdentifier) {
      console.error("معرف المنشور غير موجود:", { post });
      toast.error("خطأ في معرف المنشور");
      return;
    }

    try {
      const url = `http://localhost:5000/api/posts/${postIdentifier}/like`;
      console.log("Sending request to:", url);

      const res = await axios.post(
        url,
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
        // تحديث حالة الإعجاب
        setLiked(!liked);

        // تحديث عدد الإعجابات
        setPostLike(res.data.likesCount);

        // تحديث المنشورات في Redux store
        const updatedPostData = posts.map((p) =>
          p._id === postIdentifier || p.id === postIdentifier
            ? {
                ...p,
                likes: res.data.isLiked
                  ? [...p.likes, user._id]
                  : p.likes.filter((id) => id !== user._id),
                likesCount: res.data.likesCount,
              }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Error details:", {
        error,
        postIdentifier,
        post,
        postData,
        url: `http://localhost:5000/api/posts/${postIdentifier}/like`,
      });

      if (error.response?.status === 401) {
        toast.error("يرجى تسجيل الدخول أولاً");
      } else if (error.response?.status === 404) {
        toast.error("لم يتم العثور على المنشور");
      } else {
        toast.error(
          error.response?.data?.message || "حدث خطأ أثناء إضافة الإعجاب"
        );
      }
    }
  };
  const commentHandler = async () => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }

    if (!text.trim()) {
      toast.error("يرجى إدخال نص التعليق");
      return;
    }

    // التحقق من وجود معرف المنشور
    if (!post?._id || !postData._id) {
      console.error("معرف المنشور غير موجود:", {
        postId: post?.id,
        postDataId: postData._id,
      });
      toast.error("خطأ في معرف المنشور");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postData._id}/comments`,
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
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);
        const updatedPostData = posts.map((p) =>
          p._id === postData._id ? { ...p, comments: updatedCommentData } : p
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

  const handleOpenCommentDialog = () => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }
    dispatch(setSelectedPost(post));
    setOpen(true);
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/posts/${post?.id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPostData = posts.filter(
          (postItem) => postItem?._id !== post?._id
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.messsage);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `https://localhost:5000/api/posts/${post?.id}/bookmark`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <article className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author?.profilePicture} alt="post_image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-[#1F2937]">
              {post.author?.username}
            </h2>
            {user?._id === post.id && (
              <Badge
                variant="secondary"
                className="bg-[#F3F4F6] text-[#6B7280]"
              >
                Author
              </Badge>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-[#F9FAFB]">
              <MoreHorizontal className="h-5 w-5 text-[#6B7280]" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[200px] p-2">
            <div className="flex flex-col gap-1">
              {post?.author?._id !== user?._id && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-[#ED4956] font-medium hover:bg-red-50"
                >
                  Unfollow
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-[#F9FAFB]"
              >
                Add to favorites
              </Button>
              {user && user?._id === post?.author._id && (
                <Button
                  onClick={deletePostHandler}
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Post Image */}
      <div className="relative aspect-square">
        <img
          className="w-full h-full object-cover"
          src={post.image}
          alt="post_img"
        />
      </div>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={likeOrDislikeHandler}
              className="transition-transform hover:scale-110"
            >
              {liked ? (
                <FaHeart size={24} className="text-[#ED4956]" />
              ) : (
                <FaRegHeart
                  size={24}
                  className="text-[#1F2937] hover:text-[#6B7280]"
                />
              )}
            </button>
            <button
              onClick={() => {
                dispatch(setSelectedPost(post));
                setOpen(true);
              }}
              className="transition-transform hover:scale-110"
            >
              <MessageCircle className="h-6 w-6 text-[#1F2937] hover:text-[#6B7280]" />
            </button>
            <button className="transition-transform hover:scale-110">
              <Send className="h-6 w-6 text-[#1F2937] hover:text-[#6B7280]" />
            </button>
          </div>
          <button
            onClick={bookmarkHandler}
            className="transition-transform hover:scale-110"
          >
            <Bookmark className="h-6 w-6 text-[#1F2937] hover:text-[#6B7280]" />
          </button>
        </div>

        {/* Likes Count */}
        <p className="font-semibold text-[#1F2937] mb-2">{postLike} likes</p>

        {/* Caption */}
        <p className="text-[#1F2937] mb-2">
          <span className="font-semibold mr-2">{post.author?.username}</span>
          {post.caption}
        </p>

        {/* Content */}
        {post.content && (
          <p className="text-[#4B5563] mb-3 whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {/* Comments Preview */}
        {comment.length > 0 && (
          <button
            onClick={() => {
              dispatch(setSelectedPost(post));

              setOpen(true);
            }}
            className="text-[#6B7280] text-sm hover:text-[#1F2937] transition-colors"
          >
            View all {comment.length} comments
          </button>
        )}

        {/* Comment Input */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#E5E7EB]">
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={changeEventHandler}
            className="flex-1 outline-none text-sm text-[#1F2937] placeholder-[#6B7280]"
          />
          {text && (
            <button
              onClick={commentHandler}
              className="text-[#3B82F6] font-medium hover:text-[#2563EB] transition-colors"
            >
              Post
            </button>
          )}
        </div>
      </div>

      <CommentDialog open={open} setOpen={setOpen} post={post} />
    </article>
  );
};

export default Post;
