"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  CreditCard,
  User,
  LogOut,
  Zap,
  ShieldCheck,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/new-order", label: "New Order", icon: ShoppingCart },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard/add-funds", label: "Add Funds", icon: CreditCard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

interface SidebarProps {
  isAdmin?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isAdmin, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="h-full flex flex-col bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg">SMMP</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Admin
              </p>
            </div>
            <Link
              href="/admin"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                pathname.startsWith("/admin")
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* Sign Out */}
      <div className="px-3 py-4 border-t border-slate-200">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
