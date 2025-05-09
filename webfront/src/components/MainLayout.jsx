import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div>
      <div>
        <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to the Main Layout!
          </h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
