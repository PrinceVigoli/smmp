"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Package, DollarSign, Clock } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingTopups: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={loading ? "..." : (stats?.totalUsers ?? 0)}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Total Orders"
          value={loading ? "..." : (stats?.totalOrders ?? 0)}
          icon={Package}
          color="green"
        />
        <StatsCard
          title="Total Revenue"
          value={loading ? "..." : `$${stats?.totalRevenue?.toFixed(2) ?? "0.00"}`}
          icon={DollarSign}
          color="yellow"
        />
        <StatsCard
          title="Pending Top-ups"
          value={loading ? "..." : (stats?.pendingTopups ?? 0)}
          icon={Clock}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: "/admin/users", title: "Manage Users", desc: "View and edit user balances", icon: Users },
          { href: "/admin/orders", title: "Manage Orders", desc: "View all orders and statuses", icon: Package },
          { href: "/admin/topups", title: "Top-up Requests", desc: "Approve or reject top-ups", icon: DollarSign },
          { href: "/admin/services", title: "Services", desc: "View available SMM services", icon: Clock },
        ].map(({ href, title, desc, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-all cursor-pointer h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </div>
              <p className="text-sm text-slate-500">{desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
