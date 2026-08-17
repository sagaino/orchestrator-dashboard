import React from "react"
import { RefreshCw } from "lucide-react"
import type { TelemetryHeaderProps } from "../types"

export const TelemetryHeader: React.FC<TelemetryHeaderProps> = ({ loading, onRefresh }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Telemetry & Token Scoreboard</h1>
        <p className="text-sm text-slate-400">
          Laporan akurat konsumsi token provider Antigravity, efisiensi prompt cache, context compaction, dan RTK proxy.
        </p>
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>
  )
}
