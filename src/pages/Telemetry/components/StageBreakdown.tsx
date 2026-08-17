import React from "react"
import { Layers } from "lucide-react"
import type { StageBreakdownProps } from "../types"

const STAGE_COLOR_MAP: Record<string, string> = {
  TASK_INTAKE: "#6366f1",
  INTAKE: "#6366f1",
  IMPLEMENTATION: "#10b981",
  RECOVERY: "#f59e0b",
  RETROSPECTIVE: "#8b5cf6",
  PLANNING: "#38bdf8",
  VERIFICATION: "#06b6d4",
}

export const StageBreakdown: React.FC<StageBreakdownProps> = ({ stageBreakdown, stageData }) => {
  const entries = Object.entries(stageBreakdown)
  if (entries.length === 0 && (!stageData || stageData.length === 0)) return null

  return (
    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Stage Metrics & Diagnostics</h2>
          </div>
          <p className="text-xs text-slate-400">
            Rincian granular jumlah panggilan model, durasi eksekusi, dan beban token pada masing-masing tahapan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stageData && stageData.length > 0
          ? stageData.map((stage) => {
              const avgTokensPerCall =
                stage.calls > 0 ? Math.round(stage.totalTokens / stage.calls) : 0

              return (
                <div
                  key={stage.stageKey}
                  className="p-4 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="font-semibold text-sm text-slate-200">{stage.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {stage.calls} {stage.calls === 1 ? "call" : "calls"}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Tokens:</span>
                      <span className="text-indigo-300 font-semibold">
                        {stage.totalTokens.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Avg / Call:</span>
                      <span className="text-slate-300">
                        {avgTokensPerCall.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Duration:</span>
                      <span className="text-slate-300">
                        {stage.durationSeconds > 0
                          ? `${stage.durationSeconds.toFixed(1)}s`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          : entries.map(([stageKey, stats]) => {
              const color =
                STAGE_COLOR_MAP[stageKey.toUpperCase()] || "#6366f1"
              const totalTokens = stats.usage?.totalTokens ?? 0
              const avgTokensPerCall =
                stats.calls > 0 ? Math.round(totalTokens / stats.calls) : 0

              const formattedName = stageKey
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())

              return (
                <div
                  key={stageKey}
                  className="p-4 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-semibold text-sm text-slate-200">{formattedName}</span>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {stats.calls} {stats.calls === 1 ? "call" : "calls"}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Tokens:</span>
                      <span className="text-indigo-300 font-semibold">
                        {totalTokens.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Avg / Call:</span>
                      <span className="text-slate-300">
                        {avgTokensPerCall.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Duration:</span>
                      <span className="text-slate-300">
                        {stats.durationSeconds
                          ? `${stats.durationSeconds.toFixed(1)}s`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )
}
