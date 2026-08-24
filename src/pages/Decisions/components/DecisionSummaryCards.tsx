import React from "react"
import type { DecisionSummaryCardsProps } from "../types"

export const DecisionSummaryCards: React.FC<DecisionSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Open decisions</p>
        <p className="mt-1 text-2xl font-semibold text-white">{summary.total}</p>
      </div>
      <div className="rounded-xl border border-rose-500/25 bg-rose-950/10 p-4">
        <p className="text-xs uppercase tracking-wide text-rose-300/70">High risk</p>
        <p className="mt-1 text-2xl font-semibold text-rose-200">{summary.high}</p>
      </div>
      <div className="rounded-xl border border-indigo-500/25 bg-indigo-950/10 p-4">
        <p className="text-xs uppercase tracking-wide text-indigo-300/70">Review rule</p>
        <p className="mt-1 text-sm font-medium text-indigo-100">Risk ↓ · oldest first</p>
      </div>
    </div>
  )
}
