import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "blue" | "green" | "yellow" | "red";
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  subtitle,
}: StatsCardProps) {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
    },
    yellow: {
      bg: "bg-yellow-50",
      icon: "text-yellow-600",
    },
    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
    },
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            colors[color].bg
          )}
        >
          <Icon className={cn("h-6 w-6", colors[color].icon)} />
        </div>
      </div>
    </Card>
  );
}
