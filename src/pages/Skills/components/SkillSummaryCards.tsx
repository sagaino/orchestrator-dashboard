import React from "react"
import type { SkillSummaryCardsProps } from "../types"

export const SkillSummaryCards: React.FC<SkillSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Installed versions</p>
        <p className="mt-2 text-2xl font-semibold text-white">{summary.totalInstalled}</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Enabled</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-300">{summary.totalEnabled}</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Observed usage</p>
        <p className="mt-2 text-2xl font-semibold text-indigo-300">{summary.totalAssignments}</p>
      </div>
    </div>
  )
}
