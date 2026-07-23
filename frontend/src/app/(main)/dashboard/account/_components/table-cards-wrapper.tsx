"use client";

import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import CreateAccountModal from "./create-modal";
import type { ColumnMeta } from "@/components/data-table/dynamic-columns";
import { TableCards } from "./table-cards";

interface TableCardsWrapperProps {
  title: string;
  description: string;
  columnsMeta: ColumnMeta[];
}

type UsersMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type UsersResponse<T> = {
  data: T[];
  meta: UsersMeta;
};

export function TableCardsWrapper({
  title,
  description,
  columnsMeta,
}: TableCardsWrapperProps) {
  const [openCreateModal, setOpenCreateModal] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any | null>(null);
  const [, setIsLoading] = React.useState(false);
  const [, setIsFetching] = React.useState(false);

  const [rawData, setRawData] = React.useState<any[]>([]);
  const [meta, setMeta] = React.useState<UsersMeta | null>(null);
  const [search, setSearch] = React.useState("");

  // TanStack uses 0-based pageIndex; backend uses 1-based page.
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const router = useRouter();

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchUsers = React.useCallback(
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
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/users` + `/search` + `?${params.toString()}`,
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

        const json = (await res.json()) as UsersResponse<any>;

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
    fetchUsers(pagination.pageIndex, pagination.pageSize);
  }, [fetchUsers, pagination.pageIndex, pagination.pageSize]);

  const refetch = React.useCallback(() => {
    fetchUsers(pagination.pageIndex, pagination.pageSize);
  }, [fetchUsers, pagination.pageIndex, pagination.pageSize]);

  const handleCreate = React.useCallback(() => {
    setSelectedRow(null);
    setOpenCreateModal(true);
  }, []);

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

  const handleEdit = React.useCallback((row: any) => {
    const raw = rawData.find((r: any) => String(r.id) === String(row.id));

    setSelectedRow((prev: any) => {
      if (prev?.id === raw?.id) return prev;
      return raw;
    });

    setOpenCreateModal(true);
  }, [rawData]);

  const handleDelete = React.useCallback(async (row: any) => {
    const confirmDelete = confirm(`Apakah yakin ingin menghapus data ${row.email}?`);
    if (!confirmDelete) return;

    setIsLoading(true);

    try {
      const raw = rawData.find((r: any) => String((r as any).id) === String(row.id)) ?? row;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${raw.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Gagal menghapus data");
      }

      toast.success("Data berhasil dihapus");
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [rawData, refetch]);

  const handleExport = React.useCallback(
    async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/export/xlsx`,
        {
          method: 'GET',
          credentials: "include",
          cache: "no-store",
        }
      );
      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "users.xlsx";

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    }
    , []);

  // Display mapping only (keep rawData intact for edit/delete).
  const data = React.useMemo(() => {
    return rawData.map((d: any) => ({
      ...d,
      role:
        d.role === "ADMIN"
          ? "Admin"
          : d.role === "USER"
            ? "User"
                : d.role,
      is_active: d.is_active ? "Aktif" : "Tidak Aktif",
    }));
  }, [rawData]);

  return (
    <>
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
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
        onSearch={handleSearch}
      />
      <CreateAccountModal
        open={openCreateModal}
        onOpenChange={setOpenCreateModal}
        data={selectedRow}
        onSuccess={refetch}
      />
    </>
  );
}
