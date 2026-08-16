import React, { useEffect, useState } from "react"
import {
  Play,
  FileText,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Eye,
  Terminal,
} from "lucide-react"
import { OrchestratorApi, type ProjectInfo, type DaemonStatus } from "@/services/orchestrator"
import { subscribeToEvents } from "@/services/events"

export const TasksPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectInfo[]>([])
  const [selectedProject, setSelectedProject] = useState("orchestrator-dashboard")
  const [prompt, setPrompt] = useState("")
  const [autoStart, setAutoStart] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [contextPreview, setContextPreview] = useState<any | null>(null)
  const [planPreview, setPlanPreview] = useState<any | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [daemon, setDaemon] = useState<DaemonStatus | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const loadData = async () => {
    try {
      const [projList, daemonData] = await Promise.all([
        OrchestratorApi.getProjects(),
        OrchestratorApi.getDaemonStatus(),
      ])
      setProjects(projList)
      setDaemon(daemonData)
      if (projList.length > 0 && !selectedProject) {
        setSelectedProject(projList[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
    const unsubscribe = subscribeToEvents(() => {
      loadData()
    })
    return () => unsubscribe()
  }, [])

  const handlePreviewContext = async () => {
    if (!selectedProject) return
    try {
      setPreviewLoading(true)
      setContextPreview(null)
      setPlanPreview(null)
      // Pick first task or preview
      const context = await OrchestratorApi.getTaskContext(selectedProject, "task-preview")
      setContextPreview(context)
    } catch (err: any) {
      alert(`Gagal mengambil konteks: ${err.message}`)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || !selectedProject) return
    try {
      setSubmitting(true)
      setStatusMessage(null)
      const res = await OrchestratorApi.requestTask({
        project: selectedProject,
        request: prompt.trim(),
        autoStart,
      })
      setStatusMessage({
        type: "success",
        text: `Task canonical berhasil dibuat: ${res.task?.id || "Task"} (${res.autoStart ? "Otomatis diantrekan" : "Tersimpan di Backlog"}).`,
      })
      setPrompt("")
      loadData()
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: `Gagal membuat task: ${err.message}`,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const queueJobs = daemon?.queue.latestJobs || []

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Task Intake & Live Execution</h1>
        <p className="text-sm text-slate-400">
          Kirim instruksi bahasa alami. Orchestrator akan menyusun spesifikasi, memverifikasi readiness gate, dan mengorkestrasi eksekusi agent.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Task Intake (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              Canonical Task Intake Form
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Repository / Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} ({p.repository})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Natural Language Instruction
                </label>
                <textarea
                  rows={6}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Deskripsikan fitur, refactor, atau perbaikan bug yang diinginkan secara spesifik..."
                  className="w-full px-3.5 py-3 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="autoStart"
                    checked={autoStart}
                    onChange={(e) => setAutoStart(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="autoStart" className="text-xs text-slate-300">
                    <span className="font-medium block text-slate-200">Auto-Start Execution</span>
                    Langsung klaim dan jalankan di isolated git worktree setelah lolos readiness gate
                  </label>
                </div>
              </div>

              {statusMessage && (
                <div
                  className={`p-3.5 rounded-lg text-xs flex items-center gap-2.5 ${
                    statusMessage.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                  }`}
                >
                  {statusMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !prompt.trim()}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-white" />
                      <span>Submit & Queue Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Status: Live Queue & Pipeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Cpu className="h-5 w-5 text-emerald-400" />
                Live Job Queue & Worker Pool
              </h2>
              <button
                onClick={loadData}
                className="text-xs text-slate-400 hover:text-slate-200 p-1 transition-colors"
                title="Refresh queue"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {queueJobs.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-dashed border-slate-800 text-slate-500 text-xs">
                Tidak ada background job yang sedang aktif.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {queueJobs.map((job) => {
                  const isRunning = job.state === "RUNNING"
                  const isDone = job.state === "DONE"
                  const isFailed = job.state === "FAILED"
                  return (
                    <div
                      key={job.jobId}
                      className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100">{job.taskId}</span>
                          <span className="font-mono text-[10px] text-slate-400">({job.project})</span>
                        </div>
                        <p className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]">{job.jobId}</p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold uppercase ${
                          isRunning
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse"
                            : isDone
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : isFailed
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {job.state}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
