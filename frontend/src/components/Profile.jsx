import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, Mail, Pen } from "lucide-react";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import AppliedJobsTable from "./AppliedJobsTable";
import { useSelector } from "react-redux";
import ProfileUpdateDialog from "./ProfileUpdateDialog";
import { getInitialName } from "@/utils/constant";
import { AvatarFallback } from "@radix-ui/react-avatar";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";

const Profile = () => {
  useGetAppliedJobs();
  const { user } = useSelector((state) => state.auth);
  const { appliedJobs } = useSelector((state) => state.application);
  const [isOpen, setOpen] = useState(false);

  return (
    <div>
      <Navbar />
      <div className=" max-w-7xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8">
        <div className=" flex items-center justify-between">
          <div className=" flex items-center gap-4 ">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={user?.profile?.profilePhoto}
                alt="profile image"
              />
              <AvatarFallback className={" ml-4 mt-7 text-2xl"}>
                {getInitialName(user?.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className=" font-medium text-xl">{user?.fullName}</h1>
              <p>{user?.profile?.bio || ""}</p>
            </div>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className={"text-right"}
            variant={"outline"}
          >
            <Pen />
          </Button>
        </div>
        <div className=" my-5">
          <div className=" flex items-center gap-3 my-2">
            <Mail />
            <span>{user?.email}</span>
          </div>
          <div className=" flex items-center gap-3 my-2">
            <Contact />
            <span>{user?.phoneNumber}</span>
          </div>
        </div>
        <div className=" my-5">
          <h1>Skills</h1>
          <div className=" flex items-center gap-4">
            {!user?.profile?.skills.length ? (
              <span>NA</span>
            ) : (
              user?.profile?.skills.map((skill, index) => (
                <Badge key={index}>{skill}</Badge>
              ))
            )}
          </div>
        </div>
        <div className=" grid max-w-sm w-full items-center gap-1.5">
          <Label className={" text-md font-bold"}>Resume</Label>
          {user?.profile?.resume ? (
            <a
              href={user?.profile?.resume || ""}
              target="_blank"
              className=" text-blue-500 cursor-pointer hover:underline"
            >
              {user?.profile?.resumeOriginalName}
            </a>
          ) : (
            <span>No resume</span>
          )}
        </div>
      </div>
      <div className=" max-w-4xl mx-auto bg-white rounded-2xl">
        <h1 className=" font-bold text-lg my-4">Applied jobs</h1>
        <AppliedJobsTable appliedJobs={appliedJobs} />
      </div>
      <ProfileUpdateDialog isOpen={isOpen} setOpen={setOpen} />
    </div>
  );
};

export default Profile;
