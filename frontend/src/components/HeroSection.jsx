import React from "react";
import EnhancedSearch from "./EnhancedSearch";

const HeroSection = () => {
  return (
    <div className="text-center mt-6 px-4">
      <div className="flex flex-col gap-5 my-10">
        <span className="mx-auto px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-[#f83002] font-medium text-sm sm:text-base">
        🚀Launch Your Career with a Click – Let’s Get to Work!⚒
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          Discover , apply & <br />
          Land your
          <span className="text-[#6a38c2]"> Dream Career </span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg max-w-4xl mx-auto leading-relaxed">
        Step into a world of opportunity, where top-tier roles in technology, healthcare, finance and beyond await you. <br />
        Browse with ease, apply in a snap, and watch your professional dreams take flight. <br />
        From <span className="text-lg sm:text-xl md:text-2xl font-semibold">coding wizards to healthcare heroes</span>, your next big <span className="font-semibold">Job/Gig</span> is here – dive in today!🤞
        </p>
        <EnhancedSearch />
      </div>
    </div>
  );
};

export default HeroSection;
