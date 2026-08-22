import Link from "next/link";
import { Scan, Route, TrendingUp, FileText, ArrowRight, ShoppingBag } from "lucide-react";

export default function Page() {
  const modules = [
    {
      title: "Quality Control (QC)",
      description: "Live AI camera feed for automated produce inspection and sorting.",
      icon: Scan,
      href: "/admin/qc",
      color: "bg-[#71C168]/10 text-[#71C168]",
      disabled: false,
    },
    {
      title: "Route Optimization",
      description: "Manage logistics and delivery routes for maximum efficiency.",
      icon: Route,
      href: "/admin/route",
      color: "bg-[#71C168]/10 text-[#71C168]",
      disabled: false,
    },
    {
      title: "Catalog",
      description: "Manage fresh fruit inventory, pricing, grading, and stock levels.",
      icon: ShoppingBag,
      href: "/admin/catalog",
      color: "bg-[#71C168]/10 text-[#71C168]",
      disabled: false,
    },
    {
      title: "Forecasting",
      description: "Predictive analytics for demand and supply chain planning.",
      icon: TrendingUp,
      href: "#",
      color: "bg-gray-100 text-gray-400",
      disabled: true,
    },
    {
      title: "Invoices",
      description: "Billing, invoices, and financial reporting for stakeholders.",
      icon: FileText,
      href: "/admin/invoices",
      color: "bg-[#71C168]/10 text-[#71C168]",
      disabled: false,
    },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 pt-2 pb-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to the KultiFlow Workspace hub. Select a module below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {modules.map((mod) => {
            const Icon = mod.icon;
            if (mod.disabled) {
              return (
                <div
                  key={mod.title}
                  className="relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-gray-50/70 p-6 opacity-75 cursor-not-allowed shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${mod.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-gray-200/80 px-2.5 py-0.5 text-[11px] font-bold text-gray-600">
                        Coming Soon
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-600">{mod.title}</h3>
                    <p className="mt-2 text-sm text-gray-400 leading-relaxed">{mod.description}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200/60 pt-4 text-xs font-medium text-gray-400">
                    <span>Status: In Development</span>
                    <span>Q3 2026</span>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={mod.title}
                href={mod.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-xs transition-all hover:border-[#71C168] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${mod.color} transition-transform group-hover:scale-105`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#71C168] opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Module <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1F2937] group-hover:text-[#71C168] transition-colors">
                    {mod.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{mod.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-semibold text-gray-400">
                  <span>Status: Active</span>
                  <span className="text-[#71C168] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#71C168]" />
                    Ready
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}