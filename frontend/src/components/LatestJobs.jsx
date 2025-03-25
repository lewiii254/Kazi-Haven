import React from "react";
import LatestJobCards from "./LatestJobCards";
import { useSelector } from "react-redux";

const LatestJobs = () => {
  const { allJobs } = useSelector((state) => state.job);

  return (
    <div className=" max-w-7xl mx-auto my-5">
      <h1 className=" text-4xl font-bold">
        <span className="text-[#6a38c2]">Latest & Top</span> Job Openings
      </h1>
      <div className=" grid grid-cols-3 gap-4 my-5">
        {allJobs.slice(0, 6).map((item, index) => (
          <LatestJobCards
            key={index}
            companyName={item?.company?.name}
            location={item?.location}
            jobTitle={item?.title}
            jobDescription={item?.description}
            positions={item?.position}
            jobType={item?.jobType}
            salary={item?.salary}
            id={item?._id}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestJobs;
