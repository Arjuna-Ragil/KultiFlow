"use client";

import Link from "next/link";
import { FileText, LayoutDashboard, Route, Scan, TrendingUp, Leaf, LogOut, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";

type NavItem = "dashboard" | "qc" | "route" | "catalog" | "forecasting" | "invoices" | "warehouse";

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
      : currentPath.includes("/forecasting")
        ? "forecasting"
        : currentPath.includes("/invoices")
          ? "invoices"
          : currentPath.includes("/catalog")
            ? "catalog"
            : currentPath.includes("/warehouse")
              ? "warehouse"
              : "dashboard";

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col justify-between border-r border-gray-200 bg-white">
      <div>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 h-16">
          <img src="/kultiflow-logo.png" alt="KultiFlow Logo" className="h-6 object-contain" />
        </div>
        <nav className="space-y-1.5 p-4">
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

          <Link
            href="/admin/forecasting"
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeItem === "forecasting"
                ? "border-l-4 border-[#71C168] bg-[#71C168]/10 font-bold text-[#71C168]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>Forecasting</span>
          </Link>

          <Link
            href="/admin/invoices"
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeItem === "invoices"
                ? "border-l-4 border-[#71C168] bg-[#71C168]/10 font-bold text-[#71C168]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Invoices</span>
          </Link>

          <Link
            href="/admin/warehouse"
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeItem === "warehouse"
                ? "border-l-4 border-[#71C168] bg-[#71C168]/10 font-bold text-[#71C168]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Route className="h-5 w-5" />
            <span>Warehouses</span>
          </Link>

          <Link
            href="/admin/catalog"
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeItem === "catalog"
                ? "border-l-4 border-[#71C168] bg-[#71C168]/10 font-bold text-[#71C168]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Catalog</span>
          </Link>
        </nav>
      </div>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
              alt="Admin Manager"
              className="h-10 w-10 rounded-full border border-gray-200 object-cover"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#71C168] ring-2 ring-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#1F2937]">Admin Manager</span>
            <span className="text-xs text-gray-500">Warehouse Manager</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
