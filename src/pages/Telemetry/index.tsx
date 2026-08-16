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
  ShieldCheck,
  Zap,
  Terminal,
  ArrowDownRight,
} from "lucide-react"
import { OrchestratorApi, type TelemetryReport, type RtkAnalytics } from "@/services/orchestrator"

export const TelemetryPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryReport | null>(null)
  const [rtk, setRtk] = useState<RtkAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [telemetryData, rtkData] = await Promise.all([
        OrchestratorApi.getTelemetry().catch(() => null),
        OrchestratorApi.getRtkTelemetry().catch(() => null),
      ])
      if (telemetryData) setTelemetry(telemetryData)
      if (rtkData) setRtk(rtkData)
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
  const rtkSummary = rtk?.summary

  // Calculate combined savings
  const cacheSavings = usage?.cacheReadTokens ?? 0
  const rtkSavings = rtkSummary?.totalSavedTokens ?? 0
  const totalOptimizedTokens = cacheSavings + rtkSavings

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Telemetry & Token Scoreboard</h1>
          <p className="text-sm text-slate-400">
            Laporan akurat konsumsi token provider Antigravity, efisiensi prompt cache, context compaction, dan RTK proxy.
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

      {/* RTK Token Killer Analytics Section */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Terminal className="h-5 w-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-white">RTK (Rust Token Killer) CLI Proxy Analytics</h2>
              <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE PROXY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Analitik pemangkasan token bash output secara real-time dari binary RTK CLI.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>Scope: Global CLI Interception</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-xs">Total CLI Commands</span>
            <p className="text-xl font-bold text-slate-100 font-mono">{rtkSummary?.totalCommands ?? 0}</p>
            <span className="text-[10px] text-slate-500 font-sans">Perintah proxy terintercept</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-xs">Raw Shell Output</span>
            <p className="text-xl font-bold text-slate-300 font-mono">
              {(rtkSummary?.totalInputTokens ?? 0).toLocaleString()} <span className="text-xs font-sans text-slate-500">tokens</span>
            </p>
            <span className="text-[10px] text-slate-500 font-sans">Sebelum difilter RTK</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-xs">Filtered Output Delivered</span>
            <p className="text-xl font-bold text-indigo-300 font-mono">
              {(rtkSummary?.totalOutputTokens ?? 0).toLocaleString()} <span className="text-xs font-sans text-slate-500">tokens</span>
            </p>
            <span className="text-[10px] text-slate-500 font-sans">Kompak & berakurasi tinggi</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-xs">RTK Tokens Saved</span>
            <p className="text-xl font-bold text-emerald-400 font-mono">
              +{(rtkSummary?.totalSavedTokens ?? 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-400/80 font-sans font-semibold">
              {rtkSummary?.savingsPercentage ?? 0}% Efisiensi Output
            </span>
          </div>
        </div>
      </div>

      {/* Stage Breakdown */}
      {Object.keys(stageBreakdown).length > 0 && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-semibold text-white">Token Breakdown by Orchestration Stage</h2>
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
