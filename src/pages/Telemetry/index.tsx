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

  const summary = telemetry?.summary
  const runs = telemetry?.runs || []

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
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
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
          <p className="text-2xl font-bold text-white">{summary?.totalTokens.toLocaleString() || "0"}</p>
          <p className="text-xs text-slate-500">Agregasi seluruh run</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Cache Read Tokens</span>
            <Database className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{summary?.cacheReadTokens.toLocaleString() || "0"}</p>
          <p className="text-xs text-slate-500">Token hemat dari prompt cache</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Total Recorded Runs</span>
            <Layers className="h-4 w-4 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-white">{summary?.totalRuns || "0"}</p>
          <p className="text-xs text-slate-500">
            {summary?.explicitRecords || 0} explicit / {summary?.inferredRecords || 0} inferred
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

      {/* Projects Breakdown */}
      {summary?.projects && Object.keys(summary.projects).length > 0 && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-semibold text-white">Token Breakdown by Project</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(summary.projects).map(([projId, stats]) => (
              <div key={projId} className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-1.5">
                <span className="font-semibold text-sm text-slate-200">{projId}</span>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Runs: {stats.runs}</span>
                  <span className="text-indigo-300 font-semibold">{stats.tokens.toLocaleString()} tokens</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Runs Telemetry Table */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-semibold text-white">Recorded Runs Log</h2>
        {runs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">Belum ada data telemetry yang tercatat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task / Run ID</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">Total Tokens</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {runs.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{r.taskId || r.runId}</td>
                    <td className="py-3 px-4 text-slate-400">{r.projectId}</td>
                    <td className="py-3 px-4 text-slate-400">{r.model}</td>
                    <td className="py-3 px-4 text-indigo-300 font-semibold">{r.totalTokens.toLocaleString()}</td>
                    <td className="py-3 px-4">{r.durationMs ? `${(r.durationMs / 1000).toFixed(1)}s` : "-"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          r.source === "explicit"
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {r.source}
                      </span>
                    </td>
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
