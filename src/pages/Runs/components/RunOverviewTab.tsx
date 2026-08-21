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
  GitCommit,
  Archive,
  UserCheck,
  AlertTriangle,
  RotateCcw,
} from "lucide-react"
import type { RunOverviewTabProps } from "../types"
import type { EvidenceStatus, RunEvidenceVerificationResult } from "@/services/orchestrator"

const evidenceTone = (status: EvidenceStatus) => {
  if (status === "PASS") return "bg-emerald-500/15 text-emerald-300"
  if (status === "FAIL") return "bg-rose-500/15 text-rose-300"
  return "bg-amber-500/15 text-amber-300"
}

export const RunOverviewTab: React.FC<RunOverviewTabProps> = ({
  selectedRun,
  evidence,
  evidenceLoading = false,
  evidenceError = false,
}) => {
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

  const results = evidence?.verification.results || []
  const scopeStatus = evidence?.scope.status ?? "UNKNOWN"

  if (evidenceLoading && !evidence) {
    return <p className="text-xs text-slate-400">Memuat evidence run...</p>
  }

  if (evidenceError || !evidence) {
    return (
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>Evidence run tidak tersedia. Status safety tidak diasumsikan lulus.</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {evidence.restart && (
        <div className={`p-4 rounded-xl border space-y-2.5 ${
          evidence.restart.status === "MANUAL_RECOVERY_REQUIRED"
            ? "bg-rose-500/10 border-rose-500/30"
            : "bg-sky-500/10 border-sky-500/30"
        }`}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <RotateCcw className="h-4 w-4 text-sky-400" />
              Restart Reconciliation
            </span>
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
              evidence.restart.status === "MANUAL_RECOVERY_REQUIRED"
                ? "bg-rose-500/15 text-rose-300"
                : "bg-sky-500/15 text-sky-300"
            }`}>
              {evidence.restart.status}
            </span>
          </div>
          <div className="grid gap-1.5 text-xs text-slate-400 md:grid-cols-2">
            <p><span className="text-slate-500">Action: </span><span className="font-mono text-slate-200">{evidence.restart.action}</span></p>
            <p><span className="text-slate-500">Previous state: </span><span className="font-mono text-slate-200">{evidence.restart.previousState || "UNKNOWN"}</span></p>
            {evidence.restart.reconciledAt && <p className="md:col-span-2"><span className="text-slate-500">Reconciled at: </span><span className="font-mono text-slate-200">{new Date(evidence.restart.reconciledAt).toLocaleString()}</span></p>}
            {evidence.restart.taskSyncError && <p className="md:col-span-2 text-rose-300">Task sync: {evidence.restart.taskSyncError}</p>}
          </div>
        </div>
      )}

      {/* Scope Audit Card */}
      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Scope Audit Guard
          </span>
          <span
            className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
              evidenceTone(scopeStatus)
            }`}
          >
            {scopeStatus}
          </span>
        </div>

        <div className="text-xs space-y-1.5 text-slate-400">
          <div>
            <span className="text-slate-500">Allowed Paths: </span>
            <span className="font-mono text-slate-300">
              {evidence.scope.allowedPaths.join(", ") || "None"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Changed Paths: </span>
            <span className="font-mono text-slate-300">
              {evidence.scope.changedPaths.join(", ") || "None"}
            </span>
          </div>
          {evidence.scope.outOfScopePaths.length > 0 && (
            <div>
              <span className="text-rose-400">Out of Scope: </span>
              <span className="font-mono text-rose-300">
                {evidence.scope.outOfScopePaths.join(", ")}
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
              {results.filter((r) => r.status === "PASS").length}/{results.length} Passed
            </span>
          )}
        </div>

        {results.length > 0 ? (
          <div className="space-y-2.5">
            {results.map((v: RunEvidenceVerificationResult) => {
              const isExpanded = !!expandedLogs[v.command]
              const hasOutput = Boolean(v.stdoutTail?.trim() || v.stderrTail?.trim())

              return (
                <div
                  key={v.command}
                  className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden transition-all"
                >
                  {/* Script Header Bar */}
                  <div
                    onClick={() => hasOutput && toggleLog(v.command)}
                    className={`p-3 flex items-center justify-between text-xs transition-colors ${
                      hasOutput ? "cursor-pointer hover:bg-slate-800/60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {v.status === "PASS" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : v.status === "FAIL" ? (
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                      )}
                      <span className="font-mono text-slate-200 font-medium">{v.command}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                          evidenceTone(v.status)
                        }`}
                      >
                        {v.status === "PASS" ? "EXIT 0 (PASS)" : `EXIT ${v.exitCode ?? "?"} (${v.status})`}
                      </span>

                      {hasOutput && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLog(v.command)
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
                              onClick={() => handleCopy(`${v.command}-stderr`, v.stderrTail || "")}
                              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                            >
                              {copiedKey === `${v.command}-stderr` ? (
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
                              onClick={() => handleCopy(`${v.command}-stdout`, v.stdoutTail || "")}
                              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                            >
                              {copiedKey === `${v.command}-stdout` ? (
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

      {/* Transactional finalization evidence */}
      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <GitCommit className="h-4 w-4 text-cyan-400" />
            Acceptance & Finalization
          </span>
          <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
            evidence.finalization.status === "APPLIED"
              ? "bg-emerald-500/15 text-emerald-300"
              : evidence.finalization.status === "FAILED"
                ? "bg-rose-500/15 text-rose-300"
                : "bg-amber-500/15 text-amber-300"
          }`}>
            {evidence.finalization.status}
          </span>
        </div>

        <div className="grid gap-2 text-xs text-slate-400 md:grid-cols-2">
          <div className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-slate-500" />
            <span>Human acceptance: </span>
            <span className="font-mono text-slate-200">
              {evidence.finalization.humanApproved
                ? `${evidence.finalization.acceptedBy || "unknown"}${evidence.finalization.acceptedAt ? ` • ${new Date(evidence.finalization.acceptedAt).toLocaleString()}` : ""}`
                : "UNAVAILABLE"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Git: </span>
            <span className="font-mono text-slate-200">{evidence.finalization.git.status}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-slate-500">Applied Paths: </span>
            <span className="font-mono text-slate-200">
              {evidence.finalization.appliedPaths.join(", ") || "None"}
            </span>
          </div>
          {evidence.finalization.git.commitHash && (
            <div className="md:col-span-2">
              <span className="text-slate-500">Commit: </span>
              <span className="font-mono text-cyan-300">{evidence.finalization.git.commitHash}</span>
            </div>
          )}
          <div>
            <span className="text-slate-500">Post-apply gates: </span>
            <span className={`font-mono ${
              evidence.finalization.postApplyVerification.status === "PASS"
                ? "text-emerald-300"
                : evidence.finalization.postApplyVerification.status === "FAIL"
                  ? "text-rose-300"
                  : "text-amber-300"
            }`}>
              {evidence.finalization.postApplyVerification.status}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Workspace: </span>
            <span className="font-mono text-slate-200">{evidence.finalization.workspaceState || "UNAVAILABLE"}</span>
          </div>
          {evidence.finalization.artifactPath && (
            <div className="md:col-span-2 flex items-center gap-1.5">
              <Archive className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-500">Artifact: </span>
              <span className="font-mono text-slate-200">{evidence.finalization.artifactPath}</span>
            </div>
          )}
        </div>
      </div>

      {evidence.integrity.status === "WARNING" && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Evidence integrity warning
          </div>
          {evidence.integrity.warnings.map((warning) => <p key={warning}>{warning}</p>)}
        </div>
      )}

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
