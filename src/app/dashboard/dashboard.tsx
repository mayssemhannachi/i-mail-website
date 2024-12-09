"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "src/components/ui/chart";

// Données statiques d'utilisation du chatbot pendant la semaine
const chartData = [
  { day: "Monday", use: 13, fill: "var(--color-monday)" },
  { day: "Tuesday", use: 15, fill: "var(--color-tuesday)" },
  { day: "Wednesday", use: 18, fill: "var(--color-wednesday)" },
  { day: "Thursday", use: 20, fill: "var(--color-thursday)" },
  { day: "Friday", use: 10, fill: "var(--color-friday)" },
  { day: "Saturday", use: 5, fill: "var(--color-saturday)" },
  { day: "Sunday", use: 2, fill: "var(--color-sunday)" },
];

// Configuration du graphique
const chartConfig = {
  use: {
    label: "use",
  },
  Monday: {
    label: "Mon",
    color: "hsl(var(--chart-1))",
  },
  Tuesday: {
    label: "Tue",
    color: "hsl(var(--chart-2))",
  },
  Wednesday: {
    label: "Wed",
    color: "hsl(var(--chart-3))",
  },
  Thursday: {
    label: "Thu",
    color: "hsl(var(--chart-4))",
  },
  Friday: {
    label: "Fri",
    color: "hsl(var(--chart-5))",
  },
  Saturday: {
    label: "Sat",
    color: "hsl(var(--chart-6))",
  },
  Sunday: {
    label: "Sun",
    color: "hsl(var(--chart-7))",
  },
} satisfies ChartConfig;

export function BarChartComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chatbot Usage Over the Week</CardTitle>
        <CardDescription>9-14 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label || value
              }
              interval={0} // S'assurer que tous les ticks sont affichés
              angle={0} // S'assurer que les ticks sont bien orientés horizontalement
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="use"
              strokeWidth={2}
              radius={8}
              activeIndex={2}
              activeBar={({ ...props }) => {
                return (
                  <Rectangle
                    {...props}
                    fillOpacity={0.8}
                    stroke={props.payload.fill}
                    strokeDasharray={4}
                    strokeDashoffset={4}
                  />
                );
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending down by 84.62% this week <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Total chatbot usage this week: 83 interactions
        </div>
      </CardFooter>
    </Card>
  );
}