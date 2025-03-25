import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import CompaniesTable from "./CompaniesTable";
import { useNavigate } from "react-router-dom";
import useGetAllAdminCompanies from "@/hooks/useGetAllAdminCompanies";
import { useSelector } from "react-redux";
import { X } from "lucide-react";

const Companies = () => {
  useGetAllAdminCompanies();
  const { allAdminCompanies } = useSelector((state) => state.company);
  const [filter, setFilter] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState(allAdminCompanies);
  console.log(filteredCompanies);

  useEffect(() => {
    const filteredData = allAdminCompanies.filter((item) =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredCompanies(filteredData);
  }, [filter]);

  const navigate = useNavigate();
  return (
    <div>
      <Navbar />
      <div className=" max-w-6xl mx-auto my-10 ">
        <div className="flex items-center justify-between my-5">
          <div className="relative w-[20rem]">
            <Input
              type="text"
              placeholder="Filter by name"
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
          <Button onClick={() => navigate("/admin/companies/create")}>
            Add New Company
          </Button>
        </div>
        <CompaniesTable data={filteredCompanies} />
      </div>
    </div>
  );
};

export default Companies;
