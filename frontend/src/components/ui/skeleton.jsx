import React from 'react';

const Skeleton = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
};

export const JobCardSkeleton = () => {
  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-5 w-48 mb-2" />
      <Skeleton className="h-4 w-full mb-4" />
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-14" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
};

export const HeroSkeleton = () => {
  return (
    <div className="text-center mt-6 px-4">
      <div className="flex flex-col gap-5 my-10">
        <Skeleton className="mx-auto h-8 w-96" />
        <Skeleton className="mx-auto h-12 w-80 mb-4" />
        <div className="space-y-2">
          <Skeleton className="mx-auto h-4 w-full max-w-2xl" />
          <Skeleton className="mx-auto h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="mx-auto h-12 w-full max-w-lg" />
      </div>
    </div>
  );
};

export default Skeleton;