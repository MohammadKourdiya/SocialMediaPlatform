import React from "react";
import Post from "./Post";
import { useSelector } from "react-redux";

const Posts = () => {
  const { posts } = useSelector((store) => store.post);

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#6B7280] text-lg">
            No posts yet. Be the first to share something!
          </p>
        </div>
      ) : (
        posts.map((post) => <Post key={post._id} post={post} />)
      )}
    </div>
  );
};

export default Posts;
