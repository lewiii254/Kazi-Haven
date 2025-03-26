import React, { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";

const filterData = [
  {
    filterType: "location",
    array: ["Nairobi", "Kisumu", "Mombasa", "Meru", "Nakuru", "Eldoret", "Embu", "Kakamega", "Thika", "Nyeri"],
  },
  {
    filterType: "industry",
    array: ["Frontend Developer", "Backend Developer", "Full-stack Developer", "Data Science", "Graphic Designer", "Mobile Developer", "UI/UX Designer", "Product Manager", "Software Engineer", "QA/Tester", "Marketing Manager", "Sales Manager", "Finance Manager", "Teacher", "Lecturer"],
  },
  {
    filterType: "job-type",
    array: ["Full-time", "Contract", "Part-time", "Internship"],
  },
];
const FilterCard = () => {
  const [selectedValue, setSelectedValue] = useState("");
  const dispatch = useDispatch();

  const changeHandler = (value) => {
    setSelectedValue(value);
  };
  useEffect(() => {
    dispatch(setSearchedQuery(selectedValue));
  }, [selectedValue]);
  return (
    <div className=" w-full bg-white p-3 rounded-md">
      <h1 className=" font-bold text-lg">Filter jobs</h1>
      <hr className=" mt-3" />
      <RadioGroup value={selectedValue} onValueChange={changeHandler}>
        {filterData.map((data, index) => (
          <div key={index}>
            <h1 className=" font-bold text-lg">{data.filterType}</h1>
            {data.array.map((item, idx) => {
              const itemId = `id${index}-${idx}`;
              return (
                <div className=" flex items-center space-x-2 my-2">
                  <RadioGroupItem value={item} key={itemId} />
                  <Label>{item}</Label>
                </div>
              );
            })}
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default FilterCard;
