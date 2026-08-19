import React, { useState, useEffect, useRef } from "react"
import { Terminal, RefreshCw, Copy, Check, ArrowDown, CheckCircle2, AlertCircle } from "lucide-react"
import { useRunLogs } from "@/hooks/use-orchestrator"
import type { RunManifest } from "@/services/orchestrator"

interface LiveTerminalLogsTabProps {
  selectedRun: RunManifest
}

export const LiveTerminalLogsTab: React.FC<LiveTerminalLogsTabProps> = ({ selectedRun }) => {
  const isRunning = ["RUNNING", "CLAIMED", "IN_PROGRESS", "CHANGES_REQUESTED"].includes(selectedRun.state)
  const { data: logData, isLoading, refetch, isFetching } = useRunLogs(selectedRun.runId, isRunning)
  
  const [filterType, setFilterType] = useState<"ALL" | "PROCESS" | "ERROR">("ALL")
  const [copied, setCopied] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const lines = logData?.lines || []

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines, autoScroll])

  const handleCopyLogs = () => {
    const rawText = lines.map(l => l.raw ? l.raw : JSON.stringify(l)).join("\n")
    navigator.clipboard.writeText(rawText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredLines = lines.filter((l) => {
    if (filterType === "ALL") return true
    if (filterType === "ERROR") return (l.event === "PROCESS_FINISHED" && l.exitCode !== 0) || l.stream === "stderr"
    if (filterType === "PROCESS") return l.event === "PROCESS_STARTED" || l.event === "PROCESS_FINISHED"
    return true
  })

  return (
    <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col font-mono text-xs">
      {/* Terminal Toolbar Header */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Terminal Title & Live Pulse */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">
              Agent Execution Stream
            </span>
            {isRunning && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/60 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                LIVE
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {(["ALL", "PROCESS", "ERROR"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterType(f)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider transition-colors cursor-pointer ${
                  filterType === f
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? "Disable auto-scroll" : "Enable auto-scroll"}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              autoScroll
                ? "bg-indigo-950/80 text-indigo-300 border-indigo-700/60"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Body Logs Window */}
      <div
        ref={scrollRef}
        className="p-4 bg-slate-950 text-slate-300 overflow-y-auto max-h-[520px] min-h-[300px] space-y-1.5 select-text"
      >
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
            <span>Memuat stream log eksekusi...</span>
          </div>
        ) : filteredLines.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-1.5">
            <Terminal className="h-6 w-6 mx-auto text-slate-600" />
            <p className="font-semibold text-slate-400">Belum ada output event log yang terekam.</p>
            <p className="text-[11px] text-slate-600">Event log akan muncul secara streaming saat agent mulai mengeksekusi tahapan task.</p>
          </div>
        ) : (
          filteredLines.map((entry, idx) => {
            const timeStr = entry.at ? new Date(entry.at).toLocaleTimeString("id-ID", { hour12: false }) : ""
            
            if (entry.event === "PROCESS_STARTED") {
              return (
                <div key={idx} className="flex items-start gap-2 text-indigo-300/90 py-0.5 border-l-2 border-indigo-500 pl-2">
                  <span className="text-slate-600 select-none text-[10px]">{timeStr}</span>
                  <span className="text-indigo-400 font-bold">[$]</span>
                  <span className="font-bold text-slate-200">
                    {entry.stage ? `[${entry.stage}] ` : ""}
                    {entry.command} {(entry.args || []).join(" ")}
                  </span>
                </div>
              )
            }

            if (entry.event === "PROCESS_FINISHED") {
              const isSuccess = entry.exitCode === 0
              return (
                <div key={idx} className={`flex items-center gap-2 py-0.5 border-l-2 pl-2 ${isSuccess ? "border-emerald-500 text-emerald-400" : "border-rose-500 text-rose-400"}`}>
                  <span className="text-slate-600 select-none text-[10px]">{timeStr}</span>
                  {isSuccess ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <AlertCircle className="h-3 w-3 text-rose-400" />}
                  <span>
                    Process {entry.stage ? `[${entry.stage}] ` : ""}finished with exit code {entry.exitCode}
                  </span>
                </div>
              )
            }

            if (entry.event === "PROCESS_OUTPUT") {
              const isStderr = entry.stream === "stderr"
              return (
                <div key={idx} className={`flex items-start gap-2 py-0.2 pl-3 ${isStderr ? "text-rose-300 bg-rose-950/20" : "text-slate-300"}`}>
                  <span className="text-slate-600 select-none text-[10px]">{timeStr}</span>
                  <span className="text-slate-400 font-mono break-all whitespace-pre-wrap">
                    {entry.line}
                  </span>
                </div>
              )
            }

            // Fallback generic json
            return (
              <div key={idx} className="flex items-start gap-2 py-0.5 text-slate-400 pl-3">
                <span className="text-slate-600 select-none text-[10px]">{timeStr}</span>
                <span className="break-all whitespace-pre-wrap">{entry.raw || JSON.stringify(entry)}</span>
              </div>
            )
          })
        )}
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Total Events: {filteredLines.length} baris</span>
        <span className="font-mono text-slate-500">Log: {selectedRun.runId}.jsonl</span>
      </div>
    </div>
  )
}
