import React from "react"
import type { RunCardProps } from "../types"

export const RunCard: React.FC<RunCardProps> = ({ run, isSelected, onSelect }) => {
  const isReview = run.state === "REVIEW" || run.state === "RETROSPECTIVE"
  const isDone = run.state === "DONE"
  const isFailed = run.state === "FAILED"

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(run)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect(run)
        }
      }}
      className={`p-4 rounded-xl border transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        isSelected
          ? "bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
          : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-white">{run.task.id}</span>
          <span className="text-xs font-mono text-slate-400">({run.project.id})</span>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase ${
            isReview
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
              : isDone
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : isFailed
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
          }`}
        >
          {run.state}
        </span>
      </div>

      <p className="font-mono text-[11px] text-slate-500 truncate">{run.runId}</p>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <span>Model: {run.telemetry?.model || "gemini-3.7-flash-high"}</span>
        <span>{run.execution?.completedAt ? new Date(run.execution.completedAt).toLocaleTimeString() : "-"}</span>
      </div>
    </div>
  )
}

