import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_BASE_URL } from "@/utils/constant";
import { setLoading, setUser } from "@/redux/authSlice";
import { toast } from "sonner";

const ProfileUpdateDialog = ({ isOpen, setOpen }) => {
  const { user, loading } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [input, setInput] = useState({
    fullName: user?.fullName,
    email: user?.email,
    phoneNumber: user?.phoneNumber,
    bio: user?.profile?.bio,
    skills: user?.profile?.skills?.map((skill) => skill),
    file: user?.profile?.resume,
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: [e.target.value] });
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setInput({ ...input, file });
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("fullName", input.fullName);
    form.append("email", input.email);
    form.append("phoneNumber", input.phoneNumber);
    form.append("bio", input.bio);
    form.append("skills", input.skills);
    if (input.file) {
      form.append("file", input.file);
    }

    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_BASE_URL}/profile/update`, form, {
        headers: {
          "Content-Type": "multipart//form-data",
        },
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.message);
    } finally {
      dispatch(setLoading(false));
      setOpen(false);
    }
  };
  return (
    <div>
      <Dialog open={isOpen} setOpen={setOpen}>
        <DialogContent
          className="sm:max-w-[425px]"
          onInteractOutside={() => {
            setInput({
              fullName: user?.fullName,
              email: user?.email,
              phoneNumber: user?.phoneNumber,
              bio: user?.profile?.bio,
              skills: user?.profile?.skills?.map((skill) => skill),
              file: user?.profile?.resume,
            });
            setOpen(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitHandler}>
            <div className=" grid gap-4 py-4">
              <div className=" grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className={"text-right"}>
                  Name
                </Label>
                <Input
                  id="name"
                  name="fullName"
                  type="text"
                  value={input?.fullName}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className=" grid gap-4 py-4">
              <div className=" grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className={"text-right"}>
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={input?.email}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className=" grid gap-4 py-4">
              <div className=" grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number" className={"text-right"}>
                  Number
                </Label>
                <Input
                  id="number"
                  name="phoneNumber"
                  value={input?.phoneNumber}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className=" grid gap-4 py-4">
              <div className=" grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className={"text-right"}>
                  Bio
                </Label>
                <Input
                  id="bio"
                  name="bio"
                  value={input?.bio}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className=" grid gap-4 py-4">
              <div className=" grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className={"text-right"}>
                  Skills
                </Label>
                <Input
                  id="skills"
                  name="skills"
                  value={input?.skills}
                  onChange={changeEventHandler}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className=" grid gap-4 py-4">
              <div className=" grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className={"text-right"}>
                  Resume
                </Label>
                <Input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
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
                  Update
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileUpdateDialog;
