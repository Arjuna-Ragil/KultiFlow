"use client";

import Link from "next/link";
import { LayoutDashboard, ShoppingBag, MessageSquareText, FileText } from "lucide-react";
import { usePathname } from "next/navigation";

export function CustomerSidebar() {
  const pathname = usePathname();
  const currentPath = pathname ?? "/customer/negotiator";

  const activeItem = currentPath.includes("/negotiator")
    ? "negotiator"
    : currentPath.includes("/orders")
    ? "orders"
    : currentPath.includes("/products") || currentPath.includes("/order")
    ? "products"
    : "dashboard";


  return (
    <aside className="flex h-full w-64 shrink-0 flex-col justify-between border-r border-gray-200 bg-white">
      <div>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 h-16">
          <img src="/kultiflow-logo.png" alt="KultiFlow Logo" className="h-6 object-contain" />
        </div>
        <nav className="space-y-1.5 p-4">
          {/* Dashboard (Active Link) */}
          <Link
            href="/customer/dashboard"
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeItem === "dashboard"
                ? "border-l-4 border-[#71C168] bg-[#71C168]/10 font-bold text-[#71C168]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          {/* Product List */}
          <Link
            href="/customer/products"
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeItem === "products"
                ? "border-l-4 border-[#71C168] bg-[#71C168]/10 font-bold text-[#71C168]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Product List</span>
          </Link>

          {/* AI Negotiator (Active) */}
          <Link
            href="/customer/negotiator"
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeItem === "negotiator"
                ? "border-l-4 border-[#71C168] bg-[#71C168]/10 font-bold text-[#71C168]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <MessageSquareText className="h-5 w-5" />
            <span>AI Negotiator</span>
          </Link>

          {/* My Orders */}
          <Link
            href="/customer/orders"
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeItem === "orders"
                ? "border-l-4 border-[#71C168] bg-[#71C168]/10 font-bold text-[#71C168]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>My Orders</span>
          </Link>
        </nav>
      </div>

      {/* Customer User Profile Bottom */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"
              alt="User Customer"
              className="h-10 w-10 rounded-full border border-gray-200 object-cover"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#71C168] ring-2 ring-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#1F2937]">User</span>
            <span className="text-xs text-gray-500">Customer</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
