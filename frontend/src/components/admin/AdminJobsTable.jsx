import React from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, Eye, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminJobsTable = ({ data }) => {
  const navigate = useNavigate();

  return (
    <div>
      <Table>
        <TableCaption>
          {data.length
            ? "A list of your recent posted jobs."
            : "No Jobs found..."}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Company Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Job-Type</TableHead>
            <TableHead>Requirements</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className={"text-right"}>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...data]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {item.company?.name}
                </TableCell>
                <TableCell className="font-medium">
                  {item.title || "-"}
                </TableCell>
                <TableCell className="font-medium">
                  {item.jobType || "-"}
                </TableCell>
                <TableCell className="font-medium">
                  {item.requirements?.length > 0
                    ? item.requirements.join(", ")
                    : "-"}
                </TableCell>
                <TableCell className="font-medium">
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium text-right">
                  <Popover>
                    <PopoverTrigger>
                      <MoreHorizontal />
                    </PopoverTrigger>
                    <PopoverContent className={"w-34"}>
                      <div
                        className="flex items-center gap-2 w-fit cursor-pointer mt-2"
                        onClick={() =>
                          navigate(`/admin/jobs/${item?._id}/applicants`)
                        }
                      >
                        <Eye className=" w-5" />
                        <span>Applicants</span>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminJobsTable;
