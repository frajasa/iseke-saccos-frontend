import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconColor?: string;
  valueColor?: string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  iconColor = "text-primary",
  valueColor = "text-foreground",
}: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-primary/5 rounded-lg">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className={`text-3xl font-bold ${valueColor} mb-1`}>{value}</div>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        </div>
        {trend && (
          <div
            className={`text-sm font-semibold ${
              trend.isPositive ? "text-success" : "text-destructive"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}
