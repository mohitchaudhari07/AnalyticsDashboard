"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 shadow-lg border-r border-blue-800 flex flex-col">
        <div className="p-6 flex-1">
          <h2 className="text-xl font-semibold mb-8 text-white">Flowbit AI</h2>
          <nav className="space-y-2">
            <Link 
              href="/" 
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname === "/" 
                  ? "bg-blue-800 text-white font-medium" 
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/invoice" 
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname === "/invoice" 
                  ? "bg-blue-800 text-white font-medium" 
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`}
            >
              Invoice
            </Link>
            <Link 
              href="/other-files" 
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname === "/other-files" 
                  ? "bg-blue-800 text-white font-medium" 
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`}
            >
              Other files
            </Link>
            <Link 
              href="/departments" 
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname === "/departments" 
                  ? "bg-blue-800 text-white font-medium" 
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`}
            >
              Departments
            </Link>
            <Link 
              href="/users" 
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname === "/users" 
                  ? "bg-blue-800 text-white font-medium" 
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`}
            >
              Users
            </Link>
            <Link 
              href="/settings" 
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname === "/settings" 
                  ? "bg-blue-800 text-white font-medium" 
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`}
            >
              Settings
            </Link>
            <Link 
              href="/chat" 
              className={`block px-4 py-3 rounded-lg transition-colors ${
                pathname === "/chat" 
                  ? "bg-blue-800 text-white font-medium" 
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`}
            >
              Chat with Data
            </Link>
          </nav>
        </div>
        
        {/* Bottom user info */}
        <div className="p-6 border-t border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-sm font-medium">
              MA
            </div>
            <div className="text-blue-200 text-sm">
              <div className="font-medium">Mohd Afreed</div>
            </div>
          </div>
          <div className="text-blue-400 text-xs">Flowbit AI</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
