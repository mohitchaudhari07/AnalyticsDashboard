"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";

interface CashOutflowChartProps {
  data: { range: string; total: number }[];
}

export function CashOutflowChart({ data }: CashOutflowChartProps) {
  const ranges = ["0-7 days", "8-30 days", "31-60 days", "60+ days"];
  const chartData = ranges.map((range) => {
    const item = data.find((d) => d.range === range);
    return item ? Number(item.total) || 0 : 0;
  });

  const barChartData = {
    labels: ranges,
    datasets: [
      {
        label: "Expected Payment",
        data: chartData,
        backgroundColor: ranges.map((range, index) =>
          range === "0-7 days" ? "rgba(16, 185, 129, 0.8)" : "rgba(59, 130, 246, 0.8)"
        ),
        borderColor: ranges.map((range) =>
          range === "0-7 days" ? "rgba(16, 185, 129, 1)" : "rgba(59, 130, 246, 1)"
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `€ ${context.parsed.y.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "€" + (value / 1000).toFixed(0) + "k";
          },
          color: "#6b7280",
        },
        grid: {
          color: "#e5e7eb",
        },
      },
      x: {
        ticks: {
          color: "#6b7280",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-600 text-sm font-medium">
          Expected payment obligations grouped by due date ranges.
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        <Bar data={barChartData} options={options} />
      </CardContent>
    </Card>
  );
}


