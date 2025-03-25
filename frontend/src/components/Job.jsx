import React from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const Job = ({ job }) => {
  console.log(job);

  const navigate = useNavigate();

  const timeAgo = job?.createdAt
    ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
    : "";

  return (
    <div className=" p-5 rounded-md shadow-xl bg-white border border-gray-100">
      <div className=" flex items-center justify-between">
        <p className=" text-sm text-gray-500">{timeAgo || "Just now"}</p>
        <Button variant="outline" className=" rounded-full" size={"icon"}>
          <Bookmark />
        </Button>
      </div>
      <div className=" flex items-center gap-2 my-2">
        <Button variant={"outline"} className=" p-6" size={"icon"}>
          <Avatar>
            <AvatarImage src={job?.company?.logo} />
          </Avatar>
        </Button>
        <div>
          <h1 className=" font-medium text-lg">{job?.company?.name}</h1>
          <p className=" text-sm text-gray-500">{job?.location}</p>
        </div>
      </div>
      <div>
        <h1 className=" font-bold text-lg my-2">{job?.title}</h1>
        <p className=" text-sm  text-gray-600">{job?.description}</p>
      </div>
      <div className=" flex items-center mt-4 gap-2">
        <Badge className={"text-blue-700 font-bold"} variant={"ghost"}>
          {job?.position || 1} Positions
        </Badge>
        <Badge className={"text-[#f83002] font-bold"} variant={"ghost"}>
          {job?.jobType || "regular"}
        </Badge>
        <Badge className={"text-[#7209b7] font-bold"} variant={"ghost"}>
          {`${job?.salary} ${job?.salary > 100 ? "K/year" : "lpa"}`}
        </Badge>
      </div>
      <div className=" flex items-center gap-4 mt-4">
        <Button
          onClick={() => navigate(`/description/${job?._id}`)}
          variant={"outline"}
        >
          Details
        </Button>
        <Button className={"bg-[#7209b7]"}>Save for later</Button>
      </div>
    </div>
  );
};

export default Job;
