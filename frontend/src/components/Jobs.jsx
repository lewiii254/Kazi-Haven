import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import FilterCard from "./FilterCard";
import Job from "./Job";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { useSelector } from "react-redux";

const Jobs = () => {
  useGetAllJobs();
  const { allJobs, searchedQuery } = useSelector((state) => state.job);
  const [filteredJobs, setFilteredJobs] = useState(allJobs);

  useEffect(() => {
    if (searchedQuery) {
      const filterJobs = allJobs.filter((job) => {
        return (
          job.title.toLowerCase().includes(searchedQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchedQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchedQuery.toLowerCase()) ||
          job.jobType.toLowerCase().includes(searchedQuery.toLowerCase())
        );
      });
      setFilteredJobs(filterJobs);
    } else {
      setFilteredJobs(allJobs);
    }
  }, [allJobs, searchedQuery]);

  return (
    <div>
      <Navbar />
      <div className=" max-w-7xl mx-auto mt-5">
        <div className=" flex gap-5">
          <div className=" w-[20%]">
            <FilterCard />
          </div>
          {!filteredJobs.length ? (
            <span>No job found</span>
          ) : (
            <div className=" flex-1 h-[88vh] overflow-y-auto pb-5">
              <div className=" grid grid-cols-3 gap-4">
                {filteredJobs.map((item, index) => (
                  <div>
                    <Job key={index} job={item} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
