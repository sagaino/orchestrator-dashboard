import React, { useState } from "react"
import {
  ShieldCheck,
  Terminal,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import type { RunOverviewTabProps } from "../types"
import type { VerificationResultItem } from "@/services/orchestrator"

export const RunOverviewTab: React.FC<RunOverviewTabProps> = ({ selectedRun }) => {
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const toggleLog = (scriptKey: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [scriptKey]: !prev[scriptKey],
    }))
  }

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      // Fallback if clipboard API is restricted
    }
  }

  const results = selectedRun.execution?.verification?.results || []

  return (
    <div className="space-y-6">
      {/* Scope Audit Card */}
      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Scope Audit Guard
          </span>
          <span
            className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
              selectedRun.execution?.scopeAudit?.passed
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-rose-500/15 text-rose-300"
            }`}
          >
            {selectedRun.execution?.scopeAudit?.passed ? "PASS" : "FAIL / PENDING"}
          </span>
        </div>

        <div className="text-xs space-y-1.5 text-slate-400">
          <div>
            <span className="text-slate-500">Allowed Paths: </span>
            <span className="font-mono text-slate-300">
              {selectedRun.task.allowedPaths?.join(", ") || "None"}
            </span>
          </div>
          {selectedRun.execution?.scopeAudit?.modifiedFiles && (
            <div>
              <span className="text-slate-500">Modified Files: </span>
              <span className="font-mono text-slate-300">
                {selectedRun.execution.scopeAudit.modifiedFiles.join(", ") || "None"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Verification Results with Collapsible Terminal Viewer */}
      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="h-4 w-4 text-indigo-400" />
            Verification & Test Gates
          </span>
          {results.length > 0 && (
            <span className="text-[11px] font-mono text-slate-400">
              {results.filter((r) => r.passed).length}/{results.length} Passed
            </span>
          )}
        </div>

        {results.length > 0 ? (
          <div className="space-y-2.5">
            {results.map((v: VerificationResultItem) => {
              const isExpanded = !!expandedLogs[v.script]
              const hasOutput = Boolean(v.stdoutTail?.trim() || v.stderrTail?.trim())

              return (
                <div
                  key={v.script}
                  className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden transition-all"
                >
                  {/* Script Header Bar */}
                  <div
                    onClick={() => hasOutput && toggleLog(v.script)}
                    className={`p-3 flex items-center justify-between text-xs transition-colors ${
                      hasOutput ? "cursor-pointer hover:bg-slate-800/60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {v.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-mono text-slate-200 font-medium">{v.script}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                          v.passed
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {v.passed ? "EXIT 0 (PASS)" : `EXIT ${v.exitCode} (FAIL)`}
                      </span>

                      {hasOutput && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLog(v.script)
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          aria-label={isExpanded ? "Tutup terminal output" : "Buka terminal output"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Collapsible Terminal Output Body */}
                  {isExpanded && hasOutput && (
                    <div className="border-t border-slate-800 bg-slate-950 p-3.5 space-y-3 font-mono text-xs">
                      {/* STDERR Section */}
                      {v.stderrTail?.trim() && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                              stderr tail
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(`${v.script}-stderr`, v.stderrTail || "")}
                              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                            >
                              {copiedKey === `${v.script}-stderr` ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy stderr</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-300 text-[11px] whitespace-pre-wrap break-all leading-relaxed max-h-64 overflow-y-auto">
                            {v.stderrTail}
                          </pre>
                        </div>
                      )}

                      {/* STDOUT Section */}
                      {v.stdoutTail?.trim() && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                              stdout tail
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(`${v.script}-stdout`, v.stdoutTail || "")}
                              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                            >
                              {copiedKey === `${v.script}-stdout` ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy stdout</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px] whitespace-pre-wrap break-all leading-relaxed max-h-64 overflow-y-auto">
                            {v.stdoutTail}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Belum ada data verifikasi yang dicatat.</p>
        )}
      </div>

      {/* Telemetry Card */}
      {selectedRun.telemetry && (
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            <span className="text-slate-500">Model: </span>
            <span className="text-slate-200 font-mono">{selectedRun.telemetry.model || "-"}</span>
          </div>
          <div>
            <span className="text-slate-500">Duration: </span>
            <span className="text-slate-200 font-mono">
              {selectedRun.telemetry.durationMs
                ? `${Math.round(selectedRun.telemetry.durationMs / 1000)}s`
                : "-"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Total Tokens: </span>
            <span className="text-indigo-400 font-mono font-semibold">
              {selectedRun.telemetry.tokens?.totalTokens?.toLocaleString() || "-"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
