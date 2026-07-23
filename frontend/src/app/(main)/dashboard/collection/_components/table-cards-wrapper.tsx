"use client";

import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { ColumnMeta } from "./dynamic-columns";
import { TableCards } from "./table-cards";

interface TableCardsWrapperProps {
  title: string;
  description: string;
  columnsMeta: ColumnMeta[];
}

type CollectionsMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CollectionsResponse<T> = {
  data: T[];
  meta: CollectionsMeta;
};

export function TableCardsWrapper({
  title,
  description,
  columnsMeta,
}: TableCardsWrapperProps) {
  const router = useRouter();

  const [rawData, setRawData] = React.useState<any[]>([]);
  const [meta, setMeta] = React.useState<CollectionsMeta | null>(null);

  const [search, setSearch] = React.useState("");
  const [isFetching, setIsFetching] = React.useState(false);

  // pagination (TanStack: 0-based)
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchCollections = React.useCallback(
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

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/collections` + `/paginate` + `?${params.toString()}`,
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

        const json = (await res.json()) as CollectionsResponse<any>;

        setRawData(json?.data ?? []);
        setMeta(json?.meta ?? null);
      } catch (error: any) {
        toast.error(error?.message ?? "Gagal mengambil data. Silakan coba lagi.");
      } finally {
        setIsFetching(false);
      }
    },
    [router, search] // ✅ FIX dependency
  );

  // ===============================
  // EFFECT
  // ===============================
  React.useEffect(() => {
    fetchCollections(pagination.pageIndex, pagination.pageSize);
  }, [fetchCollections, pagination.pageIndex, pagination.pageSize]);

  const refetch = React.useCallback(() => {
    fetchCollections(pagination.pageIndex, pagination.pageSize);
  }, [fetchCollections, pagination.pageIndex, pagination.pageSize]);

  // ===============================
  // HANDLERS
  // ===============================
  const handleSearch = (value: string) => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0, // ✅ reset page
    }));

    setSearch(value);
  };

  const handleExport = React.useCallback(async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/collections/export/xlsx`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "collections.xlsx";

    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  }, []);

  // ===============================
  // DATA MAPPING
  // ===============================
  const data = React.useMemo(() => {
    return rawData.map((d: any) => ({
      ...d,
    }));
  }, [rawData]);

  // ===============================
  // RENDER
  // ===============================
  return (
    <TableCards
      title={title}
      description={description}
      columnsMeta={columnsMeta}
      data={data}
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
      onExport={handleExport}
      onSearch={handleSearch}
    />
  );
}