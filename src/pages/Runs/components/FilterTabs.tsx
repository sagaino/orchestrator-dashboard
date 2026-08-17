import React from "react"
import type { FilterTabsProps, RunFilterState } from "../types"

const FILTER_OPTIONS: RunFilterState[] = ["ALL", "REVIEW", "ACTIVE", "DONE", "FAILED"]

export const FilterTabs: React.FC<FilterTabsProps> = ({ filterState, onFilterChange }) => {
  return (
    <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
      {FILTER_OPTIONS.map((f) => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            filterState === f
              ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}

