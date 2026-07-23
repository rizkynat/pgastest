"use client";

import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Samakan dengan interface MetricCard di NestJS
interface MetricCard {
  label: string;
  value: number | string;
  changePercent: number;
  changeLabel: string;
  trend: "up" | "down" | "flat";
}

function formatValue(label: string, value: number | string) {
  // Kalau card-nya terkait uang, format ke Rupiah
  if (typeof value === "number" && /kredit|tagihan/i.test(label)) {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }
  return value.toString();
}

export function SectionCards() {
  const [cards, setCards] = useState<MetricCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSummary() {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboards/summary`,
          {
            credentials: "include", // kirim cookie JWT sesuai setup auth SmartColl
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          throw new Error(`Gagal memuat data (status ${res.status})`);
        }

        const data: MetricCard[] = await res.json();
        setCards(data);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-3 grid-cols-1 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-32" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-40" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 border border-red-200 rounded-md p-4">
        Gagal memuat data dashboard: {error}
      </div>
    );
  }

  return (
    <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-3 grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => {
        const isUp = card.trend === "up";
        const colorClass = isUp ? "text-green-500" : "text-red-500";
        const Icon = isUp ? TrendingUp : TrendingDown;

        return (
          <Card key={card.label} className="@container/card">
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
                {formatValue(card.label, card.value)}
              </CardTitle>
              <CardAction>
                <Badge className={colorClass} variant="outline">
                  <Icon />
                  {card.changePercent > 0 ? "+" : ""}
                  {card.changePercent}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                <Icon className={`size-4 ${colorClass}`} />
                <span className={colorClass}>
                  {card.changePercent > 0 ? "+" : ""}
                  {card.changePercent}%
                </span>
                {card.changeLabel}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}