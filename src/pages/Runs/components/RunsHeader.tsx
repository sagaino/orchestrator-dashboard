import React from "react"
import { Search, RefreshCw } from "lucide-react"
import type { RunsHeaderProps } from "../types"

export const RunsHeader: React.FC<RunsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  runsLoading,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Runs & Human Review Center</h1>
        <p className="text-sm text-slate-400">
          Audit eksekusi agent, periksa diff kode in-browser, jalankan visual QA dev server, dan kelola approval.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari Run ID, Task, atau Project..."
            className="pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 w-64"
          />
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={runsLoading}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <RefreshCw className={`h-4 w-4 ${runsLoading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>
    </div>
  )
}
