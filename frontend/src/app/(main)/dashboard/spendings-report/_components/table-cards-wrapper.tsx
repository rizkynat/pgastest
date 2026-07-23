"use client";

import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import type { ColumnMeta } from "@/components/data-table/dynamic-columns";
import { TableCards } from "./table-cards";

interface SpendingReportTableWrapperProps {
  title: string;
  description: string;
  columnsMeta: ColumnMeta[];
}

type SpendingReportMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type SpendingReportResponse<T> = {
  data: T[];
  meta: SpendingReportMeta;
};

export function SpendingReportTableWrapper({
  title,
  description,
  columnsMeta,
}: SpendingReportTableWrapperProps) {
  const [, setIsFetching] = React.useState(false);

  const [rawData, setRawData] = React.useState<any[]>([]);
  const [meta, setMeta] = React.useState<SpendingReportMeta | null>(null);
  const [search, setSearch] = React.useState("");

  // TanStack uses 0-based pageIndex; backend uses 1-based page.
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const router = useRouter();

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchSpendingReport = React.useCallback(
    async (pageIndex: number, pageSize: number) => {
      setIsFetching(true);

      try {
        const page = pageIndex + 1;
        const limit = pageSize;

        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (search) {
          params.append("q", search);
        }

        // Backend sudah mengurutkan hasil berdasarkan value (ASC) secara default.
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/spendings-report` + `/search` + `?${params.toString()}`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (res.status === 403) {
          router.push("/dashboard/forbidden");
          return;
        }

        if (!res.ok) {
          throw new Error("Gagal mengambil data. Silakan coba lagi.");
        }

        const json = (await res.json()) as SpendingReportResponse<any>;

        setRawData(json?.data ?? []);
        setMeta(json?.meta ?? null);
      } catch (error: any) {
        toast.error(error?.message ?? "Gagal mengambil data. Silakan coba lagi.");
      } finally {
        setIsFetching(false);
      }
    },
    [router, search]
  );

  // ===============================
  // EFFECT
  // ===============================
  React.useEffect(() => {
    fetchSpendingReport(pagination.pageIndex, pagination.pageSize);
  }, [fetchSpendingReport, pagination.pageIndex, pagination.pageSize]);

  // ===============================
  // HANDLERS
  // ===============================
  const handleSearch = (value: string) => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0, // reset page
    }));

    setSearch(value);
  };

  return (
    <TableCards
      title={title}
      description={description}
      columnsMeta={columnsMeta}
      data={rawData}
      manualPagination
      pageCount={meta?.totalPages ?? 0}
      rowCount={meta?.total ?? 0}
      defaultPageIndex={pagination.pageIndex}
      defaultPageSize={pagination.pageSize}
      onPaginationChange={(pageIndex, pageSize) => {
        setPagination((prev) =>
          prev.pageIndex === pageIndex && prev.pageSize === pageSize
            ? prev
            : { pageIndex, pageSize }
        );
      }}
      onSearch={handleSearch}
    />
  );
}