import React from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Browse = () => {
  const { allJobs, searchedQuery } = useSelector((state) => state.job);
  const navigate = useNavigate();

  const filteredJobs = allJobs?.filter((job) =>
    job.title.toLowerCase().includes(searchedQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className=" max-w-7xl mx-auto my-10">
        <div>
          <div className=" flex items-center gap-4">
            <div className=" flex items-center gap-5 p-8 ">
              <Button
                className={
                  " flex items-center gap-2 text-gray-500 font-semibold"
                }
                variant={"outline"}
                type="button"
                onClick={() => navigate("/")}
              >
                <ArrowLeft />
                <span>Back</span>
              </Button>
            </div>
            <h1 className=" font-bold text-lg my-10">
              Search Results ({filteredJobs.length})
            </h1>
          </div>
          <div
            className={`grid ${
              filteredJobs.length > 0
                ? "grid-cols-3 gap-4"
                : "flex items-center justify-center h-64"
            }`}
          >
            {filteredJobs.length > 0 ? (
              filteredJobs.map((item, index) => <Job key={index} job={item} />)
            ) : (
              <div className="text-gray-500"> No jobs found...</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Browse;
