import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import ApplicantsTable from "./ApplicantsTable";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { APPLICATION_BASE_URL } from "@/utils/constant";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

const Applicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    const fetchAllApplicants = async () => {
      try {
        const res = await axios.get(
          `${APPLICATION_BASE_URL}/${id}/applicants`,
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          setApplicants(res.data.job.application);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchAllApplicants();
  }, []);
  return (
    <div>
      <Navbar />
      <div className=" max-w-7xl mx-auto my-10">
        <div className=" flex items-center gap-4">
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
          </div>
          <h1 className=" font-bold text-xl my-5">
            Applicants ({applicants.length || 0})
          </h1>
        </div>
        <ApplicantsTable data={applicants} />
      </div>
    </div>
  );
};

export default Applicants;
