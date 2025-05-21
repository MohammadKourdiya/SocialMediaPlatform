import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Search, User, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { toast } from "sonner";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/login");
  };

  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      <Link to="/" className="mb-8">
        <img src="/logo.png" alt="Logo" className="w-8 h-8" />
      </Link>

      <nav className="flex-1 flex flex-col items-center space-y-6">
        <Link
          to="/"
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Home className="w-6 h-6" />
        </Link>

        <Link
          to="/search"
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Search className="w-6 h-6" />
        </Link>

        <Link
          to="/profile"
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <User className="w-6 h-6" />
        </Link>
      </nav>

      <button
        onClick={handleLogout}
        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Sidebar;
