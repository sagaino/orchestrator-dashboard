import React, { useEffect, useState } from "react"
import {
  History,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Code2,
  Check,
  X,
  RotateCcw,
  Wrench,
  Sparkles,
  ShieldCheck,
  Terminal,
  Clock,
  RefreshCw,
  Search,
  Filter,
  FileCode,
  Globe,
  BookOpen,
} from "lucide-react"
import { type RunManifest, type RunDiffData } from "@/services/orchestrator"
import { DiffViewer } from "@/components/diff/DiffViewer"
import { DevServerController } from "@/components/review/DevServerController"
import { 
  useRuns, 
  useRunDiff, 
  useAcceptRun, 
  useRejectRun, 
  useRequestChanges, 
  useStartRun,
  usePreviewRun,
  useRecoverRun,
  useRetryRun
} from "@/hooks/use-orchestrator"

export const RunsPage: React.FC = () => {
  const { data: runs = [], isLoading: runsLoading, refetch: refetchRuns } = useRuns()
  
  const [filterState, setFilterState] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRun, setSelectedRun] = useState<RunManifest | null>(null)
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "DIFF" | "QA" | "RETROSPECTIVE">("OVERVIEW")
  const [revisionModalOpen, setRevisionModalOpen] = useState(false)
  const [revisionReason, setRevisionReason] = useState("")

  const { data: diffData, isLoading: diffLoading } = useRunDiff(
    (selectedRun && (activeTab === "DIFF" || activeTab === "QA")) ? selectedRun.runId : null
  )

  const { mutateAsync: acceptRun, isPending: acceptPending } = useAcceptRun()
  const { mutateAsync: rejectRun, isPending: rejectPending } = useRejectRun()
  const { mutateAsync: requestChanges, isPending: changesPending } = useRequestChanges()
  const { mutateAsync: startRun, isPending: startPending } = useStartRun()
  const { mutateAsync: previewRun, isPending: previewPending } = usePreviewRun()
  const { mutateAsync: recoverRun, isPending: recoverPending } = useRecoverRun()
  const { mutateAsync: retryRun, isPending: retryPending } = useRetryRun()

  const actionLoading = acceptPending || rejectPending || changesPending || startPending || previewPending || recoverPending || retryPending


  // Keep selectedRun in sync if runs change
  useEffect(() => {
    if (!selectedRun && runs.length > 0) {
      setSelectedRun(runs[0])
    } else if (selectedRun && runs.length > 0) {
      const updated = runs.find((r) => r.runId === selectedRun.runId)
      if (updated && updated !== selectedRun) {
        setSelectedRun(updated)
      }
    }
  }, [runs, selectedRun])

  const filteredRuns = runs.filter((r) => {
    if ((r.state as string) === "SUPERSEDED") return false

    const matchesFilter =
      filterState === "ALL" ||
      (filterState === "REVIEW" && (r.state === "REVIEW" || r.state === "RETROSPECTIVE")) ||
      (filterState === "ACTIVE" && ["PENDING_APPROVAL", "APPROVED", "CLAIMING", "CLAIMED", "RUNNING", "EXECUTING", "VERIFYING", "SCOPE_AUDIT"].includes(r.state)) ||
      (filterState === "DONE" && r.state === "DONE") ||
      (filterState === "FAILED" && r.state === "FAILED")

    const matchesSearch =
      r.task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.project.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.runId.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  // Review Actions
  const handleStart = async (runId: string) => {
    try {
      await startRun({ runId })
      alert("Run berhasil di-approve dan mulai dieksekusi!")
    } catch (err: any) {
      alert(`Gagal menjalankan run: ${err.message}`)
    }
  }

  const handlePreview = async (runId: string) => {
    try {
      const res = await previewRun(runId)
      alert(`Workspace dibuka di VS Code:\n${res?.workspacePath || "Berhasil dibuka di VS Code."}`)
    } catch (err: any) {
      alert(`Gagal preview: ${err.message}`)
    }
  }

  const handleAccept = async (runId: string) => {
    if (!confirm("Apakah Anda yakin ingin menyetujui run ini? Perubahan akan diaplikasikan ke branch utama dan disinkronkan ke Wiki.")) return
    try {
      await acceptRun({ runId, approvedBy: "user" })
      alert("Run berhasil di-accept dan disinkronkan!")
    } catch (err: any) {
      alert(`Gagal accept: ${err.message}`)
    }
  }

  const handleReject = async (runId: string) => {
    const reason = prompt("Masukkan alasan penolakan run:", "Rejected by user")
    if (reason === null) return
    try {
      await rejectRun({ runId, reason })
      alert("Run berhasil ditolak dan worktree dibersihkan.")
    } catch (err: any) {
      alert(`Gagal reject: ${err.message}`)
    }
  }

  const handleRequestChangesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRun || !revisionReason.trim()) return
    try {
      await requestChanges({ runId: selectedRun.runId, reason: revisionReason.trim() })
      setRevisionModalOpen(false)
      setRevisionReason("")
      alert("Revisi berhasil dikirim ke agent di worktree terisolasi!")
    } catch (err: any) {
      alert(`Gagal mengirim revisi: ${err.message}`)
    }
  }

  const handleRecover = async (runId: string) => {
    try {
      await recoverRun(runId)
      alert("Recovery berhasil dijalankan!")
    } catch (err: any) {
      alert(`Gagal recover: ${err.message}`)
    }
  }

  const handleRetry = async (runId: string) => {
    try {
      await retryRun(runId)
      alert("Task berhasil didaftarkan ulang ke antrean!")
    } catch (err: any) {
      alert(`Gagal retry: ${err.message}`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Runs & Human Review Center</h1>
          <p className="text-sm text-slate-400">
            Audit eksekusi agent, periksa diff kode in-browser, jalankan visual QA dev server, dan kelola approval.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Run ID, Task, atau Project..."
              className="pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>

          <button
            onClick={() => refetchRuns && refetchRuns()}
            disabled={runsLoading}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer outline-none focus:outline-none"
          >
            <RefreshCw className={`h-4 w-4 ${runsLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {["ALL", "REVIEW", "ACTIVE", "DONE", "FAILED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilterState(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer outline-none focus:outline-none focus-visible:outline-none ${
              filterState === f
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                : "text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 2-Column Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Runs List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredRuns.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
              Tidak ada data Run yang sesuai kriteria.
            </div>
          ) : (
            filteredRuns.map((r) => {
              const isSelected = selectedRun?.runId === r.runId
              const isReview = r.state === "REVIEW" || r.state === "RETROSPECTIVE"
              const isDone = r.state === "DONE"
              const isFailed = r.state === "FAILED"
              return (
                <div
                  key={r.runId}
                  onClick={() => setSelectedRun(r)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{r.task.id}</span>
                      <span className="text-xs font-mono text-slate-400">({r.project.id})</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase ${
                        isReview
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                          : isDone
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : isFailed
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      }`}
                    >
                      {r.state}
                    </span>
                  </div>

                  <p className="font-mono text-[11px] text-slate-500 truncate">{r.runId}</p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Model: {r.telemetry?.model || "gemini-3.7-flash-high"}</span>
                    <span>{r.execution?.completedAt ? new Date(r.execution.completedAt).toLocaleTimeString() : "-"}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right: Selected Run Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedRun ? (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
              {/* Header Details */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-white">{selectedRun.task.id}</h2>
                    <span className="px-2.5 py-0.5 rounded-full font-mono text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
                      {selectedRun.state}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-slate-400 mt-1">{selectedRun.runId}</p>
                </div>

                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
                  {selectedRun.project.id}
                </span>
              </div>

              {/* Action Toolbar for Human Review */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Human Review Actions
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">allow_self_accept: false</span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {/* Preview in VS Code */}
                  <button
                    onClick={() => handlePreview(selectedRun.runId)}
                    disabled={actionLoading}
                    className="px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus:outline-none"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Preview in VS Code</span>
                  </button>

                  {/* Start/Approve if PENDING_APPROVAL or APPROVED */}
                  {(selectedRun.state === "PENDING_APPROVAL" || selectedRun.state === "APPROVED") && (
                    <button
                      onClick={() => handleStart(selectedRun.runId)}
                      disabled={actionLoading}
                      className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus:outline-none"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Approve & Execute</span>
                    </button>
                  )}

                  {/* Review Actions if state == REVIEW or RETROSPECTIVE */}
                  {(selectedRun.state === "REVIEW" || selectedRun.state === "RETROSPECTIVE") && (
                    <>
                      <button
                        onClick={() => setRevisionModalOpen(true)}
                        disabled={actionLoading}
                        className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus:outline-none"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Request Changes</span>
                      </button>

                      <button
                        onClick={() => handleAccept(selectedRun.runId)}
                        disabled={actionLoading}
                        className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus:outline-none"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Accept & Sync Wiki</span>
                      </button>

                      <button
                        onClick={() => handleReject(selectedRun.runId)}
                        disabled={actionLoading}
                        className="px-3.5 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus:outline-none"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {/* Failed actions */}
                  {selectedRun.state === "FAILED" && (
                    <>
                      <button
                        onClick={() => handleRecover(selectedRun.runId)}
                        disabled={actionLoading}
                        className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus:outline-none"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        <span>Auto Recover</span>
                      </button>

                      <button
                        onClick={() => handleRetry(selectedRun.runId)}
                        disabled={actionLoading}
                        className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus:outline-none"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Retry Task</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Inspector Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTab("OVERVIEW")}
                  className={`pb-2.5 font-semibold px-2 border-b-2 transition-all cursor-pointer outline-none focus:outline-none focus-visible:outline-none ${
                    activeTab === "OVERVIEW"
                      ? "text-indigo-400 border-indigo-500"
                      : "text-slate-400 border-transparent hover:text-slate-200"
                  }`}
                >
                  Overview & Verification
                </button>
                <button
                  onClick={() => setActiveTab("DIFF")}
                  className={`pb-2.5 font-semibold px-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 outline-none focus:outline-none focus-visible:outline-none ${
                    activeTab === "DIFF"
                      ? "text-indigo-400 border-indigo-500"
                      : "text-slate-400 border-transparent hover:text-slate-200"
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>Code Changes (Diff)</span>
                </button>
                <button
                  onClick={() => setActiveTab("QA")}
                  className={`pb-2.5 font-semibold px-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 outline-none focus:outline-none focus-visible:outline-none ${
                    activeTab === "QA"
                      ? "text-indigo-400 border-indigo-500"
                      : "text-slate-400 border-transparent hover:text-slate-200"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Visual QA Dev Server</span>
                </button>
              </div>

              {/* Tab 1: Overview & Verification */}
              {activeTab === "OVERVIEW" && (
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

                  {/* Verification Results */}
                  <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="h-4 w-4 text-indigo-400" />
                      Verification & Test Gates
                    </span>

                    {selectedRun.execution?.verification?.results ? (
                      <div className="space-y-2">
                        {selectedRun.execution.verification.results.map((v: any) => (
                          <div
                            key={v.script}
                            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <span className="font-mono text-slate-200">{v.script}</span>
                            <span
                              className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                                v.passed ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                              }`}
                            >
                              {v.passed ? "EXIT 0 (PASS)" : `EXIT ${v.exitCode} (FAIL)`}
                            </span>
                          </div>
                        ))}
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
                        <span className="text-slate-200 font-mono">{selectedRun.telemetry.model}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Duration: </span>
                        <span className="text-slate-200 font-mono">
                          {selectedRun.telemetry.durationMs ? `${Math.round(selectedRun.telemetry.durationMs / 1000)}s` : "-"}
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
              )}

              {/* Tab 2: Code Changes & Diff */}
              {activeTab === "DIFF" && (
                <div className="space-y-4">
                  <DiffViewer diffData={diffData ?? null} loading={diffLoading} />
                </div>
              )}

              {/* Tab 3: Visual QA Dev Server */}
              {activeTab === "QA" && (
                <div className="space-y-4">
                  <DevServerController
                    runId={selectedRun.runId}
                    workspaceExists={diffData?.workspaceExists ?? true}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
              Pilih sebuah Run untuk melihat detail inspeksi.
            </div>
          )}
        </div>
      </div>

      {/* Request Changes Modal */}
      {revisionModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Request Changes (Revisi Agent)</h3>
            <p className="text-xs text-slate-400">
              Instruksi revisi ini akan dikirimkan ke agent pada worktree terisolasi yang sama untuk diperbaiki ulang.
            </p>

            <form onSubmit={handleRequestChangesSubmit} className="space-y-4">
              <textarea
                rows={5}
                required
                value={revisionReason}
                onChange={(e) => setRevisionReason(e.target.value)}
                placeholder="Tuliskan poin-poin yang perlu direvisi..."
                className="w-full px-3.5 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRevisionModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer outline-none focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !revisionReason.trim()}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-medium text-white transition-colors cursor-pointer outline-none focus:outline-none"
                >
                  {actionLoading ? "Submitting..." : "Send Revision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
