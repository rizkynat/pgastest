"use client";

import { HandCoins, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

import { Label, Pie, PieChart } from "recharts";

import { Button } from "@/components/ui/button";
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import {
  leadsBySourceChartConfig,
  leadsBySourceChartData,
} from "../../collection/_components/temp/crm.config";

export function SavingBalance() {
  return (
    <Card className="col-span-1 xl:col-span-2">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-content-center rounded-sm bg-muted">
              <HandCoins className="size-5" />
            </span>
            Saving Balance
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-0.5">
          <p className="font-medium text-xl tabular-nums">+{formatCurrency(5250, { noDecimals: true, currency: "IDR" })}</p>
          <div className="line-clamp-1 flex gap-2 font-medium">
            <TrendingUp className="size-4 text-red-500" />
            <span className="text-red-500">+1.5%</span>dari bulan lalu
          </div>
        </div>

        <Separator />
        <p className="flex items-center text-muted-foreground text-xs">
          Kenaikan jumlah tunggakan
          &nbsp;<span className="text-red-500">4.1%</span> dari bulan lalu
        </p>
      </CardContent>
    </Card>
  );
}

export function Collectibility() {
  const totalLeads = leadsBySourceChartData.reduce((acc, curr) => acc + curr.leads, 0);

  return (
    <Card className="col-span-1 xl:col-span-3">
      <CardHeader>
        <CardTitle>Collectibility</CardTitle>
      </CardHeader>
      <CardContent className="max-h-48">
        <ChartContainer config={leadsBySourceChartConfig} className="size-full">
          <PieChart
            className="m-0"
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={leadsBySourceChartData}
              dataKey="leads"
              nameKey="source"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={2}
              cornerRadius={4}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground font-bold text-xs tabular-nums"
                        >
                          IDR {totalLeads.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className="fill-muted-foreground">
                          Total Tagihan
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              content={() => (
                <ul className="ml-8 flex flex-col gap-3">
                  {leadsBySourceChartData.map((item) => (
                    <li key={item.source} className="flex w-36 items-center justify-between">
                      <span className="flex items-center gap-2 capitalize">
                        <span className="size-2.5 rounded-full" style={{ background: item.fill }} />
                        {leadsBySourceChartConfig[item.source].label}
                      </span>
                      <span className="tabular-nums">IDR {item.leads.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm" variant="outline" className="basis-1/2">
          View Full Report
        </Button>
        <Button size="sm" variant="outline" className="basis-1/2">
          Download CSV
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function FirstSection() {
  return (

    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-1">
      <SavingBalance />
      <Collectibility />
    </div>
  )
}