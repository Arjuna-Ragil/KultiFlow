"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB] text-[#1F2937] font-sans">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
