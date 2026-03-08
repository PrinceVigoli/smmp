"use client";

import { useEffect, useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { calcPrice, formatCurrency } from "@/lib/utils";

interface Service {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
}

export default function NewOrderPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [balance, setBalance] = useState(0);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [linkError, setLinkError] = useState("");
  const [quantityError, setQuantityError] = useState("");

  useEffect(() => {
    async function fetchData() {
      const [servRes, balRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/balance"),
      ]);
      const servData = await servRes.json();
      const balData = await balRes.json();
      setServices(Array.isArray(servData) ? servData : []);
      setBalance(balData.balance || 0);
      setLoading(false);
    }
    fetchData();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(services.map((s) => s.category))).sort(),
  ];

  const filtered = services.filter((s) => {
    const matchesSearch =
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const price = selectedService && quantity
    ? calcPrice(selectedService.rate, parseInt(quantity) || 0)
    : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let hasError = false;

    if (!link) {
      setLinkError("Link is required");
      hasError = true;
    } else {
      setLinkError("");
    }

    if (!quantity) {
      setQuantityError("Quantity is required");
      hasError = true;
    } else if (!selectedService) {
      setQuantityError("Please select a service");
      hasError = true;
    } else {
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty < parseInt(selectedService.min)) {
        setQuantityError(`Minimum quantity is ${selectedService.min}`);
        hasError = true;
      } else if (qty > parseInt(selectedService.max)) {
        setQuantityError(`Maximum quantity is ${selectedService.max}`);
        hasError = true;
      } else {
        setQuantityError("");
      }
    }

    if (hasError || !selectedService) return;

    if (balance < price) {
      toast("Insufficient balance. Please add funds.", "error");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: selectedService.service,
        serviceName: selectedService.name,
        link,
        quantity: parseInt(quantity),
        price,
        rate: selectedService.rate,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast(data.error || "Order failed", "error");
    } else {
      toast("Order placed successfully!", "success");
      setBalance((b) => b - price);
      setLink("");
      setQuantity("");
      setSelectedService(null);
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Order</h1>
        <p className="text-slate-500 mt-1">
          Choose a service and place your order.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Services List */}
        <div className="xl:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Tabs */}
          {!loading && (
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 10).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Services */}
          <Card padding="none">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No services found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {filtered.slice(0, 50).map((service) => (
                  <button
                    key={service.service}
                    onClick={() => {
                      setSelectedService(service);
                      setQuantity(service.min);
                    }}
                    className={`w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors ${
                      selectedService?.service === service.service
                        ? "bg-blue-50 border-l-2 border-blue-600"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {service.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {service.category} · Min: {service.min} · Max:{" "}
                          {service.max}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-semibold text-blue-600">
                          ${parseFloat(service.rate).toFixed(4)}
                        </p>
                        <p className="text-xs text-slate-500">per 1000</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Order Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>

            <div className="mb-4 p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-600 font-medium">Your Balance</p>
              <p className="text-xl font-bold text-blue-700">
                {formatCurrency(balance)}
              </p>
            </div>

            {selectedService ? (
              <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 font-medium">
                  Selected Service
                </p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {selectedService.name}
                </p>
                <p className="text-xs text-slate-500">
                  Rate: ${parseFloat(selectedService.rate).toFixed(4)}/1000
                </p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-slate-50 rounded-xl text-center">
                <ShoppingCart className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  Select a service from the list
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Link / URL"
                type="url"
                placeholder="https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                error={linkError}
              />
              <Input
                label="Quantity"
                type="number"
                placeholder={selectedService ? selectedService.min : "0"}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                error={quantityError}
                helperText={
                  selectedService
                    ? `Min: ${selectedService.min} / Max: ${selectedService.max}`
                    : undefined
                }
              />

              {price > 0 && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="text-xs text-green-600 font-medium">
                    Price Estimate
                  </p>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(price)}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                loading={submitting}
                disabled={!selectedService}
                className="w-full"
                size="lg"
              >
                Place Order
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
