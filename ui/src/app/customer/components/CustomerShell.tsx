"use client";

import { useState, type ReactNode } from "react";
import { CustomerHeader, type CustomerNotificationItem } from "./CustomerHeader";
import { CustomerSidebar } from "./CustomerSidebar";
import { CartProvider, useCart } from "../context/CartContext";
import { CartDrawer } from "./CartDrawer";
import { CheckCircle2 } from "lucide-react";

interface CustomerShellProps {
  children: ReactNode;
}

function CustomerShellInner({ children }: CustomerShellProps) {
  const { toastMessage } = useCart();
  const [notifications, setNotifications] = useState<CustomerNotificationItem[]>([]);
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
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB] text-[#1F2937] font-sans relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 flex items-center gap-2.5 rounded-2xl bg-[#1F2937] px-4 py-3 text-sm font-semibold text-white shadow-2xl border border-gray-700 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-[#71C168]" />
          <span>{toastMessage}</span>
        </div>
      )}

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
