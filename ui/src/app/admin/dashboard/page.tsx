import Link from "next/link";
import { Scan, Route, TrendingUp, FileText } from "lucide-react";

const page = () => {
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
      color: "bg-blue-50 text-blue-600",
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
      href: "#",
      color: "bg-gray-100 text-gray-400",
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-8 shadow-xs">
        <h1 className="text-3xl font-extrabold text-[#71C168]">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500">
          Welcome to the Stakeholder Workspace hub. Select a module below to get started.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {modules.map((mod) => {
            const Icon = mod.icon;
            if (mod.disabled) {
              return (
                <div
                  key={mod.title}
                  className="group relative flex flex-col items-start rounded-2xl border border-gray-200 bg-gray-50 p-6 opacity-60 cursor-not-allowed"
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${mod.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-500">{mod.title} (Coming Soon)</h3>
                  <p className="mt-2 text-sm text-gray-400">{mod.description}</p>
                </div>
              );
            }

            return (
              <Link
                key={mod.title}
                href={mod.href}
                className="group relative flex flex-col items-start rounded-2xl border border-gray-200 bg-white p-6 shadow-xs transition-all hover:border-[#71C168] hover:shadow-md"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${mod.color} transition-transform group-hover:scale-110`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2937] group-hover:text-[#71C168] transition-colors">{mod.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{mod.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default page;