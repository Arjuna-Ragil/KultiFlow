"use client";

import { useState, type ReactNode } from "react";
import { CustomerHeader, type CustomerNotificationItem } from "./CustomerHeader";
import { CustomerSidebar } from "./CustomerSidebar";
import { CartProvider } from "../context/CartContext";
import { CartDrawer } from "./CartDrawer";

interface CustomerShellProps {
  children: ReactNode;
}

function CustomerShellInner({ children }: CustomerShellProps) {
  const [notifications, setNotifications] = useState<CustomerNotificationItem[]>([
    {
      id: "1",
      title: "Fresh Arrival Alert",
      message: "Direct harvest Fuji Apples & Granny Smith now available from Malang orchards.",
      time: "10m ago",
      read: false,
      type: "deal",
    },
    {
      id: "2",
      title: "AI Negotiator Ready",
      message: "Get special bulk discount rates by chatting directly with AgroBot.",
      time: "1h ago",
      read: false,
      type: "info",
    },
    {
      id: "3",
      title: "Order #ORD-8412 Delivered",
      message: "Your previous order has been delivered in prime quality condition.",
      time: "1d ago",
      read: true,
      type: "success",
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
      <CustomerSidebar />
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <CustomerHeader
          notifications={notifications}
          unreadCount={unreadCount}
          isNotifOpen={isNotifOpen}
          onToggleNotifications={handleToggleNotifications}
          onMarkAllRead={markNotifsAsRead}
        />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
      <CartDrawer />
    </div>
  );
}

export function CustomerShell({ children }: CustomerShellProps) {
  return (
    <CartProvider>
      <CustomerShellInner>{children}</CustomerShellInner>
    </CartProvider>
  );
}
