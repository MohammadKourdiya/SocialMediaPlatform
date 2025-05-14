import React from "react";
import Posts from "./Posts";

const Feed = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <Posts />
      </div>
    </div>
  );
};

export default Feed;
