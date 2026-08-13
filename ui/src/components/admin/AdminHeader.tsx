import Link from "next/link";
import { Bell, Leaf, LogOut, Search } from "lucide-react";
import type { NotificationItem } from "./types";

interface AdminHeaderProps {
  notifications: NotificationItem[];
  unreadCount: number;
  isNotifOpen: boolean;
  onToggleNotifications: () => void;
  onMarkAllRead: () => void;
}

export function AdminHeader({
  notifications,
  unreadCount,
  isNotifOpen,
  onToggleNotifications,
  onMarkAllRead,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
      <div className="flex flex-col gap-1 border-b border-gray-100 p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#71C168] text-white">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#1F2937]">
            Stakeholder
          </span>
        </Link>
        <span className="pl-1 text-xs font-medium text-gray-500">
          Warehouse Management
        </span>
      </div>

      <div className="relative w-80">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search inventory..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-[#1F2937] transition-all focus:outline-none focus:ring-2 focus:ring-[#71C168]"
        />
      </div>

      <div className="relative flex items-center gap-4">
        <div className="relative">
          <button
            onClick={onToggleNotifications}
            className="relative rounded-lg p-2.5 text-gray-600 transition-colors hover:bg-gray-100"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-[#DC2626] px-1 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F2937]">
                  Notifications
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-[11px] font-semibold text-[#71C168] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 divide-y divide-gray-100 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-2.5 p-3.5 text-xs transition-colors ${
                        !item.read ? "bg-[#71C168]/5" : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          item.type === "warning"
                            ? "bg-[#DC2626]"
                            : item.type === "success"
                              ? "bg-[#71C168]"
                              : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-bold text-[#1F2937]">{item.title}</div>
                        <div className="mt-0.5 text-gray-500">{item.message}</div>
                        <div className="mt-1 text-[10px] text-gray-400">{item.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="rounded-lg p-2.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#DC2626]"
          title="Logout to Landing Page"
        >
          <LogOut className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
