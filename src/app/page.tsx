import Link from "next/link";
import { Zap, Instagram, Twitter, Youtube, Music } from "lucide-react";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 text-lg">SMMP</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                Features
              </Link>
              <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                How It Works
              </Link>
              <Link href="#services" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                Services
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <Hero />
      <Features />
      <HowItWorks />

      {/* Services Preview */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Popular Services
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We support all major social media platforms with hundreds of services.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { name: "Instagram", icon: Instagram, color: "bg-pink-50 text-pink-600", services: "120+" },
              { name: "Twitter/X", icon: Twitter, color: "bg-sky-50 text-sky-600", services: "80+" },
              { name: "YouTube", icon: Youtube, color: "bg-red-50 text-red-600", services: "90+" },
              { name: "TikTok", icon: Music, color: "bg-slate-50 text-slate-600", services: "70+" },
            ].map(({ name, icon: Icon, color, services }) => (
              <div
                key={name}
                className="flex flex-col items-center p-6 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all text-center"
              >
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{name}</h3>
                <p className="text-sm text-slate-500">{services} services</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">SMMP</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/register" className="hover:text-white transition-colors">Register</Link>
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} SMMP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
