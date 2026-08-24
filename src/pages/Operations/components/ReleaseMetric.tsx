import React from "react"
import type { ReleaseMetricProps } from "../types"

export const ReleaseMetric: React.FC<ReleaseMetricProps> = ({
  label,
  value,
  detail,
  tone = "neutral",
}) => {
  const color =
    tone === "good"
      ? "text-emerald-300"
      : tone === "bad"
        ? "text-rose-300"
        : "text-slate-100"
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 truncate text-sm font-semibold ${color}`} title={value}>
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-slate-500" title={detail}>
        {detail}
      </p>
    </div>
  )
}
