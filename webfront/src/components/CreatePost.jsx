import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "../lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "../redux/postSlice";

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  };
  const token = localStorage.getItem("token");
  const createPostHandler = async (e) => {
    const formData = new FormData();

    formData.append("content", content);
    formData.append("userId", user._id);

    formData.append("file", file);
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts])); // [1] -> [1,2] -> total element = 2
        toast.success(res.data.message);
        setOpen(false);
        console.log(res.data.post);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-lg bg-[#f8fafc] rounded-2xl shadow-xl p-6 flex flex-col gap-4"
      >
        <DialogHeader className="text-center font-bold text-2xl text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-2">
          إنشاء منشور جديد
        </DialogHeader>
        <div className="flex gap-3 items-center mb-2">
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="img" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-xs text-[#1F2937]">
              {user?.username}
            </h1>
            <span className="text-gray-500 text-xs">
              {user?.bio || "شارك لحظتك..."}
            </span>
          </div>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="focus-visible:ring-blue-400 border border-gray-200 bg-white text-[#1F2937] placeholder-[#94a3b8] rounded-lg min-h-[80px]"
          placeholder="اكتب وصف المنشور..."
        />
        {imagePreview && (
          <div className="w-full h-64 flex items-center justify-center bg-[#e0e7ef] rounded-lg overflow-hidden mb-2 border border-gray-200">
            <img
              src={imagePreview}
              alt="preview_img"
              className="object-cover h-full w-full"
            />
          </div>
        )}
        <input
          ref={imageRef}
          type="file"
          className="hidden"
          onChange={fileChangeHandler}
        />
        <Button
          onClick={() => imageRef.current.click()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-all mb-2"
        >
          اختر صورة من جهازك
        </Button>
        {imagePreview &&
          (loading ? (
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-all">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              يرجى الانتظار
            </Button>
          ) : (
            <Button
              onClick={createPostHandler}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-all"
            >
              نشر
            </Button>
          ))}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
