import React from "react";
import LatestJobCards from "./LatestJobCards";
import { useSelector } from "react-redux";
import { JobCardSkeleton } from "./ui/skeleton";

const LatestJobs = () => {
  const { allJobs, loading } = useSelector((state) => state.job);

  return (
    <div className="max-w-7xl mx-auto my-8 px-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8">
        <span className="text-[#6a38c2]">Latest & Top</span> Job Openings
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          // Show skeleton cards while loading
          Array.from({ length: 6 }).map((_, index) => (
            <JobCardSkeleton key={index} />
          ))
        ) : allJobs && allJobs.length > 0 ? (
          allJobs.slice(0, 6).map((item, index) => (
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
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No jobs available at the moment. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestJobs;
