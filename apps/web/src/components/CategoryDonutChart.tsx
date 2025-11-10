"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doughnut } from "react-chartjs-2";

interface CategoryDonutChartProps {
  data: { category: string; total_spend: number }[];
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const colors = [
    "rgba(59, 130, 246, 0.8)", // Blue
    "rgba(249, 115, 22, 0.8)", // Orange
    "rgba(16, 185, 129, 0.8)", // Green
    "rgba(139, 92, 246, 0.8)", // Purple
    "rgba(236, 72, 153, 0.8)", // Pink
    "rgba(251, 191, 36, 0.8)", // Yellow
  ];

  const safeData = data || [];
  const chartData = {
    labels: safeData.map((c) => c.category || "Unknown"),
    datasets: [
      {
        data: safeData.map((c) => Number(c.total_spend) || 0),
        backgroundColor: colors.slice(0, safeData.length),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          color: "#6b7280",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            return `${label}: €${value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-600 text-sm font-medium">
          Distribution of spending across different categories.
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        <Doughnut data={chartData} options={options} />
      </CardContent>
    </Card>
  );
}

