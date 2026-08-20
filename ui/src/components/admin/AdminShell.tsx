"use client";

import { useState, type ReactNode } from "react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "@/app/admin/components/AdminSidebar";
import type { NotificationItem } from "./types";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Automated QC Complete",
      message: "Batch #4029 fruit quality inspection passed at 92% rate.",
      time: "5m ago",
      read: false,
      type: "success",
    },
    {
      id: "2",
      title: "Route Optimized",
      message: "Fleet routes for 2 delivery vehicles generated successfully.",
      time: "24m ago",
      read: false,
      type: "info",
    },
    {
      id: "3",
      title: "System Update",
      message: "AI vision model updated with latest produce grading weights.",
      time: "2h ago",
      read: true,
      type: "info",
    },
  ]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markNotifsAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleToggleNotifications = () => {
    setIsNotifOpen((prev) => !prev);
    if (unreadCount > 0) {
      markNotifsAsRead();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB] text-[#1F2937] font-sans">
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader
          notifications={notifications}
          unreadCount={unreadCount}
          isNotifOpen={isNotifOpen}
          onToggleNotifications={handleToggleNotifications}
          onMarkAllRead={markNotifsAsRead}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
