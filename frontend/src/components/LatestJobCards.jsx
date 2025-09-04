import React from "react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, DollarSign, Bookmark } from "lucide-react";
import SocialShare from "./SocialShare";
import { Button } from "./ui/button";

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
  
  const formatSalary = (salary) => {
    if (!salary) return "Negotiable";
    return `${salary} ${salary > 100 ? "K/year" : "K/month"}`;
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    // Add bookmark functionality here
    console.log("Bookmarked job:", id);
  };

  return (
    <div className="p-4 sm:p-6 rounded-lg shadow-lg bg-white border border-gray-100 cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-white hover:shadow-xl hover:border-[#6a38c2]/20 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h1 className="font-semibold text-lg group-hover:text-[#6a38c2] transition-colors duration-300">
            {companyName}
          </h1>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {location}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          <div onClick={(e) => e.stopPropagation()}>
            <SocialShare 
              jobTitle={jobTitle}
              companyName={companyName}
              jobUrl={`${window.location.origin}/description/${id}`}
            />
          </div>
        </div>
      </div>
      
      <div 
        className="mb-4 cursor-pointer"
        onClick={() => navigate(`/description/${id}`)}
      >
        <h2 className="font-bold text-lg mb-2 line-clamp-2">{jobTitle}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {jobDescription}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className="text-blue-700 font-medium text-xs" variant="secondary">
          {positions} Position{positions > 1 ? 's' : ''}
        </Badge>
        <Badge className="text-[#f83002] font-medium text-xs" variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          {jobType}
        </Badge>
        <Badge className="text-[#7209b7] font-medium text-xs" variant="secondary">
          <DollarSign className="h-3 w-3 mr-1" />
          {formatSalary(salary)}
        </Badge>
      </div>
      
      <div 
        className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-[#6a38c2]"
        onClick={() => navigate(`/description/${id}`)}
      >
        Click to view details →
      </div>
    </div>
  );
};

export default LatestJobCards;
