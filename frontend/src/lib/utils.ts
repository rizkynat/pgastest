import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (str: string): string => {
  if (typeof str !== "string" || !str.trim()) return "?";

  return (
    str
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
};

export function formatCurrency(
  amount: number,
  opts?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    noDecimals?: boolean;
  },
) {
  const { currency = "IDR", locale = "id-ID", minimumFractionDigits, maximumFractionDigits, noDecimals } = opts ?? {};

  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: noDecimals ? 0 : minimumFractionDigits,
    maximumFractionDigits: noDecimals ? 0 : maximumFractionDigits,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}


const DEFAULT_FORMAT = "DD MMM YYYY HH:mm";
const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const FORMAT_TOKENS: Record<string, (d: Date) => string> = {
  DD: (d) => String(d.getDate()).padStart(2, "0"),
  MMM: (d) => MONTH_NAMES[d.getMonth()],
  MM: (d) => String(d.getMonth() + 1).padStart(2, "0"),
  YYYY: (d) => String(d.getFullYear()),
  YY: (d) => String(d.getFullYear()).slice(-2),
  HH: (d) => String(d.getHours()).padStart(2, "0"),
  mm: (d) => String(d.getMinutes()).padStart(2, "0"),
  ss: (d) => String(d.getSeconds()).padStart(2, "0"),
};

// Regex dibangun dari keys supaya otomatis ke-extend kalau nambah token
const TOKEN_REGEX = new RegExp(
  Object.keys(FORMAT_TOKENS)
    .sort((a, b) => b.length - a.length) // longer first biar YYYY > YY
    .join("|"),
  "g"
);

export function formatDateTime(
  dateString: string,
  format: string = DEFAULT_FORMAT,
  timeZone: string = "Asia/Jakarta"
): string {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  // Konversi ke timezone yang diinginkan
  const local = new Date(date.toLocaleString("en-US", { timeZone }));

  return format.replace(TOKEN_REGEX, (token) =>
    FORMAT_TOKENS[token]?.(local) ?? token
  );
}
