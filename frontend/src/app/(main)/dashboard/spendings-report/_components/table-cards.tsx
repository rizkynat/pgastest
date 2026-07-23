"use client";
"use no memo";

import { Download, SquarePlus } from "lucide-react";
import React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { addActionsColumn, generateColumns, type ColumnMeta } from "@/components/data-table/dynamic-columns";
import { Input } from "@/components/ui/input";

interface TableCardsProps<T> {
  title: string;
  description: string;
  columnsMeta: ColumnMeta[];
  data: T[];
  manualPagination?: boolean;
  pageCount?: number;
  rowCount?: number;
  defaultPageIndex?: number;
  defaultPageSize?: number;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  onCreate?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onExport?: () => void;
  onSearch?: (value: string) => void;
}

export function TableCards<T extends object>({
  title,
  description,
  columnsMeta,
  data,
  manualPagination,
  pageCount,
  rowCount,
  defaultPageIndex,
  defaultPageSize,
  onPaginationChange,
  onCreate,
  onEdit,
  onDelete,
  onExport,
  onSearch
}: TableCardsProps<T>) {
  // Generate columns dari meta
  const baseColumns = React.useMemo(() => generateColumns<T>(columnsMeta), [columnsMeta]);
  const [search, setSearch] = React.useState("");
  
    React.useEffect(() => {
      const timeout = setTimeout(() => {
        onSearch?.(search);
      }, 500);
  
      return () => clearTimeout(timeout);
    }, [search, onSearch]);
  // Tambahkan actions jika ada callback
  const columns = React.useMemo(
    () => addActionsColumn(baseColumns, onEdit, onDelete),
    [baseColumns, onEdit, onDelete]
  );

  const table = useDataTableInstance({
    data,
    columns,
    getRowId: (r) => (r as any).id?.toString() ?? "",
    manualPagination,
    pageCount,
    rowCount,
    defaultPageIndex,
    defaultPageSize,
    onPaginationChangeExternal: onPaginationChange
      ? (p) => onPaginationChange(p.pageIndex, p.pageSize)
      : undefined,
  });

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
               <Input
                placeholder="Cari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <DataTableViewOptions table={table} />
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download />
                  <span className="hidden lg:inline">Download</span>
                </Button>
              )}
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex size-full flex-col gap-4">
          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={columns} />
          </div>
          <DataTablePagination table={table} />
        </CardContent>
      </Card>
    </div>
  );
}
