import React, { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Navbar from "../shared/Navbar";
import { Loader2, X } from "lucide-react";
import axios from "axios";
import { USER_BASE_URL } from "@/utils/constant";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    file: "",
  });
  const navigate = useNavigate();
  const { loading } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileHandler = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files?.[0] }));
  };
  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, file: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  // Form validation
  const validate = () => {
    let newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone Number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number";
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
        const form = new FormData();
        form.append("fullName", formData.fullName);
        form.append("email", formData.email);
        form.append("phoneNumber", formData.phoneNumber);
        form.append("password", formData.password);
        form.append("role", formData.role);
        if (formData.file) {
          form.append("file", formData.file);
        }
        const res = await axios.post(`${USER_BASE_URL}/register`, form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
        if (res.data.success) {
          navigate("/login");
          toast.success(res.data.message);
        }
      } catch (err) {
        console.log(err);
        toast.error(err.response.data.message);
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-[40rem] bg-white shadow-md rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            Create an Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label className={"mb-2"}>Full Name</Label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

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

            {/* Phone Number */}
            <div>
              <Label className={"mb-2"}>Phone Number</Label>
              <Input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="1234567890"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber}
                </p>
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

            {/* Role */}
            <div className=" flex items-center justify-between ">
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
              <div className="flex flex-col gap-2">
                {/* File Upload */}
                <Label htmlFor="profile" className="text-gray-700">
                  Profile
                </Label>
                <Input
                  id="profile"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileHandler}
                  className="cursor-pointer max-w-[13rem] file:cursor-pointer file:bg-[#6A38C2] file:text-white file:border-none file:rounded-md file:py-1 file:px-3 hover:file:bg-[#5b30a6]"
                />

                {/* Show Preview if File is Selected */}
                {formData.file && (
                  <div className="relative mt-2 w-24 h-24">
                    <img
                      src={URL.createObjectURL(formData.file)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md border"
                    />
                    {/* Cross Button */}
                    <button
                      onClick={handleRemoveFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Error Message */}
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
                Sign Up
              </Button>
            )}
          </form>

          {/* Already have an account */}
          <p className="text-center text-gray-600 text-sm mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-[#6A38C2] hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
