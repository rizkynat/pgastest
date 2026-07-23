"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

// ------------------------------------------------------------------
// Types (mengikuti shape response dari SpendingReportService)
// ------------------------------------------------------------------
interface SpendingReportItem {
  id: string;
  spending_id: number;
  employee_id: number;
  employee_name: string | null;
  department_id: number | null;
  department_name: string | null;
  spending_date: string; // ISO date string
  value: number;
}

interface SpendingReportResponse {
  data: SpendingReportItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ------------------------------------------------------------------
// Konstanta
// ------------------------------------------------------------------
const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 2020;

const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i,
);

const MONTH_OPTIONS = [
  { value: "all", label: "Semua Bulan" },
  { value: "0", label: "Januari" },
  { value: "1", label: "Februari" },
  { value: "2", label: "Maret" },
  { value: "3", label: "April" },
  { value: "4", label: "Mei" },
  { value: "5", label: "Juni" },
  { value: "6", label: "Juli" },
  { value: "7", label: "Agustus" },
  { value: "8", label: "September" },
  { value: "9", label: "Oktober" },
  { value: "10", label: "November" },
  { value: "11", label: "Desember" },
];

const VALUE_PRESETS = [
  { value: "all", label: "Semua Nilai", min: 0, max: Infinity },
  { value: "lt100k", label: "< Rp100.000", min: 0, max: 100_000 },
  { value: "100k-500k", label: "Rp100.000 - Rp500.000", min: 100_000, max: 500_000 },
  { value: "500k-1jt", label: "Rp500.000 - Rp1.000.000", min: 500_000, max: 1_000_000 },
  { value: "1jt-5jt", label: "Rp1.000.000 - Rp5.000.000", min: 1_000_000, max: 5_000_000 },
  { value: "gt5jt", label: "> Rp5.000.000", min: 5_000_000, max: Infinity },
];

const ABSOLUTE_MAX_VALUE = 20_000_000; // batas atas default slider, akan disesuaikan dengan data

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export default function SpendingReportPage() {
  const [rawData, setRawData] = useState<SpendingReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter periode
  const [year, setYear] = useState<string>(String(CURRENT_YEAR));
  const [month, setMonth] = useState<string>("all");

  // Filter nilai pengeluaran (range value) - 3 komponen, saling sinkron
  const [preset, setPreset] = useState<string>("all");
  const [range, setRange] = useState<[number, number]>([0, ABSOLUTE_MAX_VALUE]);
  const [minInput, setMinInput] = useState<string>("0");
  const [maxInput, setMaxInput] = useState<string>(String(ABSOLUTE_MAX_VALUE));

  const [page, setPage] = useState(1);
  const limit = 10;

  // ------------------------------------------------------------------
  // Fetch data dari backend
  // Backend saat ini hanya mendukung pagination + search nama/departemen,
  // sehingga filter periode & range value dilakukan di client side.
  // Ambil data dengan limit besar agar filter client cukup akurat.
  // ------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/spendings-report?page=1&limit=100000`,
        {
            credentials: "include",
            cache: "no-store",
          }
      );

      if (!res.ok) throw new Error(`Gagal memuat data (status ${res.status})`);
      const json: SpendingReportResponse = await res.json();
      setRawData(json.data);

      // Sesuaikan batas slider dengan nilai maksimum yang benar-benar ada
      const maxValue = json.data.reduce((m, d) => Math.max(m, d.value), 0);
      if (maxValue > 0) {
        setRange([0, maxValue]);
        setMaxInput(String(maxValue));
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dataMaxValue = useMemo(
    () => rawData.reduce((m, d) => Math.max(m, d.value), ABSOLUTE_MAX_VALUE),
    [rawData],
  );

  // ------------------------------------------------------------------
  // Sinkronisasi 3 filter nilai: dropdown -> slider & input
  // ------------------------------------------------------------------
  const handlePresetChange = (value: string) => {
    setPreset(value);
    const found = VALUE_PRESETS.find((p) => p.value === value);
    if (!found) return;
    const max = found.max === Infinity ? dataMaxValue : found.max;
    setRange([found.min, max]);
    setMinInput(String(found.min));
    setMaxInput(String(max));
  };

  const handleSliderChange = (value: number[]) => {
    setPreset("all");
    setRange([value[0], value[1]]);
    setMinInput(String(value[0]));
    setMaxInput(String(value[1]));
  };

  const handleMinInputChange = (value: string) => {
    setMinInput(value);
    setPreset("all");
    const numeric = Number(value) || 0;
    setRange(([, max]) => [numeric, Math.max(numeric, max)]);
  };

  const handleMaxInputChange = (value: string) => {
    setMaxInput(value);
    setPreset("all");
    const numeric = Number(value) || 0;
    setRange(([min]) => [Math.min(min, numeric), numeric]);
  };

  const resetFilters = () => {
    setYear(String(CURRENT_YEAR));
    setMonth("all");
    setPreset("all");
    setRange([0, dataMaxValue]);
    setMinInput("0");
    setMaxInput(String(dataMaxValue));
    setPage(1);
  };

  // ------------------------------------------------------------------
  // Terapkan filter periode (tahun & bulan) + range value
  // ------------------------------------------------------------------
  const filteredData = useMemo(() => {
    return rawData
      .filter((item) => {
        const d = new Date(item.spending_date);
        const matchYear = d.getFullYear() === Number(year);
        const matchMonth = month === "all" || d.getMonth() === Number(month);
        const matchValue = item.value >= range[0] && item.value <= range[1];
        return matchYear && matchMonth && matchValue;
      })
      .sort(
        (a, b) =>
          new Date(a.spending_date).getTime() - new Date(b.spending_date).getTime(),
      );
  }, [rawData, year, month, range]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);
  const totalValue = filteredData.reduce((sum, d) => sum + d.value, 0);

  useEffect(() => {
    setPage(1);
  }, [year, month, range]);

  // ------------------------------------------------------------------
  // Export Excel (.xlsx)
  // ------------------------------------------------------------------
  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => ({
        Tanggal: formatDate(item.spending_date),
        Karyawan: item.employee_name ?? "-",
        Departemen: item.department_name ?? "-",
        "Nilai Pengeluaran": item.value,
      })),
    );
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
      { wch: 18 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pengeluaran");
    const fileName = `laporan-pengeluaran-${year}${
      month !== "all" ? `-${MONTH_OPTIONS[Number(month) + 1].label}` : ""
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // ------------------------------------------------------------------
  // Export PDF (.pdf)
  // ------------------------------------------------------------------
  const handleExportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const periodLabel =
      month === "all"
        ? `Tahun ${year}`
        : `${MONTH_OPTIONS.find((m) => m.value === month)?.label} ${year}`;

    doc.setFontSize(14);
    doc.text("Laporan Pengeluaran", 14, 15);
    doc.setFontSize(10);
    doc.text(`Periode: ${periodLabel}`, 14, 22);
    doc.text(`Total Pengeluaran: ${formatCurrency(totalValue)}`, 14, 28);

    autoTable(doc, {
      startY: 34,
      head: [["Tanggal", "Karyawan", "Departemen", "Nilai Pengeluaran"]],
      body: filteredData.map((item) => [
        formatDate(item.spending_date),
        item.employee_name ?? "-",
        item.department_name ?? "-",
        formatCurrency(item.value),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    const fileName = `laporan-pengeluaran-${year}${
      month !== "all" ? `-${MONTH_OPTIONS[Number(month) + 1].label}` : ""
    }.pdf`;
    doc.save(fileName);
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Laporan Pengeluaran
        </h1>
        <p className="text-sm text-muted-foreground">
          Pantau dan unduh laporan pengeluaran karyawan per periode.
        </p>
      </div>

      {/* Filter Periode & Nilai */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="h-4 w-4" />
            Filter Laporan
          </CardTitle>
          <CardDescription>
            Pilih periode laporan dan rentang nilai pengeluaran yang ingin ditampilkan.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Periode: tahun & bulan */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Tahun</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Bulan</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dropdown preset range nilai */}
            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2">
              <label className="text-sm font-medium">Preset Rentang Nilai</label>
              <Select value={preset} onValueChange={handlePresetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih rentang nilai" />
                </SelectTrigger>
                <SelectContent>
                  {VALUE_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Slider range nilai */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Rentang Nilai Pengeluaran</label>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(range[0])} &ndash; {formatCurrency(range[1])}
              </span>
            </div>
            <Slider
              min={0}
              max={dataMaxValue}
              step={10_000}
              value={range}
              onValueChange={handleSliderChange}
            />
          </div>

          {/* Input angka min-max */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Nilai Minimum (Rp)</label>
              <Input
                type="number"
                min={0}
                value={minInput}
                onChange={(e) => handleMinInputChange(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Nilai Maksimum (Rp)</label>
              <Input
                type="number"
                min={0}
                value={maxInput}
                onChange={(e) => handleMaxInputChange(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Laporan */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Rincian Pengeluaran</CardTitle>
            <CardDescription>
              {filteredData.length} data &middot; Total {formatCurrency(totalValue)}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Ekspor
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Unduh Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Unduh PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal Pengeluaran</TableHead>
                  <TableHead>Karyawan</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead className="text-right">Nilai Pengeluaran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Tidak ada data pengeluaran untuk periode dan filter yang dipilih.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.spending_date)}</TableCell>
                      <TableCell>{item.employee_name ?? "-"}</TableCell>
                      <TableCell>
                        {item.department_name ? (
                          <Badge variant="secondary">{item.department_name}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.value)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination sederhana */}
          {!isLoading && filteredData.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
