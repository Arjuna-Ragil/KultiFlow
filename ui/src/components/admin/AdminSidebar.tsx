"use client";

import Link from "next/link";
import { FileText, LayoutDashboard, Route, Scan, TrendingUp, Leaf, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

type NavItem = "dashboard" | "qc" | "route" | "forecasting" | "invoices";

interface AdminSidebarProps {
  activePath?: string;
}

export function AdminSidebar({ activePath }: AdminSidebarProps) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname ?? "/admin";

  const activeItem: NavItem = currentPath.includes("/qc")
    ? "qc"
    : currentPath.includes("/route")
      ? "route"
      : currentPath.includes("/dashboard")
        ? "dashboard"
        : "dashboard";

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-gray-200 bg-white">
      <div>
        <Link href="/" className="flex items-center gap-3 px-6 py-6 mb-2 border-b border-gray-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#71C168] text-white">
            <Leaf className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-[#1F2937]">
              Stakeholder
            </span>
            <span className="text-[10px] font-medium text-gray-500">
              Warehouse Management
            </span>
          </div>
        </Link>
        <nav className="space-y-1 p-4">
          <Link
            href="/admin/dashboard"
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeItem === "dashboard"
                ? "border-l-4 border-[#71C168] bg-[#71C168]/10 font-bold text-[#71C168]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/qc"
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeItem === "qc"
                ? "border-l-4 border-[#71C168] bg-[#71C168]/10 font-bold text-[#71C168]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Scan className="h-5 w-5" />
            <span>QC</span>
          </Link>

          <Link
            href="/admin/route"
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeItem === "route"
                ? "border-l-4 border-[#71C168] bg-[#71C168]/10 font-bold text-[#71C168]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Route className="h-5 w-5" />
            <span>Route Optimization</span>
          </Link>

          <button
            disabled
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 opacity-60"
          >
            <TrendingUp className="h-5 w-5" />
            <span>Forecasting</span>
          </button>

          <button
            disabled
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 opacity-60"
          >
            <FileText className="h-5 w-5" />
            <span>Invoices</span>
          </button>
        </nav>
      </div>

      <div className="border-t border-gray-100 p-4 space-y-2">
        <Link
          href="/"
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-[#DC2626]"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Link>
        <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
            alt="Admin Manager"
            className="h-10 w-10 rounded-full border border-gray-200 object-cover"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#1F2937]">Admin Manager</span>
            <span className="text-xs text-gray-500">Manager</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
