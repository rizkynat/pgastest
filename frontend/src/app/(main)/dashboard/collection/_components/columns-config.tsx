// _components/columns-config.tsx
"use client";

import { cn } from "@/lib/utils";
import type { ColumnMeta } from "./dynamic-columns";

const statusConfig: Record<
    string,
    { label: string; className: string }
> = {
    COMPLETED: {
        label: "Selesai",
        className: "bg-green-100 text-green-700",
    },
    REJECTED: {
        label: "Ditolak",
        className: "bg-red-100 text-red-700",
    },
    PENDING: {
        label: "Diproses",
        className: "bg-yellow-100 text-yellow-700",
    },
    ACTIVE: {
        label: "Aktif",
        className: "bg-blue-100 text-blue-700",
    },
};


export const collectionColumnsMeta: ColumnMeta[] = [

    { key: "id_action_activity", label: "Detail", type: "link" },
    {
        key: "status",
        label: "Status",
        type: "badge",
        render: (row) => (

            <div className="flex flex-col">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusConfig[row.status]?.className ?? "bg-gray-100 text-gray-700"}`}>
                    {statusConfig[row.status]?.label ?? row.status}
                </span>
            </div>
        ),
    },
    {
        key: "visit_result",
        label: "Pembayaran",
        type: "badge",
        render: (row) => (

            <div className="flex flex-col">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${row.visit_result === "PAID_FULL" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {row.visit_result === "PAID_FULL" ? "Lunas" : "Belum Lunas"}
                </span>
            </div>
        ),
    },
    { key: "id", label: "ID", type: "number", hidden: true },
    {
        key: "debitur_name",
        label: "Debitur",
        type: "custom",
        sortable: false,
        render: (row) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.debitur_name}</span>
                <span className="text-xs text-muted-foreground">{row.cif}</span>
            </div>
        ),
    },
    {
        key: "facility_name",
        label: "Fasilitas",
        type: "custom",
        render: (row) => (
            <div className="flex flex-col">
                <span>{row.facility_name}</span>
                <span className="text-xs text-muted-foreground">#{row.facility_id}</span>
            </div>
        ),
    },
    { key: "total_credit", label: "Jumlah Kredit", type: "currency", sortable: false },
    {
        key: "outstanding",
        label: "Outstanding",
        type: "currency",
        cellClassName: (row) => (row.outstanding > 100_000_000 ? "text-destructive font-semibold" : ""),
    },
    { key: "base", label: "Pokok", type: "currency", sortable: false },
    { key: "interest", label: "Bunga", type: "currency", sortable: false },
    { key: "penalty", label: "Denda", type: "currency", sortable: false },
    { key: "coll", label: "Coll", type: "number", sortable: false },
    {
        key: "dpd",
        label: "DPD",
        type: "custom",
        render: (row) => (
            <span
                className={cn(
                    "font-semibold tabular-nums",
                    row.dpd > 90 ? "text-destructive" : row.dpd > 30 ? "text-amber-600" : "text-emerald-600"
                )}
            >
                {row.dpd} hari
            </span>
        ),
    }
];