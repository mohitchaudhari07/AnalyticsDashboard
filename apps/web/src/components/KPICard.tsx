"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  subtitle?: string;
}

export function KPICard({ title, value, change, changeType, subtitle }: KPICardProps) {
  const isPositive = changeType === "increase";
  const changeColor = isPositive ? "text-green-600" : changeType === "decrease" ? "text-red-600" : "text-gray-600";
  const bgColor = isPositive ? "bg-green-50" : changeType === "decrease" ? "bg-red-50" : "bg-gray-50";

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
            <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
              {changeType === "increase" && <TrendingUp className="w-4 h-4" />}
              {changeType === "decrease" && <TrendingDown className="w-4 h-4" />}
              <span className="font-medium">
                {subtitle?.includes("less") 
                  ? `${change} ${subtitle}`
                  : changeType === "increase" && typeof change === "number"
                  ? `+${change.toFixed(1)}% ${subtitle || "from last month"}`
                  : typeof change === "number"
                  ? `${change.toFixed(1)}% ${subtitle || "from last month"}`
                  : change}
              </span>
            </div>
          </div>
          {/* Mini trend chart placeholder */}
          <div className={`w-16 h-12 rounded ${bgColor} flex items-end justify-center gap-1 p-2`}>
            <div className="w-1.5 h-3 bg-current opacity-60 rounded" style={{ color: isPositive ? '#10b981' : '#ef4444' }}></div>
            <div className="w-1.5 h-4 bg-current opacity-80 rounded" style={{ color: isPositive ? '#10b981' : '#ef4444' }}></div>
            <div className="w-1.5 h-5 bg-current rounded" style={{ color: isPositive ? '#10b981' : '#ef4444' }}></div>
            <div className="w-1.5 bg-current rounded" style={{ height: isPositive ? '28px' : '8px', color: isPositive ? '#10b981' : '#ef4444' }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

