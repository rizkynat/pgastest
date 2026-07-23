// src/dashboard/utils/metric.util.ts

import { MetricCard } from "src/modules/dashboard/interfaces/metric-card.interface";

export function calcPercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  const diff = ((current - previous) / previous) * 100;
  return Math.round(diff * 10) / 10; // 1 desimal
}

export function getTrend(percent: number): 'up' | 'down' | 'flat' {
  if (percent > 0) return 'up';
  if (percent < 0) return 'down';
  return 'flat';
}

export function buildMetricCard(
  label: string,
  currentValue: number,
  previousValue: number,
  changeLabel = 'dari bulan lalu',
): MetricCard {
  const changePercent = calcPercentChange(currentValue, previousValue);
  return {
    label,
    value: currentValue,
    changePercent,
    changeLabel,
    trend: getTrend(changePercent),
  };
}