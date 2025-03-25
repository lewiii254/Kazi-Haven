import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Navbar from "../shared/Navbar";
import axios from "axios";
import { USER_BASE_URL } from "@/utils/constant";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const { loading } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [errors, setErrors] = useState({});

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form validation
  const validate = () => {
    let newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
      });
      try {
        dispatch(setLoading(true));
        const res = await axios.post(`${USER_BASE_URL}/login`, formData, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        if (res.data.success) {
          navigate("/");
          dispatch(setUser(res.data.userDetails));
          toast.success(res.data.message);
        }
      } catch (err) {
        console.log(err);
        toast.success(err.response.data.message);
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            Login to Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label className={"mb-2"}>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label className={"mb-2"}>Password</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Role (Radio Buttons) */}
            <div>
              <Label>Role</Label>
              <div className="flex gap-4 mt-2">
                {/* Student Role */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === "student"}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#6A38C2] border-gray-300 focus:ring-[#6A38C2]"
                  />
                  <span className="text-gray-700">Student</span>
                </label>

                {/* Recruiter Role */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="recruiter"
                    checked={formData.role === "recruiter"}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#6A38C2] border-gray-300 focus:ring-[#6A38C2]"
                  />
                  <span className="text-gray-700">Recruiter</span>
                </label>
              </div>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role}</p>
              )}
            </div>

            {loading ? (
              <Button className={"w-full my-4"}>
                <Loader2 className=" mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white py-2 rounded-lg"
              >
                Login
              </Button>
            )}
          </form>

          {/* Forgot Password */}
          <p className="text-center text-gray-600 text-sm mt-4">
            <a
              href="/forgot-password"
              className="text-[#6A38C2] hover:underline"
            >
              Forgot Password?
            </a>
          </p>

          {/* Don't have an account */}
          <p className="text-center text-gray-600 text-sm mt-4">
            Don't have an account?{" "}
            <a href="/signup" className="text-[#6A38C2] hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
