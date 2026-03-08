import { Zap, Shield, Clock, DollarSign, RefreshCw, Headphones } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Delivery",
    description:
      "Orders start processing immediately after placement. Get results fast.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Shield,
    title: "100% Safe & Secure",
    description:
      "We use secure methods that comply with platform guidelines. Your account is safe.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description:
      "Our support team is available around the clock to help you with any issues.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: DollarSign,
    title: "Cheapest Prices",
    description:
      "Get the best rates in the market. We offer competitive pricing for all services.",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    icon: RefreshCw,
    title: "Auto Refill",
    description:
      "Many services include a free refill guarantee to maintain your results.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: Headphones,
    title: "API Access",
    description:
      "Integrate with our API to automate your orders and manage your account.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Why Choose SMMP?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We provide the best social media marketing services with unmatched
            quality and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="p-6 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all"
            >
              <div
                className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}
              >
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
