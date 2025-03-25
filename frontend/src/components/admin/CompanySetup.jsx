import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import axios from "axios";
import { COMPANY_BASE_URL } from "@/utils/constant";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import useGetCompanyById from "@/hooks/useGetCompanyById";

const CompanySetup = () => {
  const [input, setInput] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
    file: "",
  });

  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const { singleCompany } = useSelector((state) => state.company);
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: [e.target.value] });
  };
  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(input.file);

    const form = new FormData();
    form.append("name", input.name);
    form.append("description", input.description);
    form.append("website", input.website);
    form.append("location", input.location);
    if (input.file) {
      form.append("file", input.file);
    }
    try {
      setIsLoading(true);
      const res = await axios.put(`${COMPANY_BASE_URL}/update/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      console.log(res);
      if (res?.data?.success) {
        toast.success(res.data.message);
        navigate("/admin/companies");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useGetCompanyById(id);
  useEffect(() => {
    setInput({
      name: singleCompany?.name || "",
      description: singleCompany?.description || "",
      location: singleCompany?.location || "",
      website: singleCompany?.website || "",
      file: singleCompany?.file || null,
    });
  }, [singleCompany]);
  return (
    <div>
      <Navbar />
      <div className=" max-w-xl mx-auto my-10">
        <form action="" onSubmit={submitHandler}>
          <div className=" flex items-center gap-5 p-8 ">
            <Button
              className={" flex items-center gap-2 text-gray-500 font-semibold"}
              variant={"outline"}
              type="button"
              onClick={() => navigate("/admin/companies")}
            >
              <ArrowLeft />
              <span>Back</span>
            </Button>
            <h1 className=" font-bold text-xl">Company setup</h1>
          </div>
          <div className=" grid grid-cols-2 gap-4">
            <div className=" flex flex-col gap-2">
              <Label>Company Name</Label>
              <Input
                type={"text"}
                placeholder=""
                name="name"
                value={input.name}
                onChange={changeEventHandler}
              />
            </div>
            <div className=" flex flex-col gap-2">
              <Label>Description</Label>
              <Input
                type={"text"}
                placeholder=""
                name="description"
                value={input.description}
                onChange={changeEventHandler}
              />
            </div>
            <div className=" flex flex-col gap-2">
              <Label>Website</Label>
              <Input
                type={"text"}
                placeholder=""
                name="website"
                value={input.website}
                onChange={changeEventHandler}
              />
            </div>
            <div className=" flex flex-col gap-2">
              <Label>Location</Label>
              <Input
                type={"text"}
                placeholder=""
                name="location"
                value={input.location}
                onChange={changeEventHandler}
              />
            </div>
            <div className=" flex flex-col gap-2">
              <Label>Logo</Label>
              <Input
                type={"file"}
                name="file"
                accept="image/*"
                onChange={changeFileHandler}
              />
            </div>
          </div>
          {isLoading ? (
            <Button className={"w-full my-4"}>
              <Loader2 className=" mr-2 h-4 w-4 animate-spin" />
              Please wait...
            </Button>
          ) : (
            <Button
              type="submit"
              className="w-full mt-4 bg-[#6A38C2] hover:bg-[#5b30a6] text-white py-2 rounded-lg"
            >
              Update
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CompanySetup;
