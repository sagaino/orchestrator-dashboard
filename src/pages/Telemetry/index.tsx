import React, { useEffect, useState } from "react"
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Database,
  Clock,
  Coins,
} from "lucide-react"
import { OrchestratorApi, type TelemetryReport } from "@/services/orchestrator"

export const TelemetryPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryReport | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await OrchestratorApi.getTelemetry()
      setTelemetry(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const usage = telemetry?.telemetry?.summary?.usage
  const latestRuns = telemetry?.latestRuns || []
  const stageBreakdown = telemetry?.telemetry?.summary?.byStage || {}

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Telemetry & Token Scoreboard</h1>
          <p className="text-sm text-slate-400">
            Laporan akurat konsumsi token provider Antigravity (Gemini), efisiensi cache, dan durasi eksekusi per project.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Metric Cards Row */}
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
            <span>Total Recorded Runs</span>
            <Layers className="h-4 w-4 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-white">{telemetry?.runCount ?? latestRuns.length}</p>
          <p className="text-xs text-slate-500">
            {telemetry?.summary?.explicitRecords ?? 0} explicit / {telemetry?.summary?.inferredRecords ?? 0} inferred
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Primary Model</span>
            <Cpu className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-lg font-bold text-white font-mono truncate">gemini-3.7-flash-high</p>
          <p className="text-xs text-slate-500">Effort: high</p>
        </div>
      </div>

      {/* Stage Breakdown */}
      {Object.keys(stageBreakdown).length > 0 && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-semibold text-white">Token Breakdown by Stage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stageBreakdown).map(([stage, stats]) => (
              <div key={stage} className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-200">{stage}</span>
                  <span className="text-[11px] font-mono text-slate-400">{stats.calls} calls</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Tokens:</span>
                  <span className="text-indigo-300 font-semibold">{stats.usage?.totalTokens?.toLocaleString() ?? 0}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Duration:</span>
                  <span>{stats.durationSeconds ? `${stats.durationSeconds.toFixed(1)}s` : "-"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Runs Telemetry Table */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-semibold text-white">Recorded Runs Log</h2>
        {latestRuns.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">Belum ada data telemetry yang tercatat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task / Run ID</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Total Tokens</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Calls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {latestRuns.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{r.taskId || r.runId}</td>
                    <td className="py-3 px-4 text-slate-400">{r.projectId}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                        {r.state}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-indigo-300 font-semibold">{r.totalTokens?.toLocaleString() ?? "-"}</td>
                    <td className="py-3 px-4">{r.durationSeconds ? `${r.durationSeconds.toFixed(1)}s` : "-"}</td>
                    <td className="py-3 px-4 text-slate-400">{r.calls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
