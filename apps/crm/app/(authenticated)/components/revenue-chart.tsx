"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/design-system/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { formatCurrency } from "../lib/format";

const chartConfig = {
  total: {
    label: "Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export const RevenueChart = ({
  data,
}: {
  data: { key: string; label: string; total: number }[];
}) => (
  <ChartContainer className="aspect-auto h-64 w-full" config={chartConfig}>
    <BarChart data={data}>
      <CartesianGrid vertical={false} />
      <XAxis axisLine={false} dataKey="label" tickLine={false} tickMargin={8} />
      <ChartTooltip
        content={
          <ChartTooltipContent
            formatter={(value) => formatCurrency(Number(value))}
          />
        }
      />
      <Bar dataKey="total" fill="var(--color-total)" radius={4} />
    </BarChart>
  </ChartContainer>
);
