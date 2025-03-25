import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { COMPANY_BASE_URL } from "@/utils/constant";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setSingleCompany } from "@/redux/companySlice";

const CompanyCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [companyName, setCompanyName] = useState("");

  const registerNewCompany = async () => {
    try {
      const res = await axios.post(
        `${COMPANY_BASE_URL}/register`,
        { companyName },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res?.data?.success) {
        dispatch(setSingleCompany(res.data.company));
        const companyId = res?.data?.company?._id;
        setCompanyName("");
        toast.success(res.data.message);
        navigate(`/admin/companies/${companyId}`);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.message);
    }
  };
  return (
    <div>
      <Navbar />
      <div className=" max-w-4xl mx-auto my-10">
        <div className=" my-10">
          <h1 className=" font-bold text-2xl">Your company name</h1>
          <p className=" text-gray-500">
            What would you like to give your company name ? You can change this
            later.
          </p>
        </div>
        <Label>Company Name</Label>
        <Input
          type={"text"}
          className={"my-2"}
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder={"Jobhunt , Microsoft , etc..."}
        />
        <div className=" flex items-center gap-2 my-10">
          <Button
            variant={"outline"}
            onClick={() => navigate("/admin/companies")}
          >
            Cancel
          </Button>
          <Button onClick={registerNewCompany}>Continue</Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyCreate;
