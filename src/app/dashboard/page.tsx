"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { DollarSign, Package, Clock, CheckCircle, Plus, CreditCard } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Order {
  id: string;
  serviceName: string;
  link: string;
  quantity: number;
  price: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [balRes, ordersRes] = await Promise.all([
        fetch("/api/balance"),
        fetch("/api/orders"),
      ]);
      const balData = await balRes.json();
      const ordersData = await ordersRes.json();
      setBalance(balData.balance || 0);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    completed: orders.filter((o) =>
      ["Completed", "completed"].includes(o.status)
    ).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Current Balance"
          value={loading ? "..." : formatCurrency(balance)}
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          title="Total Orders"
          value={loading ? "..." : stats.total}
          icon={Package}
          color="green"
        />
        <StatsCard
          title="Pending Orders"
          value={loading ? "..." : stats.pending}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Completed"
          value={loading ? "..." : stats.completed}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/new-order"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Order
        </Link>
        <Link
          href="/dashboard/add-funds"
          className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <CreditCard className="h-4 w-4" />
          Add Funds
        </Link>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <Link
            href="/dashboard/orders"
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </Link>
        </CardHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No orders yet</p>
            <Link
              href="/dashboard/new-order"
              className="text-blue-600 text-sm hover:underline mt-2 inline-block"
            >
              Place your first order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Service
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                    Qty
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Price
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-slate-900 truncate max-w-40">
                        {order.serviceName}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-40">
                        {order.link}
                      </p>
                    </td>
                    <td className="px-6 py-3 hidden sm:table-cell">
                      <span className="text-sm text-slate-700">
                        {order.quantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(order.price)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <span className="text-xs text-slate-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
