"use client";

import { useEffect, useState } from "react";
import { DollarSign, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TopUp {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function AddFundsPage() {
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [loading, setLoading] = useState(false);
  const [topups, setTopups] = useState<TopUp[]>([]);
  const [loadingTopups, setLoadingTopups] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [balRes, topupsRes] = await Promise.all([
      fetch("/api/balance"),
      fetch("/api/topup"),
    ]);
    const balData = await balRes.json();
    const topupsData = await topupsRes.json();
    setBalance(balData.balance || 0);
    setTopups(Array.isArray(topupsData) ? topupsData : []);
    setLoadingTopups(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setAmountError("Please enter a valid amount");
      return;
    }
    setAmountError("");
    setLoading(true);

    const res = await fetch("/api/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(amount) }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast(data.error || "Failed to submit request", "error");
    } else {
      toast("Top-up request submitted! Awaiting admin approval.", "success");
      setAmount("");
      setTopups((prev) => [data, ...prev]);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Funds</h1>
        <p className="text-slate-500 mt-1">
          Request a balance top-up for your account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Funds Form */}
        <Card>
          <CardHeader>
            <CardTitle>Request Top-Up</CardTitle>
          </CardHeader>

          <div className="mb-6 p-4 bg-blue-50 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">
                Current Balance
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(balance)}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Amount (USD)"
              type="number"
              placeholder="10.00"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={amountError}
            />

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-700 mb-2">
                How it works
              </p>
              <ol className="text-sm text-slate-600 space-y-1.5">
                <li className="flex gap-2">
                  <span className="text-blue-600 font-semibold">1.</span>
                  Submit your top-up request with desired amount
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-semibold">2.</span>
                  Contact us via support to complete payment
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-semibold">3.</span>
                  Admin approves and credits your account
                </li>
              </ol>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Submit Request
            </Button>
          </form>
        </Card>

        {/* Recent Top-ups */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-slate-100">
            <CardTitle>Recent Requests</CardTitle>
          </div>

          {loadingTopups ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : topups.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No top-up requests yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {topups.map((topup) => (
                <div
                  key={topup.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(topup.amount)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(topup.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={topup.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
