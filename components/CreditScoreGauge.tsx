"use client";

interface CreditScoreGaugeProps {
  score: number;
  rating: string;
  riskLevel: string;
  trend?: string;
  trendDelta?: number;
  size?: "sm" | "md" | "lg";
}

const RISK_COLORS: Record<string, string> = {
  VERY_LOW: "#22c55e",
  LOW: "#4ade80",
  MODERATE: "#f59e0b",
  HIGH: "#f97316",
  VERY_HIGH: "#ef4444",
};

const RISK_LABELS: Record<string, string> = {
  VERY_LOW: "Very Low Risk",
  LOW: "Low Risk",
  MODERATE: "Moderate Risk",
  HIGH: "High Risk",
  VERY_HIGH: "Very High Risk",
};

const TREND_ICONS: Record<string, string> = {
  IMPROVING: "↑",
  STABLE: "→",
  DECLINING: "↓",
  DETERIORATING: "⇓",
};

const TREND_COLORS: Record<string, string> = {
  IMPROVING: "text-green-500",
  STABLE: "text-gray-500",
  DECLINING: "text-orange-500",
  DETERIORATING: "text-red-500",
};

export default function CreditScoreGauge({
  score,
  rating,
  riskLevel,
  trend,
  trendDelta,
  size = "md",
}: CreditScoreGaugeProps) {
  const color = RISK_COLORS[riskLevel] || "#6b7280";
  const riskLabel = RISK_LABELS[riskLevel] || riskLevel;

  const sizes = {
    sm: { width: 120, stroke: 8, fontSize: 24, labelSize: 10 },
    md: { width: 180, stroke: 10, fontSize: 36, labelSize: 13 },
    lg: { width: 240, stroke: 14, fontSize: 48, labelSize: 16 },
  };
  const s = sizes[size];
  const radius = (s.width - s.stroke) / 2;
  const circumference = Math.PI * radius; // half circle
  const progress = (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={s.width}
        height={s.width / 2 + s.stroke}
        viewBox={`0 0 ${s.width} ${s.width / 2 + s.stroke}`}
      >
        {/* Background arc */}
        <path
          d={`M ${s.stroke / 2} ${s.width / 2} A ${radius} ${radius} 0 0 1 ${s.width - s.stroke / 2} ${s.width / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={s.stroke}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M ${s.stroke / 2} ${s.width / 2} A ${radius} ${radius} 0 0 1 ${s.width - s.stroke / 2} ${s.width / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
        />
        {/* Score text */}
        <text
          x={s.width / 2}
          y={s.width / 2 - 8}
          textAnchor="middle"
          fill={color}
          fontSize={s.fontSize}
          fontWeight="bold"
        >
          {score}
        </text>
        {/* Rating */}
        <text
          x={s.width / 2}
          y={s.width / 2 + s.labelSize}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={s.labelSize}
        >
          {rating}
        </text>
      </svg>
      <div className="mt-1 text-center">
        <span
          className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: color }}
        >
          {riskLabel}
        </span>
        {trend && (
          <div className={`mt-1 text-sm font-medium ${TREND_COLORS[trend] || ""}`}>
            {TREND_ICONS[trend] || ""}{" "}
            {trendDelta != null && trendDelta !== 0 && (
              <span>{trendDelta > 0 ? `+${trendDelta}` : trendDelta} pts</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
