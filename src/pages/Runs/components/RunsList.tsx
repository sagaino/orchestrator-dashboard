import React from "react"
import { RunCard } from "./RunCard"
import type { RunsListProps } from "../types"

export const RunsList: React.FC<RunsListProps> = ({ runs, selectedRun, onSelectRun }) => {
  if (runs.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
        Tidak ada data Run yang sesuai kriteria.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {runs.map((r) => (
        <RunCard
          key={r.runId}
          run={r}
          isSelected={selectedRun?.runId === r.runId}
          onSelect={onSelectRun}
        />
      ))}
    </div>
  )
}
