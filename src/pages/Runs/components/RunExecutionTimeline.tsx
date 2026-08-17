import React from "react"
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  ShieldCheck,
  Terminal,
  Eye,
  Sparkles,
  RotateCcw,
  GitCommit,
  Workflow,
} from "lucide-react"
import type { RunExecutionTimelineProps } from "../types"
import type { RunHistoryEntry } from "@/services/orchestrator"

const getStateBadgeStyle = (state: string) => {
  switch (state.toUpperCase()) {
    case "DONE":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    case "REVIEW":
    case "RETROSPECTIVE":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30"
    case "FAILED":
    case "BLOCKED":
      return "bg-rose-500/15 text-rose-300 border-rose-500/30"
    case "RUNNING":
    case "EXECUTING":
    case "CLAIMED":
    case "CLAIMING":
      return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
    case "SCOPE_AUDIT":
      return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
    case "VERIFYING":
      return "bg-blue-500/15 text-blue-300 border-blue-500/30"
    default:
      return "bg-slate-700/40 text-slate-300 border-slate-600"
  }
}

const getStepIcon = (state: string, event?: string) => {
  const upperState = state.toUpperCase()
  const upperEvent = (event || "").toUpperCase()

  if (upperState === "DONE" || upperEvent.includes("PASS") || upperEvent.includes("ACCEPT")) {
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
  }
  if (upperState === "FAILED" || upperEvent.includes("FAIL") || upperEvent.includes("REJECT")) {
    return <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
  }
  if (upperState === "REVIEW" || upperEvent.includes("REVIEW")) {
    return <Eye className="h-3.5 w-3.5 text-amber-400" />
  }
  if (upperState === "RETROSPECTIVE") {
    return <Sparkles className="h-3.5 w-3.5 text-amber-300" />
  }
  if (upperState === "SCOPE_AUDIT") {
    return <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
  }
  if (upperState === "VERIFYING") {
    return <Terminal className="h-3.5 w-3.5 text-blue-400" />
  }
  if (upperState === "RUNNING" || upperState === "EXECUTING") {
    return <Play className="h-3.5 w-3.5 text-indigo-400" />
  }
  if (upperEvent.includes("RECOVER") || upperEvent.includes("RETRY")) {
    return <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
  }
  if (upperState === "PENDING_APPROVAL" || upperState === "APPROVED") {
    return <Clock className="h-3.5 w-3.5 text-slate-400" />
  }
  return <GitCommit className="h-3.5 w-3.5 text-slate-400" />
}

const formatTimestamp = (timestamp: string) => {
  try {
    const d = new Date(timestamp)
    if (isNaN(d.getTime())) return timestamp
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  } catch {
    return timestamp
  }
}

export const RunExecutionTimeline: React.FC<RunExecutionTimelineProps> = ({
  history = [],
  currentState = "UNKNOWN",
}) => {
  const hasHistory = Array.isArray(history) && history.length > 0

  return (
    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Execution Timeline & State Stepper
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasHistory && (
            <span className="text-[11px] font-mono text-slate-400">
              {history.length} {history.length === 1 ? "event" : "events"}
            </span>
          )}
          <span
            className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${getStateBadgeStyle(
              currentState
            )}`}
          >
            CURRENT: {currentState}
          </span>
        </div>
      </div>

      {/* Stepper Timeline Body */}
      {hasHistory ? (
        <div className="relative pt-2 pb-1 overflow-x-auto">
          {/* Timeline Items */}
          <div className="relative flex flex-col md:flex-row gap-3 md:gap-0 md:items-start">
            {history.map((entry: RunHistoryEntry, index: number) => {
              const isLast = index === history.length - 1
              const isCurrent = entry.state === currentState || isLast

              return (
                <div
                  key={`${entry.event}-${entry.at}-${index}`}
                  className="flex-1 relative flex md:flex-col items-start gap-3 md:gap-2 group min-w-[140px]"
                >
                  {/* Connector Line (Desktop) */}
                  {!isLast && (
                    <div
                      className="hidden md:block absolute top-3.5 left-[20px] right-0 h-[2px] bg-slate-700 group-hover:bg-slate-600 transition-colors z-0"
                      aria-hidden="true"
                    />
                  )}

                  {/* Connector Line (Mobile) */}
                  {!isLast && (
                    <div
                      className="md:hidden absolute top-6 bottom-0 left-[11px] w-[2px] bg-slate-700 z-0"
                      aria-hidden="true"
                    />
                  )}

                  {/* Step Icon Node */}
                  <div
                    className={`relative z-10 flex items-center justify-center h-6 w-6 rounded-full border bg-slate-900 shrink-0 transition-transform group-hover:scale-110 ${
                      isCurrent
                        ? "border-indigo-500 ring-2 ring-indigo-500/30"
                        : "border-slate-700"
                    }`}
                  >
                    {getStepIcon(entry.state, entry.event)}
                  </div>

                  {/* Step Details */}
                  <div className="space-y-1 pr-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${getStateBadgeStyle(
                          entry.state
                        )}`}
                      >
                        {entry.state}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-300 font-mono">
                      {entry.event}
                    </p>

                    <p className="text-[10px] text-slate-500 font-mono">
                      {formatTimestamp(entry.at)}
                    </p>

                    {entry.message && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-1.5 rounded border border-slate-800/80 mt-1 break-words">
                        {entry.message}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Empty / Fallback State */
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
            {getStepIcon(currentState)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-semibold">State Saat Ini:</span>
              <span
                className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold border ${getStateBadgeStyle(
                  currentState
                )}`}
              >
                {currentState}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Belum ada riwayat transisi state rinci yang tersimpan di history run ini.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
