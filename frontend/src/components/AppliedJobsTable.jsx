import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";

const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case "accepted":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-orange-100 text-orange-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "";
  }
};

const AppliedJobsTable = ({ appliedJobs }) => {
  return (
    <div>
      <Table>
        <TableCaption>
          {appliedJobs.length ? "A list of your applied jobs." : ""}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Job Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appliedJobs.length > 0 ? (
            appliedJobs.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {new Date(item?.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{item?.job?.title}</TableCell>
                <TableCell>{item?.job?.company.name}</TableCell>
                <TableCell className="text-right">
                  <Badge className={getStatusBadgeColor(item.status)}>
                    {item?.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                You haven't applied any job yet .
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppliedJobsTable;
