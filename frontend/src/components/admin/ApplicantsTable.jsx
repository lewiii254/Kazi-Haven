import React, { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from "axios";
import { APPLICATION_BASE_URL } from "@/utils/constant";
import { toast } from "sonner";

const ApplicantsTable = ({ data }) => {
  console.log(data);

  const [applicationData, setApplicationData] = useState(data);
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-700 w-[180px]";
      case "pending":
        return "bg-orange-200 text-orange-700 w-[180px]";
      case "rejected":
        return "bg-red-200 text-red-700 w-[180px]";
      default:
        return "w-[180px]";
    }
  };
  useEffect(() => {
    setApplicationData(data);
  }, [data]);

  const updateApplicationStatus = async (item, status) => {
    console.log(item, status);
    try {
      setApplicationData((prev) =>
        prev.map((app) => (app._id === item._id ? { ...app, status } : app))
      );
      const res = await axios.put(
        `${APPLICATION_BASE_URL}/status/${item?._id}/update`,
        { status },
        { withCredentials: true }
      );
      if (res.data.success) {
        setApplicationData((prev) =>
          prev.map((app) => (app._id === item._id ? { ...app, status } : app))
        );
        toast.success(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.message);
    }
  };

  return (
    <div>
      <Table>
        <TableCaption>
          {applicationData.length ? (
            "A list of your recent applied users."
          ) : (
            <span>No applicants found</span>
          )}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {applicationData.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {item?.applicant?.fullName || "N/A"}
              </TableCell>
              <TableCell>{item?.applicant?.email || "N/A"}</TableCell>
              <TableCell>{item?.applicant?.phoneNumber || "N/A"}</TableCell>
              <TableCell>
                {item?.applicant?.profile?.resume ? (
                  <a
                    href={item?.applicant?.profile?.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {item?.applicant?.profile?.resumeOriginalName}
                  </a>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell>
                {new Date(item.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Select
                  onValueChange={(value) => {
                    updateApplicationStatus(item, value);
                  }}
                >
                  <SelectTrigger className={getStatusColor(item?.status)}>
                    <SelectValue placeholder={item?.status} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">pending</SelectItem>
                    <SelectItem value="Accepted">accepted</SelectItem>
                    <SelectItem value="Rejected">rejected</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicantsTable;
