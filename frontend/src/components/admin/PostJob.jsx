import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { JOB_BASE_URL } from "@/utils/constant";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PostJob = () => {
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: 0,
    location: "",
    jobType: "",
    experienceLevel: 0,
    position: 0,
    company: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { allAdminCompanies } = useSelector((state) => state.company);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${JOB_BASE_URL}/post`, input, {
        withCredentials: true,
      });
      if (res.data.success) {
        navigate("/admin/jobs");
        toast.success(res.data.message);
      }
      console.log(res);
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Navbar />
      <div className=" flex items-center justify-center w-screen my-5">
        <form
          action=""
          onSubmit={handleSubmit}
          className=" p-8 max-w-4xl border-gray-200 shadow-lg rounded-md"
        >
          <div className=" flex items-center gap-5 p-8 ">
            <Button
              className={" flex items-center gap-2 text-gray-500 font-semibold"}
              variant={"outline"}
              type="button"
              onClick={() => navigate("/admin/jobs")}
            >
              <ArrowLeft />
              <span>Back</span>
            </Button>
            <h1 className=" font-bold text-xl">Add a job</h1>
          </div>
          <div className=" grid grid-cols-2 gap-2">
            <div>
              <Label>Title</Label>
              <Input
                type={"text"}
                name="title"
                value={input.title}
                onChange={changeEventHandler}
                className={
                  " focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                type={"text"}
                name="description"
                value={input.description}
                onChange={changeEventHandler}
                className={
                  " focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                }
              />
            </div>
            <div>
              <Label>Requirements</Label>
              <Input
                type={"text"}
                name="requirements"
                value={input.requirements}
                onChange={changeEventHandler}
                className={
                  " focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                }
              />
            </div>
            <div>
              <Label>Salary</Label>
              <Input
                type={"number"}
                name="salary"
                value={input.salary}
                onChange={changeEventHandler}
                className={
                  " focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                }
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                type={"text"}
                name="location"
                value={input.location}
                onChange={changeEventHandler}
                className={
                  " focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                }
              />
            </div>
            <div>
              <Label>Job Type</Label>
              <Input
                type={"text"}
                name="jobType"
                value={input.jobType}
                onChange={changeEventHandler}
                className={
                  " focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                }
              />
            </div>
            <div>
              <Label>Experience Level</Label>
              <Input
                type={"number"}
                name="experienceLevel"
                value={input.experienceLevel}
                onChange={changeEventHandler}
                className={
                  " focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                }
              />
            </div>
            <div>
              <Label>No of positions</Label>
              <Input
                type={"number"}
                name="position"
                value={input.position}
                onChange={changeEventHandler}
                className={
                  " focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                }
              />
            </div>
            {allAdminCompanies.length ? (
              <Select
                onValueChange={(value) => {
                  const selectedCompany = allAdminCompanies.find(
                    (item) => item?.name === value
                  );
                  setInput((prev) => ({
                    ...prev,
                    company: selectedCompany?._id,
                  }));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  {allAdminCompanies.map((item, index) => (
                    <SelectItem key={index} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <></>
            )}
          </div>
          {loading ? (
            <Button className={"w-full my-4"}>
              <Loader2 className=" mr-2 h-4 w-4 animate-spin" />
              Please wait...
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white py-2 rounded-lg mt-4"
            >
              Post new job
            </Button>
          )}
          {!allAdminCompanies.length && (
            <span className=" text-xs text-red-600 font-bold text-center my-3 mt-4">
              *Please register a company first , before posting jobs
            </span>
          )}
        </form>
      </div>
    </div>
  );
};

export default PostJob;
