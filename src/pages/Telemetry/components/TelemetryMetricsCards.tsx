import React from "react"
import { Coins, Database, Zap, Cpu } from "lucide-react"
import type { TelemetryMetricsCardsProps } from "../types"

export const TelemetryMetricsCards: React.FC<TelemetryMetricsCardsProps> = ({
  usage,
  totalOptimizedTokens,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Total Token Used</span>
          <Coins className="h-4 w-4 text-indigo-400" />
        </div>
        <p className="text-2xl font-bold text-white">{(usage?.totalTokens ?? 0).toLocaleString()}</p>
        <p className="text-xs text-slate-500">Agregasi seluruh run</p>
      </div>

      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Cache Read Tokens</span>
          <Database className="h-4 w-4 text-emerald-400" />
        </div>
        <p className="text-2xl font-bold text-emerald-400">{(usage?.cacheReadTokens ?? 0).toLocaleString()}</p>
        <p className="text-xs text-slate-500">Token hemat dari prompt cache</p>
      </div>

      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Total Combined Savings</span>
          <Zap className="h-4 w-4 text-amber-400" />
        </div>
        <p className="text-2xl font-bold text-amber-400">{totalOptimizedTokens.toLocaleString()}</p>
        <p className="text-xs text-slate-500">Prompt Cache + RTK Filter</p>
      </div>

      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Primary Model</span>
          <Cpu className="h-4 w-4 text-indigo-400" />
        </div>
        <p className="text-lg font-bold text-white font-mono truncate">gemini-3.7-flash-high</p>
        <p className="text-xs text-slate-500">Effort: high</p>
      </div>
    </div>
  )
}
