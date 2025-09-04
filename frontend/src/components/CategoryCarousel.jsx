import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Button } from "./ui/button";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "@/redux/jobSlice";

const category = [
  "Frontend Developer",
  "Backend Developer",
  "Data Science",
  "Graphic Designer",
  "Full Stack Developer",
  "Mobile Developer",
  "UI/UX Designer",
  "Product Manager",
  "Project Manager",
  "QA/Tester",
  "Marketing Manager",
  "Sales Manager",
  "Finance Manager",
  "Teacher",
  "Lecturer",
];
const CategoryCarousel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = (query) => {
    console.log(query);

    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };
  return (
    <div className="px-4">
      <Carousel className="w-full max-w-4xl mx-auto my-8">
        <CarouselContent className="-ml-2 md:-ml-4">
          {category.map((cat, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-auto">
              <Button
                variant="outline"
                className="rounded-full text-xs sm:text-sm whitespace-nowrap px-3 py-2 sm:px-4 sm:py-2 hover:bg-[#6a38c2] hover:text-white transition-colors duration-300"
                onClick={() => searchJobHandler(cat)}
              >
                {cat}
              </Button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
};

export default CategoryCarousel;
