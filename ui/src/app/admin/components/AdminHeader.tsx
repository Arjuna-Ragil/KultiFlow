import Link from "next/link";
import { Leaf, LogOut } from "lucide-react";

export function AdminHeader() {
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

      <div className="relative flex items-center gap-4">
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
