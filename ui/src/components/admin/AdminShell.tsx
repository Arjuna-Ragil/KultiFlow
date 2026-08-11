"use client";

import { useState, type ReactNode } from "react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import type { NotificationItem } from "./types";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans">
      <AdminHeader
        notifications={notifications}
        unreadCount={unreadCount}
        isNotifOpen={isNotifOpen}
        onToggleNotifications={handleToggleNotifications}
        onMarkAllRead={markNotifsAsRead}
      />

      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
