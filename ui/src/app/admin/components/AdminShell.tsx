"use client";

import { useState, type ReactNode } from "react";
import { AdminHeader, type NotificationItem } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

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
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
