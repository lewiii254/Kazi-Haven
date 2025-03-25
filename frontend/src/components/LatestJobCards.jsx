import React from "react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

const LatestJobCards = ({
  id,
  companyName,
  location,
  jobTitle,
  jobDescription,
  positions,
  jobType,
  salary,
}) => {
  const navigate = useNavigate();
  return (
    <div
      className=" p-5 rounded-md shadow-xl bg-white border border-gray-100 cursor-pointer"
      onClick={() => navigate(`/description/${id}`)}
    >
      <div>
        <h1 className=" font-medium text-lg">{companyName}</h1>
        <p className=" text-sm text-gray-500">{location}</p>
      </div>
      <div>
        <h1 className=" font-bold text-lg my-2">{jobTitle}</h1>
        <p className=" text-sm text-gray-600">{jobDescription}</p>
      </div>
      <div className=" flex items-center mt-4 gap-2">
        <Badge className={"text-blue-700 font-bold"} variant={"ghost"}>
          {positions} Positions
        </Badge>
        <Badge className={"text-[#f83002] font-bold"} variant={"ghost"}>
          {jobType}
        </Badge>
        <Badge className={"text-[#7209b7] font-bold"} variant={"ghost"}>
          {`${salary} ${salary > 100 ? "K/year" : "lpa"}`}
        </Badge>
      </div>
    </div>
  );
};

export default LatestJobCards;
