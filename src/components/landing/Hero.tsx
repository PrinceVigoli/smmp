import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-slate-50 overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="h-4 w-4" />
            Fastest SMM Panel in the Market
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Boost Your Social Media
            <span className="text-blue-600"> Growth</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            The most reliable SMM panel offering high-quality followers, likes,
            views, and more. Affordable prices, instant delivery, 24/7 support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-lg"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            No credit card required · Start with $0 · Cancel anytime
          </p>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { value: "10M+", label: "Orders Completed" },
            { value: "50K+", label: "Happy Customers" },
            { value: "500+", label: "Services Available" },
            { value: "99.9%", label: "Uptime Guaranteed" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-blue-600">{value}</p>
              <p className="text-sm text-slate-600 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
