import React from "react";
import Feed from "./Feed";
import { Outlet } from "react-router-dom";
import RightSidebar from "./RightSidebar";
import useGetAllPost from "../hooks/useGetAllPost";
import useGetSuggestedUsers from "../hooks/useGetSuggestedUsers";

const Home = () => {
  useGetAllPost();
  useGetSuggestedUsers();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <Feed />
        <Outlet />
      </div>
      <div className="hidden lg:block w-80 flex-shrink-0">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
