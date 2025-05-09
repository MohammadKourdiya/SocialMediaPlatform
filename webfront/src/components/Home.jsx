import React from "react";

import Posts from "./Posts";

import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex">
      <div className="flex-grow">
        <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            <Posts />
          </h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Home;
