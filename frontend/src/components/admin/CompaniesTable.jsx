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
import { Avatar, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CompaniesTable = ({ data }) => {
  const navigate = useNavigate();

  return (
    <div>
      <Table>
        <TableCaption>
          {data.length
            ? "A list of your recent registered companies."
            : "No Company found..."}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
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
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.logo} alt="profile image" />
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="font-medium">
                  {item.location || "-"}
                </TableCell>
                <TableCell className="font-medium">
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium text-right">
                  <Popover>
                    <PopoverTrigger>
                      <MoreHorizontal />
                    </PopoverTrigger>
                    <PopoverContent className={"w-24"}>
                      <div
                        className="flex items-center gap-4 w-fit cursor-pointer"
                        onClick={() =>
                          navigate(`/admin/companies/${item?._id}`)
                        }
                      >
                        <Edit2 />
                        <span>Edit</span>
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

export default CompaniesTable;
