"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TopUp {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
}

export default function AdminTopupsPage() {
  const { toast } = useToast();
  const [topups, setTopups] = useState<TopUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/topups")
      .then((r) => r.json())
      .then((data) => {
        setTopups(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  async function handleAction(topupId: string, action: "approve" | "reject") {
    setProcessing(topupId);
    const res = await fetch("/api/admin/topups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topupId, action }),
    });

    if (res.ok) {
      setTopups((prev) =>
        prev.map((t) =>
          t.id === topupId
            ? { ...t, status: action === "approve" ? "Approved" : "Rejected" }
            : t
        )
      );
      toast(
        action === "approve"
          ? "Top-up approved and balance credited"
          : "Top-up rejected",
        action === "approve" ? "success" : "info"
      );
    } else {
      toast("Action failed", "error");
    }
    setProcessing(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Top-up Requests</h1>
        <p className="text-slate-500 mt-1">Approve or reject user top-up requests.</p>
      </div>

      <Card padding="none">
        <div className="px-6 py-4 border-b border-slate-100">
          <CardTitle>All Requests ({topups.length})</CardTitle>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : topups.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No top-up requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Date</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topups.map((topup) => (
                  <tr key={topup.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{topup.user.name}</p>
                      <p className="text-xs text-slate-500">{topup.user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(topup.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={topup.status} />
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-xs text-slate-500">{formatDate(topup.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {topup.status === "Pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(topup.id, "approve")}
                            loading={processing === topup.id}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleAction(topup.id, "reject")}
                            loading={processing === topup.id}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      )}
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
