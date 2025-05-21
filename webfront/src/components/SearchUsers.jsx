import React, { useState, useEffect, useCallback } from "react";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Search } from "lucide-react";

const SearchUsers = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const searchUsers = useCallback(async () => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("يرجى تسجيل الدخول أولاً");
        return;
      }

      const res = await axios.get(
        `http://localhost:5000/api/users/search?query=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setUsers(res.data.data);
        console.log("تم العثور على المستخدمين:", res.data.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("خطأ في البحث عن المستخدمين:", error);
      if (error.response?.status === 401) {
        toast.error("يرجى تسجيل الدخول مرة أخرى");
      } else {
        toast.error("حدث خطأ أثناء البحث عن المستخدمين");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const debounceTimer = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchUsers]);

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
    setQuery("");
    setUsers([]);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="ابحث عن مستخدم..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {loading && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-lg shadow-lg">
          جاري البحث...
        </div>
      )}

      {users.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserClick(user.username)}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profilePicture} alt={user.username} />
                <AvatarFallback>
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{user.username}</p>
                {user.bio && (
                  <p className="text-sm text-gray-500 truncate">{user.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
