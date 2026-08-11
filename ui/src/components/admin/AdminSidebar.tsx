import Link from "next/link";
import { FileText, LayoutDashboard, Route, Scan, TrendingUp } from "lucide-react";
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
    : currentPath.includes("/dashboard")
      ? "dashboard"
      : "dashboard";

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-gray-200 bg-white">
      <div>
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

          <button
            disabled
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 opacity-60"
          >
            <Route className="h-5 w-5" />
            <span>Route Optimization</span>
          </button>

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

      <div className="border-t border-gray-100 p-4">
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
