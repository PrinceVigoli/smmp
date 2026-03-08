import { UserPlus, CreditCard, ShoppingCart } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Account",
    description:
      "Sign up for free in seconds. No credit card required to get started.",
  },
  {
    icon: CreditCard,
    step: "02",
    title: "Add Funds",
    description:
      "Top up your balance using various payment methods. Start from as low as $1.",
  },
  {
    icon: ShoppingCart,
    step: "03",
    title: "Place Your Order",
    description:
      "Browse 500+ services, select what you need, and watch your social media grow.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get started in 3 simple steps. It&apos;s easy, fast, and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5 bg-blue-100" />

          {steps.map(({ icon: Icon, step, title, description }, i) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {title}
              </h3>
              <p className="text-slate-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
