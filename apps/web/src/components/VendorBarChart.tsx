"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";

interface VendorBarChartProps {
  data: { vendor_name: string; total_spend: number }[];
}

export function VendorBarChart({ data }: VendorBarChartProps) {
  const chartData = {
    labels: (data || []).slice(0, 10).map((v) => v.vendor_name || "Unknown"),
    datasets: [
      {
        label: "Vendor Spend",
        data: (data || []).slice(0, 10).map((v) => Number(v.total_spend) || 0),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `Vendor Spend: € ${context.parsed.x.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
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
      y: {
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
          Vendor spend with cumulative percentage distribution.
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        <Bar data={chartData} options={options} />
      </CardContent>
    </Card>
  );
}

