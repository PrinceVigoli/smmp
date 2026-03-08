"use client";

import { Menu, Bell } from "lucide-react";
import { useSession } from "next-auth/react";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5 text-slate-600" />
        </button>
        {title && (
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl hover:bg-slate-100 relative">
          <Bell className="h-5 w-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900">
              {session?.user?.name}
            </p>
            <p className="text-xs text-slate-500">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
