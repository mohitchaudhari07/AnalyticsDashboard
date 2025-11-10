"use client";

export default function DashboardHeader() {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* Company Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            B
          </div>
          <div>
            <div className="font-semibold text-gray-900">Buchhaltung</div>
            <div className="text-sm text-gray-500">12 members</div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="font-medium text-gray-900">Amit Jadhav</div>
          <div className="text-sm text-gray-500">Admin</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
          AJ
        </div>
      </div>
    </div>
  );
}


