"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, ShoppingCart, LogOut, X, CheckCircle2, Sparkles, Tag } from "lucide-react";
import { useCart } from "../context/CartContext";

export interface CustomerNotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "success" | "deal" | "info";
}

interface CustomerHeaderProps {
  notifications: CustomerNotificationItem[];
  unreadCount: number;
  isNotifOpen: boolean;
  onToggleNotifications: () => void;
  onMarkAllRead: () => void;
}

export function CustomerHeader({
  notifications,
  unreadCount,
  isNotifOpen,
  onToggleNotifications,
  onMarkAllRead,
}: CustomerHeaderProps) {
  const notifRef = useRef<HTMLDivElement>(null);
  const { totalItems, toggleCart } = useCart();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isNotifOpen && notifRef.current && !notifRef.current.contains(event.target as Node)) {
        onToggleNotifications();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen, onToggleNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-[#71C168]" />;
      case "deal":
        return <Tag className="h-4 w-4 text-[#1E7B34]" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "success":
        return "bg-[#71C168]/10";
      case "deal":
        return "bg-emerald-50";
      default:
        return "bg-blue-50";
    }
  };

  return (
    <header className="flex shrink-0 items-center justify-end px-6 sm:px-8 pt-3 pb-1 bg-transparent z-30">
      <div className="flex items-center gap-3">
        {/* Shopping Cart Button */}
        <button
          onClick={toggleCart}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-xs transition-all hover:bg-gray-50 hover:text-[#71C168]"
          title="Shopping Cart"
          type="button"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-bold text-white ring-2 ring-white">
              {totalItems}
            </span>
          )}
        </button>

        {/* Notification Bell Button */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={onToggleNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-xs transition-all hover:bg-gray-50 hover:text-[#71C168]"
            title="Notifications"
            type="button"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#1F2937]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#71C168]/15 px-2 py-0.5 text-xs font-bold text-[#71C168]">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={onMarkAllRead}
                      className="text-xs font-semibold text-[#71C168] hover:underline cursor-pointer"
                      type="button"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={onToggleNotifications}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors ${
                        !item.read ? "bg-gray-50/80 hover:bg-gray-100/70" : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getNotificationBg(
                          item.type
                        )}`}
                      >
                        {getNotificationIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#1F2937]">{item.title}</p>
                          <span className="text-[10px] text-gray-400">{item.time}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500 leading-relaxed truncate">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 shadow-xs transition-all hover:border-red-200 hover:bg-red-50 hover:text-[#DC2626]"
          title="Logout to Landing Page"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Link>
      </div>
    </header>
  );
}
