"use no memo";
import * as React from "react";

import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  type Updater,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

type UseDataTableInstanceProps<TData, TValue> = {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  enableRowSelection?: boolean;
  defaultPageIndex?: number;
  defaultPageSize?: number;
  manualPagination?: boolean;
  pageCount?: number;
  rowCount?: number;
  getRowId?: (row: TData, index: number) => string;
  onPaginationChangeExternal?: (pagination: PaginationState) => void;
};

export function useDataTableInstance<TData, TValue>({
  data,
  columns,
  enableRowSelection = true,
  defaultPageIndex,
  defaultPageSize,
  manualPagination = false,
  pageCount,
  rowCount,
  getRowId,
  onPaginationChangeExternal,
}: UseDataTableInstanceProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: defaultPageIndex ?? 0,
    pageSize: defaultPageSize ?? 10,
  });

  const handlePaginationChange = React.useCallback(
    (updater: Updater<PaginationState>) => {
      setPagination((prev) => {
        let next = typeof updater === "function" ? updater(prev) : updater;

        // Keep UX consistent (and avoid "page out of range") when the page size changes.
        if (next.pageSize !== prev.pageSize) {
          next = { ...next, pageIndex: 0 };
        }

        return next;
      });
    },
    []
  );

  React.useEffect(() => {
    // Notify parent after state commit to avoid "setState while rendering a different component" warnings.
    onPaginationChangeExternal?.(pagination);
  }, [onPaginationChangeExternal, pagination]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection,
    getRowId: getRowId ?? ((row) => (row as any).id.toString()),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    manualPagination,
    // For manual pagination, TanStack uses these to calculate pageCount/canNextPage.
    // Passing them in non-manual mode is harmless.
    pageCount,
    rowCount,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return table;
}
