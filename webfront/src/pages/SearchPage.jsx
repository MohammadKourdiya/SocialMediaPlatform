import React, { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Search } from "lucide-react";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("يرجى تسجيل الدخول أولاً");
          navigate("/login");
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/users/search?query=${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (error) {
        console.error("خطأ في البحث:", error);
        if (error.response?.status === 401) {
          toast.error("يرجى تسجيل الدخول أولاً");
          navigate("/login");
        } else {
          toast.error(error.response?.data?.message || "حدث خطأ أثناء البحث");
        }
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounceTimer);
  }, [query, navigate]);

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          البحث عن المستخدمين
        </h1>

        <div className="relative mb-8">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="ابحث عن مستخدم..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-4 pr-12 py-3 w-full rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-lg"
            dir="rtl"
          />
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">جاري البحث...</p>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserClick(user.username)}
                className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user.profilePicture} alt={user.username} />
                  <AvatarFallback>
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {user.username}
                  </h3>
                  {user.bio && <p className="text-gray-600 mt-1">{user.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && query && users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">لم يتم العثور على نتائج</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
