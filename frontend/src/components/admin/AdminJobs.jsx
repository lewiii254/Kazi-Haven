import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import useGetAllAdminCompanies from "@/hooks/useGetAllAdminCompanies";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import AdminJobsTable from "./AdminJobsTable";
import useGetAllAdminJobs from "@/hooks/useGetAllAdminJobs";

const AdminJobs = () => {
  useGetAllAdminCompanies();
  const { allAdminJobs } = useSelector((state) => state.job);
  const [filter, setFilter] = useState("");
  const [filteredJobs, setFilteredJobs] = useState(allAdminJobs);

  useEffect(() => {
    const filteredData = allAdminJobs.filter(
      (item) =>
        item.title.toLowerCase().includes(filter.toLowerCase()) ||
        item.company?.name?.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredJobs(filteredData);
  }, [filter, allAdminJobs]);
  useGetAllAdminJobs();

  const navigate = useNavigate();
  return (
    <div>
      <Navbar />
      <div className=" max-w-6xl mx-auto my-10 ">
        <div className="flex items-center justify-between my-5">
          <div className="relative w-[20rem]">
            <Input
              type="text"
              placeholder="Filter by name , Role"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pr-10 "
            />
            {filter && (
              <X
                className="absolute right-2 mr-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700"
                size={20}
                onClick={() => setFilter("")}
              />
            )}
          </div>
          <Button onClick={() => navigate("/admin/jobs/create")}>
            Post new job
          </Button>
        </div>
        <AdminJobsTable data={filteredJobs} />
      </div>
    </div>
  );
};

export default AdminJobs;
