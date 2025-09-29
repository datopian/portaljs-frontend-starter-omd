import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/_shared/Table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import useSWR from "swr";

export function TermsList({ path }: { path: string }) {
  const [directChildrenOf, setDirectChildrenOf] = useState(path);
  const [data, setData] = useState<any>();
  const { data: apiData, isValidating: isLoading } = useSWR(
    [directChildrenOf, path],
    async (directChildrenOf) => {
      const res = await fetch(
        `/api/glossaries/terms?directChildrenOf=${directChildrenOf}&fields=childrenCount`
      );
      const data = await res.json();
      return data;
    }
  );

  useEffect(() => {
    if (!data) {
      setData(apiData?.data);
    } else {
      const recursive = (node: any) => {
        if (node?.fullyQualifiedName == directChildrenOf) {
          return node;
        }
        if (Array.isArray(node)) {
          for (let sn of node) {
            const result: any = recursive(sn);
            if (result) {
              return result;
            }
          }
        } else if (node.children) {
          return recursive(node.children);
        }
        return undefined;
      };
      setData((prev: any) => {
        const newData = structuredClone(prev);
        const node = recursive(newData);
        if (node) {
          node.children = apiData?.data ?? [];
        }
        return newData;
      });
    }
  }, [apiData?.data]);

  const columns = useMemo<
    ColumnDef<{
      displayName: string;
      description: string;
      children: any[];
      childrenCount: number;
      fullyQualifiedName: string;
    }>[]
  >(
    () => [
      {
        accessorKey: "displayName",
        header: "Name",
        cell: ({ row, getValue }) => {
          return (
            <div
              style={{ paddingLeft: `${row.depth * 2}rem` }}
              className="text-nowrap"
            >
              {row.getCanExpand() ? (
                <button
                  className="text-nowrap"
                  onClick={() => {
                    row.toggleExpanded();
                    setDirectChildrenOf(row.original.fullyQualifiedName);
                  }}
                >
                  {row.getIsExpanded() ? (
                    <ChevronDownIcon className="w-4 h-4 mr-1 inline text-muted-foreground" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 mr-1 inline text-muted-foreground" />
                  )}
                </button>
              ) : null}
              <Link href={`/glossaries/${row.original.fullyQualifiedName}`}>
                {getValue<string>()}
              </Link>
            </div>
          );
        },
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: (info) => {
          return (
            <span
              dangerouslySetInnerHTML={{ __html: info.getValue() as string }}
            ></span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data:
      (data as {
        displayName: string;
        description: string;
        children: any[];
        childrenCount: number;
        fullyQualifiedName: string;
      }[]) ?? [],
    columns,
    getSubRows: (row) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => !!row.original.childrenCount,
  });

  if (!data?.length && !isLoading) {
    return <span>No terms</span>;
  }

  if (!data?.length && isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => {
          return (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => {
                return (
                  <TableHead key={h.id} colSpan={h.colSpan}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          );
        })}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((r) => {
          return (
            <Fragment key={r.id}>
              <TableRow>
                {r.getVisibleCells().map((cell) => {
                  return (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
              {isLoading &&
              r.original.fullyQualifiedName == directChildrenOf ? (
                <TableRow>
                  <TableCell>
                    <div className="p-4">Loading...</div>
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
