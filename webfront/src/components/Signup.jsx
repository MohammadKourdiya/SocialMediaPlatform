import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "https://instaclone-g9h5.onrender.com/api/v1/user/register",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
        setInput({
          username: "",
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Globfy
            </h1>
            <p className="text-gray-600 mt-2">
              انضم إلينا وابدأ مشاركة لحظاتك المميزة
            </p>
          </div>

          <form onSubmit={signupHandler} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                اسم المستخدم
              </label>
              <Input
                type="text"
                name="username"
                value={input.username}
                onChange={changeEventHandler}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                name="email"
                value={input.email}
                onChange={changeEventHandler}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                كلمة المرور
              </label>
              <Input
                type="password"
                name="password"
                value={input.password}
                onChange={changeEventHandler}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="أدخل كلمة المرور"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                كلمة المرور
              </label>
              <Input
                type="password"
                name="password"
                value={input.password}
                onChange={changeEventHandler}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="أدخل كلمة المرور"
              />
            </div>

            {loading ? (
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:opacity-90 transition-all">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التحميل...
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:opacity-90 transition-all"
              >
                إنشاء حساب
              </Button>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
