import React, { useState } from "react";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = () => {
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };
  return (
    <div className=" text-center mt-6">
      <div className=" flex flex-col gap-5 my-10">
        <span className=" mx-auto px-4 py-2 rounded-full bg-gray-100 text-[#f83002] font-medium">
        🚀Launch Your Career with a Click – Let’s Get to Work!⚒
        </span>
        <h1 className=" text-5xl font-bold">
          Discover , apply & <br />
          Land your
          <span className=" text-[#6a38c2]"> Dream Career </span>
        </h1>
        <p>
        Step into a world of opportunity, where top-tier roles in technology, healthcare, finance and beyond await you. <br />
        Browse with ease, apply in a snap, and watch your professional dreams take flight. <br />
        From <span className=" text-2xl">coding wizards to healthcare heroes</span>, your next big <span>Job/Gig</span> is here – dive in today!🤞
        </p>
        <div className=" flex w-[40%] shadow-lg border border-gray-200 pl-3 rounded-full items-center gap-4 mx-auto">
          <input
            type="text"
            placeholder="Find your dream jobs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className=" outline-none border-none w-full"
          />
          <Button
            className={"rounded-r-full bg-[#6a38c2]"}
            onClick={searchJobHandler}
          >
            <Search className=" h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
