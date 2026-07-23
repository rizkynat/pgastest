"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

interface CollectionTrendPoint {
  date: string;
  outstanding: number;
  tagihan: number;
}

const chartConfig = {
  outstanding: {
    label: "Outstanding",
    color: "var(--chart-1)",
  },
  tagihan: {
    label: "Total Tagihan",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("90d");
  const [data, setData] = React.useState<CollectionTrendPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  React.useEffect(() => {
    const controller = new AbortController();

    async function fetchTrend() {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboards/chart/collection?range=${timeRange}`,
          { credentials: "include", signal: controller.signal },
        );
        if (!res.ok) throw new Error("Gagal memuat data chart");
        const json: CollectionTrendPoint[] = await res.json();
        setData(json);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTrend();
    return () => controller.abort();
  }, [timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Tagihan & Outstanding</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">Trend collection dalam periode terpilih</span>
          <span className="@[540px]/card:hidden">Trend collection</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(v) => v && setTimeRange(v as "7d" | "30d" | "90d")}
            variant="outline"
            className="@[767px]/card:flex hidden *:data-[slot=toggle-group-item]:px-4!"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as "7d" | "30d" | "90d")}>
            <SelectTrigger
              className="flex @[767px]/card:hidden w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
              <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
              <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex h-62 items-center justify-center text-sm text-muted-foreground">
            Memuat data...
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-62 w-full">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillOutstanding" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-outstanding)" stopOpacity={1.0} />
                  <stop offset="95%" stopColor="var(--color-outstanding)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillTagihan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-tagihan)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-tagihan)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("id-ID", { month: "short", day: "numeric" })
                }
              />
              <ChartTooltip
                cursor={false}
                defaultIndex={isMobile ? -1 : Math.max(data.length - 1, 0)}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("id-ID", { month: "short", day: "numeric" })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area dataKey="tagihan" type="natural" fill="url(#fillTagihan)" stroke="var(--color-tagihan)" stackId="a" />
              <Area dataKey="outstanding" type="natural" fill="url(#fillOutstanding)" stroke="var(--color-outstanding)" stackId="a" />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}