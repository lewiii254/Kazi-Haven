import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { LogOut, User2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getInitialName, USER_BASE_URL } from "@/utils/constant";
import { setLoading, setUser } from "@/redux/authSlice";
import { toast } from "sonner";
import ThemeToggle from '@/components/ThemeToggle';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get(`${USER_BASE_URL}/logout`, {
        withCredentials: true,
      });
      navigate("/");
      toast.success(res.data.message);

      dispatch(setUser(null));
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="bg-white shadow-md sticky top-0 z-50 dark:bg-gray-900 dark:text-white">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-6">
        {/* Logo */}
        <Link to={"/"}>
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide font-[Poppins]">
              Kazi
              <span className="text-[#f83002] font-[Dancing Script] text-4xl italic drop-shadow-lg">
                Haven
              </span>
            </h1>
          </div>
        </Link>

        {/* Nav Items */}
        <div className="flex items-center gap-12">
          <ul className="flex font-medium items-center gap-6 text-gray-700">
            {user && user.role === "recruiter" ? (
              <>
                <li className="hover:text-[#f83002] transition-colors duration-300 cursor-pointer">
                  <Link to={"/admin/jobs"}>Jobs</Link>
                </li>
                <li className="hover:text-[#f83002] transition-colors duration-300 cursor-pointer">
                  <Link to={"/admin/companies"}>Companies</Link>
                </li>
              </>
            ) : (
              <>
                 <ThemeToggle />
                <li className="hover:text-[#f83002] transition-colors duration-300 cursor-pointer dark:text-white">
                  <Link to={"/"}>Home</Link>
                </li>
                <li className="hover:text-[#f83002] transition-colors duration-300 cursor-pointer dark:text-white">
                  <Link to={"/jobs"}>Jobs</Link>
                </li>
                <li className="hover:text-[#f83002] transition-colors duration-300 cursor-pointer dark:text-white">
                  <Link to={"/browse"}>Browse</Link>
                </li>
              </>
            )}
          </ul>

          {/* User Actions */}
          {!user ? (
            <div className="flex items-center gap-4">
              <Link to={"/login"}>
                <Button
                  variant={"outline"}
                  className="border-gray-300 hover:border-gray-400 text-gray-700 cursor-pointer dark:text-white"
                >
                  Login
                </Button>
              </Link>
              <Link to={"/signup"}>
                <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white cursor-pointer">
                  Sign Up
                </Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer ring-2 ring-gray-300 hover:ring-gray-400 transition duration-300">
                  <AvatarImage
                    src={user?.profile?.profilePhoto}
                    alt="profile image"
                  />
                  <AvatarFallback>
                    {getInitialName(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4 shadow-lg rounded-xl border bg-white">
                <div>
                  {/* Profile Info */}
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="cursor-pointer">
                      <AvatarImage
                        src={user?.profile?.profilePhoto}
                        alt="profile image"
                      />
                      <AvatarFallback>
                        {getInitialName(user?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-lg">
                        {user?.fullName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {user?.profile?.bio || "Mern Stack Developer"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 text-gray-600">
                    {user && user.role !== "recruiter" && (
                      <div className="flex items-center gap-2 hover:text-[#6A38C2] cursor-pointer">
                        <User2 size={20} />
                        <Button variant={"link"}>
                          <Link to={"/profile"}>View Profile</Link>
                        </Button>
                      </div>
                    )}

                    <div
                      className="flex items-center gap-2 hover:text-red-500 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut size={20} />
                      <Button variant={"link"}>Logout</Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
