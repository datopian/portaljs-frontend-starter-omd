"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/_shared/Table";
// import { Input } from "~/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "~/components/ui/select";
import { Chip } from "@/components/_shared/Chip";
import { ArrowDownIcon } from "@heroicons/react/20/solid";

type Column = {
  name: string;
  description: string;
  displayName: string;
  tags: {
    source: string;
    name: string;
  }[];
  dataType: string;
};
type Tag = {};

export default function ColumnsList({
  columns,
  glossaryTerm,
}: {
  columns: Column[];
  glossaryTerm?: { name?: string; description?: string };
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const sortedColumns = useMemo(() => {
    if (!columns) return [];

    const filteredColumns = columns.filter((column) => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        column.name?.toLowerCase().includes(searchTerm) ||
        column.description?.toLowerCase().includes(searchTerm)
      );
    });

    const sorted = [...filteredColumns].sort((a, b) => {
      const nameA = (a.displayName ?? a.name).toUpperCase();
      const nameB = (b.displayName ?? b.name).toUpperCase();
      if (nameA < nameB) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (nameA > nameB) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [columns, searchQuery, sortOrder]);
  const handleSortOrderChange = (value: "asc" | "desc") => {
    setSortOrder(value);
  };

  return (
    <div className="">
      <div className="mb-5 flex items-center text-sm text-muted-foreground">
        Glossary Term: {glossaryTerm ? <div>TODO</div> : "None"}
      </div>
      <div className="flex items-center justify-between gap-x-4 pb-5">
        <input
          type="search"
          placeholder="Search columns..."
          className={`w-full rounded-[10px] border-1 bg-white  py-2 px-4 md:py-2 md:px-4 border leading-none placeholder-gray-500 shadow-sm`}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          aria-label="Sort datasets by"
          className="appearance-none rounded-[10px] border-1 bg-white py-2 px-4 border leading-none shadow-sm"
          value={sortOrder}
          onChange={(e) =>
            handleSortOrderChange(e.target.value as "asc" | "desc")
          }
        >
          <option value="asc">Name (A-Z)</option>
          <option value="desc">Name (Z-A)</option>
        </select>
      </div>

      <Table>
        <TableCaption>A list of columns in the current table.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Glossary Terms</TableHead>
            <TableHead>Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedColumns.map((column, index) => {
            const glossaryTerms = column.tags?.filter(
              (g) => g.source == "Glossary"
            );
            const tags = column.tags?.filter((g) => g.source != "Glossary");
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">{column.name}</TableCell>
                <TableCell>
                  <div>{column.dataType}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {column.description || "No description available"}
                </TableCell>
                <TableCell>
                  {/*glossaryTerms?.map((gt) => {
                    return (
                      <GlossaryTermChipLink
                        key={`col-${column.name}-glossary-${gt.name}`}
                        term={gt}
                      />
                    );
                  })*/}
                </TableCell>
                <TableCell>
                  {tags?.map((t) => {
                    return (
                      <Chip
                        key={`col-${column.name}-glossary-${t.name}`}
                        text={t.name}
                      />
                    );
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
