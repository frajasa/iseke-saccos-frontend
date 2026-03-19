"use client";

import { formatShortDate } from "@/lib/utils";

interface ScoreTrendChartProps {
  scores: { score: number; calculatedAt: string }[];
  width?: number;
  height?: number;
}

export default function ScoreTrendChart({
  scores,
  width = 500,
  height = 200,
}: ScoreTrendChartProps) {
  if (!scores || scores.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        No score history available
      </div>
    );
  }

  const reversed = [...scores].reverse(); // oldest first
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minScore = Math.max(0, Math.min(...reversed.map((s) => s.score)) - 10);
  const maxScore = Math.min(100, Math.max(...reversed.map((s) => s.score)) + 10);
  const range = maxScore - minScore || 1;

  const points = reversed.map((s, i) => ({
    x: padding.left + (reversed.length > 1 ? (i / (reversed.length - 1)) * chartW : chartW / 2),
    y: padding.top + chartH - ((s.score - minScore) / range) * chartH,
    ...s,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // Grid lines
  const gridLines = 5;
  const gridYs = Array.from({ length: gridLines }, (_, i) => {
    const val = minScore + (range / (gridLines - 1)) * i;
    const y = padding.top + chartH - ((val - minScore) / range) * chartH;
    return { y, label: Math.round(val) };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid */}
      {gridYs.map((g) => (
        <g key={g.label}>
          <line
            x1={padding.left}
            y1={g.y}
            x2={width - padding.right}
            y2={g.y}
            stroke="#e5e7eb"
            strokeDasharray="4 4"
          />
          <text x={padding.left - 6} y={g.y + 4} textAnchor="end" fill="#9ca3af" fontSize={10}>
            {g.label}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#scoreGradient)" opacity={0.15} />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#003B73" strokeWidth={2.5} strokeLinejoin="round" />

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#003B73" stroke="white" strokeWidth={2} />
          {/* X labels for first, middle, last */}
          {(i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)) && (
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fill="#6b7280"
              fontSize={9}
            >
              {formatShortDate(p.calculatedAt)}
            </text>
          )}
        </g>
      ))}

      <defs>
        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#003B73" />
          <stop offset="100%" stopColor="#003B73" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}
