import React, { useState } from "react"
import {
  Terminal,
  Zap,
  Clock,
  Gauge,
  Sparkles,
  Sliders,
} from "lucide-react"
import type { RtkAnalyticsCardProps } from "../types"

export const RtkAnalyticsCard: React.FC<RtkAnalyticsCardProps> = ({
  rtkSummary,
  available = true,
}) => {
  const [simulatorTokens, setSimulatorTokens] = useState<number>(50000)
  const [showSimulator, setShowSimulator] = useState<boolean>(false)

  const rawTokens = rtkSummary?.totalInputTokens ?? 0
  const outputTokens = rtkSummary?.totalOutputTokens ?? 0
  const savedTokens = rtkSummary?.totalSavedTokens ?? 0
  const savingsPct = rtkSummary?.savingsPercentage ?? (rawTokens > 0 ? Number(((savedTokens / rawTokens) * 100).toFixed(1)) : 0)
  const totalCommands = rtkSummary?.totalCommands ?? 0
  const avgTimeMs = rtkSummary?.avgTimeMs ?? 0
  const totalTimeMs = rtkSummary?.totalTimeMs ?? 0

  // Compression multiplier
  const compressionRatio =
    outputTokens > 0 ? (rawTokens / outputTokens).toFixed(1) : "1.0"

  // Simulator calculation based on current efficiency rate or default 85%
  const simSavingsRate = savingsPct > 0 ? savingsPct / 100 : 0.85
  const simulatedSaved = Math.round(simulatorTokens * simSavingsRate)
  const simulatedDelivered = simulatorTokens - simulatedSaved

  return (
    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Terminal className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">
              RTK (Rust Token Killer) CLI Proxy Scoreboard
            </h2>
            <span
              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
                available
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {available ? "ACTIVE PROXY" : "STANDBY"}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Analitik pemangkasan token bash output secara real-time dan transparan dari binary RTK CLI.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setShowSimulator(!showSimulator)}
            className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              showSimulator
                ? "bg-indigo-950/60 border-indigo-500/40 text-indigo-300"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>{showSimulator ? "Tutup Simulator" : "Simulasi RTK"}</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>Scope: Global CLI</span>
          </div>
        </div>
      </div>

      {/* Visual Efficiency Ratio Bar */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Token Efficiency Breakdown</span>
            <span className="text-slate-500 font-mono text-[11px]">
              ({rawTokens.toLocaleString()} raw tokens processed)
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-indigo-400">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Delivered: {outputTokens.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Saved: {savedTokens.toLocaleString()} ({savingsPct}%)
            </span>
          </div>
        </div>

        {/* Stacked comparison bar */}
        <div className="w-full bg-slate-900 rounded-full h-3.5 flex overflow-hidden p-0.5 border border-slate-800">
          <div
            className="bg-indigo-500 h-full rounded-l-full transition-all duration-500"
            style={{
              width: rawTokens > 0 ? `${Math.max((outputTokens / rawTokens) * 100, 3)}%` : "20%",
            }}
            title={`Delivered: ${outputTokens.toLocaleString()}`}
          />
          <div
            className="bg-emerald-500 h-full rounded-r-full transition-all duration-500"
            style={{
              width: rawTokens > 0 ? `${Math.min(savingsPct, 97)}%` : "80%",
            }}
            title={`Saved: ${savedTokens.toLocaleString()}`}
          />
        </div>
      </div>

      {/* Interactive Savings Simulator */}
      {showSimulator && (
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold text-indigo-200">
                Interactive CLI Token Savings Simulator
              </span>
            </div>
            <span className="text-[11px] font-mono text-indigo-300">
              Simulasi Output: <strong>{simulatorTokens.toLocaleString()} tokens</strong>
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="5000"
              max="200000"
              step="5000"
              value={simulatorTokens}
              onChange={(e) => setSimulatorTokens(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5k tokens (e.g. git status)</span>
              <span>50k tokens (e.g. git diff)</span>
              <span>200k tokens (e.g. npm test / build)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-slate-500 text-[10px]">Raw Shell Output</span>
              <p className="font-bold text-slate-300 font-mono">
                {simulatorTokens.toLocaleString()} tokens
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-slate-500 text-[10px]">Delivered to LLM</span>
              <p className="font-bold text-indigo-300 font-mono">
                {simulatedDelivered.toLocaleString()} tokens
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
              <span className="text-emerald-400/80 text-[10px] font-medium">Estimated Saved</span>
              <p className="font-bold text-emerald-400 font-mono">
                +{simulatedSaved.toLocaleString()} ({(simSavingsRate * 100).toFixed(0)}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Commands Count */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total CLI Commands</span>
            <Terminal className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <p className="text-xl font-bold text-slate-100 font-mono">{totalCommands}</p>
          <span className="text-[10px] text-slate-500">Perintah proxy terintercept</span>
        </div>

        {/* Raw Shell Output */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Raw Shell Output</span>
            <Gauge className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <p className="text-xl font-bold text-slate-300 font-mono">
            {rawTokens.toLocaleString()} <span className="text-xs font-sans text-slate-500">tokens</span>
          </p>
          <span className="text-[10px] text-slate-500">Sebelum difilter RTK</span>
        </div>

        {/* Filtered Output */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Filtered Delivered</span>
            <span className="text-[10px] font-mono font-bold text-indigo-400">{compressionRatio}x</span>
          </div>
          <p className="text-xl font-bold text-indigo-300 font-mono">
            {outputTokens.toLocaleString()} <span className="text-xs font-sans text-slate-500">tokens</span>
          </p>
          <span className="text-[10px] text-slate-500">Kompak & berakurasi tinggi</span>
        </div>

        {/* RTK Tokens Saved */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>RTK Tokens Saved</span>
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 font-mono">
            +{savedTokens.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400/90 font-semibold font-mono">
            {savingsPct}% Efisiensi Output
            {avgTimeMs > 0 ? ` • ${avgTimeMs.toFixed(0)}ms avg` : totalTimeMs > 0 ? ` • ${(totalTimeMs / 1000).toFixed(1)}s` : ""}
          </span>
        </div>
      </div>
    </div>
  )
}
