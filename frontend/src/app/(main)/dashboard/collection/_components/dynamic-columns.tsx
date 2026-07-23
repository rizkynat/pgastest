import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Info, Trash2 } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatDateTime } from "@/lib/utils";

export interface ColumnMeta<T = any> {
  key: string;
  label: string;
  type: "string" | "number" | "badge" | "date" | "currency" | "link" | "custom";
  sortable?: boolean;
  hidden?: boolean;
  render?: (row: T) => React.ReactNode;
  cellClassName?: string | ((row: T) => string);
  headerClassName?: string;
  badgeVariant?: (value: any, row: T) => "default" | "secondary" | "destructive" | "outline";
}

export function generateColumns<T>(meta: ColumnMeta[]): ColumnDef<T>[] {
  const columns: ColumnDef<T>[] = [
    // Kolom select (selalu ada)
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  // Tambahkan kolom berdasarkan meta
  meta.forEach((m) => {
    if (m.hidden) return;

    const getCellClassName = (row: T) => typeof m.cellClassName === "function" ? m.cellClassName(row) : (m.cellClassName ?? "");

    const column: ColumnDef<T> = {
      accessorKey: m.key,
      header: ({ column }) => <DataTableColumnHeader column={column} title={m.label} className={m.headerClassName} />,
      enableSorting: m.sortable ?? false,
      enableHiding: !m.key.includes("id"), // ID biasanya tidak bisa di-hide
    };

    if(m.render) {
      column.cell = ({ row }) => (
        <div className={getCellClassName(row.original)}>
          {m.render!(row.original)}
        </div>
      );
      columns.push(column);
      return;
    }

    // Sesuaikan cell berdasarkan type
    switch (m.type) {
      case "number":
        column.cell = ({ row }) => <span className={cn("tabular-nums", getCellClassName(row.original))}>
          {(row.original as any)[m.key]}
        </span>;
        break;
      case "badge":
        column.cell = ({ row }) => {
          const value = (row.original as any)[m.key];
          const variant = m.badgeVariant ? m.badgeVariant(value, row.original) : "secondary";
          return (
            <Badge variant={variant} className={cn(getCellClassName(row.original))}>
              {value}
            </Badge>
          );
        };
        break;
      case "date":
         column.cell = ({ row }) => (
          <span className={cn(getCellClassName(row.original))}>
            {formatDateTime((row.original as any)[m.key])}
          </span>
        );
        break;
      case "currency":
        column.cell = ({ row }) => (
          <span className={cn("tabular-nums", getCellClassName(row.original))}>
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format((row.original as any)[m.key] ?? 0)}
          </span>
        );
        break;
      case "link":
       column.cell = ({ row }) => (
          <a href={`action-activity/${(row.original as any)[m.key]}`}>
            <span
              className={cn(
                "tabular-nums underline cursor-default hover:text-primary",
                getCellClassName(row.original)
              )}
            >
              Lihat
            </span>
          </a>
        );
        break;
      default:
        column.cell = ({ row }) => (
          <span className={cn(getCellClassName(row.original))}>{(row.original as any)[m.key]}</span>
        );
    }

    columns.push(column);
  });

  return columns;
}

// Fungsi untuk menambahkan kolom actions
export function addActionsColumn<T>(
  columns: ColumnDef<T>[],
  onEdit?: (row: T) => void,
  onDelete?: (row: T) => void
): ColumnDef<T>[] {
  if (!onEdit && !onDelete) return columns;

  return [
    ...columns,
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
              <Edit />
              <span className="sr-only">Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(row.original)}>
              <Trash2 />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </div>
      ),
      enableSorting: false,
    },
  ];
}