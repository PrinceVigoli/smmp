"use client";

import { useEffect, useState } from "react";
import { Settings, Search } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

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

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(services.map((s) => s.category))).sort(),
  ];

  const filtered = services.filter((s) => {
    const matchSearch =
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      String(s.service).includes(search);
    const matchCat = category === "All" || s.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Services</h1>
        <p className="text-slate-500 mt-1">
          All available services from the SMM API.
        </p>
      </div>

      <Card padding="none">
        <div className="px-6 py-4 border-b border-slate-100 space-y-3">
          <CardHeader className="mb-0">
            <CardTitle>Services ({services.length})</CardTitle>
          </CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No services found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">ID</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Rate</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Min / Max</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.slice(0, 100).map((service) => (
                  <tr key={service.service} className="hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono text-slate-500">
                        #{service.service}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-sm text-slate-900 truncate max-w-56">{service.name}</p>
                      <p className="text-xs text-slate-500">{service.type}</p>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm font-semibold text-blue-600">
                        ${parseFloat(service.rate).toFixed(4)}
                      </span>
                      <p className="text-xs text-slate-500">per 1000</p>
                    </td>
                    <td className="px-6 py-3 hidden sm:table-cell">
                      <span className="text-xs text-slate-700">
                        {service.min} / {service.max}
                      </span>
                    </td>
                    <td className="px-6 py-3 hidden lg:table-cell">
                      <div className="flex gap-1.5">
                        {service.refill && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                            Refill
                          </span>
                        )}
                        {service.cancel && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                            Cancel
                          </span>
                        )}
                      </div>
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
