"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import "@/lib/chart-config";
import DashboardHeader from "@/components/DashboardHeader";
import { KPICard } from "@/components/KPICard";
import { VendorBarChart } from "@/components/VendorBarChart";
import { CategoryDonutChart } from "@/components/CategoryDonutChart";
import { CashOutflowChart } from "@/components/CashOutflowChart";
import { VendorInvoiceTable } from "@/components/VendorInvoiceTable";

interface Stats {
  totalSpend: number;
  totalInvoices: number;
  documentsThisMonth: number;
  avgInvoiceValue: number;
  spendChange: number;
  invoiceChange: number;
  documentsChange: number;
  avgInvoiceChange: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalSpend: 0,
    totalInvoices: 0,
    documentsThisMonth: 0,
    avgInvoiceValue: 0,
    spendChange: 0,
    invoiceChange: 0,
    documentsChange: 0,
    avgInvoiceChange: 0,
  });
  const [trends, setTrends] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cashOutflow, setCashOutflow] = useState<any[]>([]);
  const [vendorStats, setVendorStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
    console.log("🔗 API Base URL:", base);

    const fetchData = async () => {
      try {
        console.log("📡 Fetching data from API...");
        
        // Fetch all data in parallel
        const [statsRes, trendsRes, vendorsRes, categoriesRes, cashOutflowRes, vendorStatsRes] =
          await Promise.all([
            fetch(`${base}/stats`).catch(err => {
              console.error("❌ Error fetching stats:", err);
              return { ok: false, status: 0, json: () => Promise.resolve({ error: err.message }) };
            }),
            fetch(`${base}/invoice-trends`).catch(err => {
              console.error("❌ Error fetching trends:", err);
              return { ok: false, status: 0, json: () => Promise.resolve([]) };
            }),
            fetch(`${base}/vendors/top10`).catch(err => {
              console.error("❌ Error fetching vendors:", err);
              return { ok: false, status: 0, json: () => Promise.resolve([]) };
            }),
            fetch(`${base}/category-spend`).catch(err => {
              console.error("❌ Error fetching categories:", err);
              return { ok: false, status: 0, json: () => Promise.resolve([]) };
            }),
            fetch(`${base}/cash-outflow`).catch(err => {
              console.error("❌ Error fetching cash outflow:", err);
              return { ok: false, status: 0, json: () => Promise.resolve([]) };
            }),
            fetch(`${base}/vendors/invoice-stats`).catch(err => {
              console.error("❌ Error fetching vendor stats:", err);
              return { ok: false, status: 0, json: () => Promise.resolve([]) };
            }),
          ]);

        // Check response statuses
        console.log("📊 Response statuses:", {
          stats: statsRes.status || "failed",
          trends: trendsRes.status || "failed",
          vendors: vendorsRes.status || "failed",
          categories: categoriesRes.status || "failed",
          cashOutflow: cashOutflowRes.status || "failed",
          vendorStats: vendorStatsRes.status || "failed",
        });

        let statsData: any = { error: "Failed to fetch stats" };
        if (statsRes.ok) {
          try {
            statsData = await statsRes.json();
          } catch (e) {
            console.error("Failed to parse stats JSON:", e);
            statsData = { error: "Invalid JSON response" };
          }
        }

        const [trendsData, vendorsData, categoriesData, cashOutflowData, vendorStatsData] =
          await Promise.all([
            trendsRes.ok ? trendsRes.json().catch(() => []) : Promise.resolve([]),
            vendorsRes.ok ? vendorsRes.json().catch(() => []) : Promise.resolve([]),
            categoriesRes.ok ? categoriesRes.json().catch(() => []) : Promise.resolve([]),
            cashOutflowRes.ok ? cashOutflowRes.json().catch(() => []) : Promise.resolve([]),
            vendorStatsRes.ok ? vendorStatsRes.json().catch(() => []) : Promise.resolve([]),
          ]);

        console.log("✅ Data received:", {
          stats: statsData,
          totalSpend: statsData?.totalSpend,
          totalInvoices: statsData?.totalInvoices,
          trends: trendsData?.length || 0,
          vendors: vendorsData?.length || 0,
          categories: categoriesData?.length || 0,
          cashOutflow: cashOutflowData?.length || 0,
          vendorStats: vendorStatsData?.length || 0,
        });

        if (statsData.error) {
          console.error("❌ Stats error:", statsData.error);
        }

        // Ensure all stats properties are defined, even if API response is incomplete
        const safeStats: Stats = {
          totalSpend: statsData?.totalSpend ?? 0,
          totalInvoices: statsData?.totalInvoices ?? 0,
          documentsThisMonth: statsData?.documentsThisMonth ?? 0,
          avgInvoiceValue: statsData?.avgInvoiceValue ?? 0,
          spendChange: statsData?.spendChange ?? 0,
          invoiceChange: statsData?.invoiceChange ?? 0,
          documentsChange: statsData?.documentsChange ?? 0,
          avgInvoiceChange: statsData?.avgInvoiceChange ?? 0,
        };
        setStats(safeStats);
        setTrends(Array.isArray(trendsData) ? trendsData : []);
        setVendors(Array.isArray(vendorsData) ? vendorsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setCashOutflow(Array.isArray(cashOutflowData) ? cashOutflowData : []);
        setVendorStats(Array.isArray(vendorStatsData) ? vendorStatsData : []);
      } catch (err) {
        console.error("❌ Failed fetching data:", err);
        // Set empty states on error - keep default stats values
        setTrends([]);
        setVendors([]);
        setCategories([]);
        setCashOutflow([]);
        setVendorStats([]);
        // Stats already has default values from initial state
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency
  const formatCurrency = (value: number) => {
    if (!value || isNaN(value) || value === 0) {
      return "€ 0,00";
    }
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Build line chart data
  const safeTrends = trends || [];
  const lineData = {
    labels: safeTrends.length > 0 ? safeTrends.map((t) => t.month || "") : [],
    datasets: [
      {
        label: "Total Spend",
        data: safeTrends.length > 0 ? safeTrends.map((t) => Number(t.totalamount) || 0) : [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        yAxisID: "y",
      },
      {
        label: "Invoice Count",
        data: safeTrends.length > 0 ? safeTrends.map((t) => Number(t.invoicecount) || 0) : [],
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        tension: 0.4,
        fill: true,
        yAxisID: "y1",
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#6b7280",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += formatCurrency(context.parsed.y);
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
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
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        beginAtZero: true,
        ticks: {
          color: "#6b7280",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading data from API...</div>
      </div>
    );
  }

  // Show error if no data and not loading
  const hasNoData = 
    stats.totalSpend === 0 && 
    stats.totalInvoices === 0 && 
    trends.length === 0 && 
    vendors.length === 0;

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <DashboardHeader />

      <div className="flex-1 p-8 overflow-y-auto">
        {hasNoData && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">⚠️ No data available</p>
            <p className="text-yellow-700 text-sm mt-1">
              Please ensure the API is running on {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"} 
              and the database is connected. Check the browser console for details.
            </p>
          </div>
        )}
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Spend (YTD)"
            value={formatCurrency(stats.totalSpend || 0)}
            change={stats.spendChange || 0}
            changeType={(stats.spendChange || 0) >= 0 ? "increase" : "decrease"}
            subtitle="from last month"
          />
          <KPICard
            title="Total Invoices Processed"
            value={(stats.totalInvoices || 0).toString()}
            change={stats.invoiceChange || 0}
            changeType={(stats.invoiceChange || 0) >= 0 ? "increase" : "decrease"}
            subtitle="from last month"
          />
          <KPICard
            title="Documents Uploaded (This Month)"
            value={(stats.documentsThisMonth || 0).toString()}
            change={Math.abs(stats.documentsChange || 0)}
            changeType={(stats.documentsChange || 0) <= 0 ? "decrease" : "increase"}
            subtitle={(stats.documentsChange || 0) <= 0 ? "less from last month" : "more from last month"}
          />
          <KPICard
            title="Average Invoice Value"
            value={formatCurrency(stats.avgInvoiceValue || 0)}
            change={stats.avgInvoiceChange || 0}
            changeType={(stats.avgInvoiceChange || 0) >= 0 ? "increase" : "decrease"}
            subtitle="from last month"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Invoice Trends Line Chart */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-600 text-sm font-medium">
                Invoice count and total spend over 12 months
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <Line data={lineData} options={lineOptions} />
            </CardContent>
          </Card>

          {/* Category Donut Chart */}
          <CategoryDonutChart data={categories} />
        </div>

        {/* Vendor Bar Chart */}
        <div className="mb-8">
          <VendorBarChart data={vendors} />
        </div>

        {/* Cash Outflow and Vendor Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CashOutflowChart data={cashOutflow} />
          <VendorInvoiceTable data={vendorStats} />
        </div>
      </div>
    </div>
  );
}
