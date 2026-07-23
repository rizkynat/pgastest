// src/dashboard/interfaces/metric-card.interface.ts

export interface MetricCard {
  label: string;          // "Total Kredit", "Debitur", dll
  value: number | string; // nilai utama (bisa raw number, format di frontend)
  changePercent: number;  // +5, +1.5, -2, dll
  changeLabel: string;    // "dari bulan lalu"
  trend: 'up' | 'down' | 'flat';
}

export interface ChartSeriesPoint {
  label: string;   // "Jan", "Feb", atau tanggal
  value: number;
}

export interface ChartData {
  title: string;
  series: ChartSeriesPoint[];
  meta?: Record<string, any>;
}