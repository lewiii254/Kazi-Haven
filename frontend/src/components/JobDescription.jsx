import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { APPLICATION_BASE_URL, JOB_BASE_URL } from "@/utils/constant";
import { setSingleJob } from "@/redux/jobSlice";
import { toast } from "sonner";

const JobDescription = () => {
  const { id } = useParams();

  const { singleJob } = useSelector((state) => state.job);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const isInitiallyApplied =
    singleJob?.application.some(
      (app) => app.applicant?.toString() === user?._id?.toString()
    ) || false;
  const [isApplied, setIsApplied] = useState(isInitiallyApplied);

  const applyJobHandler = async () => {
    try {
      const res = await axios.get(`${APPLICATION_BASE_URL}/apply/${id}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setIsApplied(true);
        const updatedSingleJob = {
          ...singleJob,
          application: [...singleJob.application, { applicant: user?._id }],
        };
        dispatch(setSingleJob(updatedSingleJob));
        toast.success(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.success(err.response.data.message);
    }
  };

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_BASE_URL}/get/${id}`, {
          withCredentials: true,
        });

        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
          setIsApplied(
            res.data.job.application.some(
              (application) => application.applicant.toString() === user?._id
            )
          );
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchSingleJob();
  }, [id, user?._id, dispatch]);

  // const job = allJobs?.length ? allJobs.find((item) => item._id === id) : null;

  const formattedDate = new Date(singleJob?.createdAt).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
  return (
    <>
      <Navbar />
      <div className=" max-w-7xl mx-auto my-10">
        <Button
          className={"cursor-pointer"}
          variant={"outline"}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft />
          Go Back
        </Button>
        <div className=" flex items-center justify-between ">
          <div>
            <h1 className=" font-bold text-xl">{}</h1>
            <div className=" flex items-center mt-4 gap-2">
              <Badge className={"text-blue-700 font-bold"} variant={"ghost"}>
                {singleJob?.position} Positions
              </Badge>
              <Badge className={"text-[#f83002] font-bold"} variant={"ghost"}>
                {singleJob?.jobType}
              </Badge>
              <Badge className={"text-[#7209b7] font-bold"} variant={"ghost"}>
                {`${singleJob?.salary} ${
                  singleJob?.salary > 100 ? "K/year" : "lpa"
                }`}
              </Badge>
            </div>
          </div>
          <Button
            onClick={applyJobHandler}
            disabled={isApplied}
            className={`rounded-lg ${
              isApplied
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-[#7209b7] hover:bg-[#5f32ad]"
            }`}
          >
            {isApplied ? "Already applied" : "Apply Now"}
          </Button>
        </div>
        <h1 className=" border-b-2 border-b-gray-300 font-medium py-4">
          {singleJob?.title}
        </h1>
        <div className=" my-4">
          <h1 className=" font-bold my-1">
            Role:
            <span className=" pl-4 font-normal text-gray-800">
              {singleJob?.title}
            </span>
          </h1>
          <h1 className=" font-bold my-1">
            Location:
            <span className=" pl-4 font-normal text-gray-800">
              {singleJob?.location}
            </span>
          </h1>
          <h1 className=" font-bold my-1">
            Description :
            <span className=" pl-4 font-normal text-gray-800">
              {singleJob?.description}
            </span>
          </h1>
          <h1 className=" font-bold my-1">
            Experience :
            <span className=" pl-4 font-normal text-gray-800">
              {singleJob?.experienceLevel} years
            </span>
          </h1>
          <h1 className=" font-bold my-1">
            Salary :
            <span className=" pl-4 font-normal text-gray-800">{`${
              singleJob?.salary
            } ${singleJob?.salary > 100 ? "K/year" : "lpa"}`}</span>
          </h1>
          <h1 className=" font-bold my-1">
            Total Applicants :
            <span className=" pl-4 font-normal text-gray-800">
              {singleJob?.application.length || 0}
            </span>
          </h1>
          <h1 className=" font-bold my-1">
            Posted Date :
            <span className=" pl-4 font-normal text-gray-800">
              {formattedDate || "sdd"}
            </span>
          </h1>
        </div>
      </div>
    </>
  );
};

export default JobDescription;
