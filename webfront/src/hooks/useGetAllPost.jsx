import { setPosts } from "../redux/postSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllPost = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts/home", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.data.success && Array.isArray(res.data.posts)) {
          const postsWithDefaults = res.data.posts.map((post) => ({
            ...post,
            likes: post.likes || [],
            comments: post.comments || [],
            content: post.content || "",
          }));
          dispatch(setPosts(postsWithDefaults));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllPost();
  }, []);
};
export default useGetAllPost;
