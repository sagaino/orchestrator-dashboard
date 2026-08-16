import React, { useEffect, useState } from "react"
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  FolderGit2,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Cpu,
  Clock,
  ShieldCheck,
} from "lucide-react"
import { OrchestratorApi, type DaemonStatus, type ProjectInfo, type RunManifest } from "@/services/orchestrator"
import { useNavigate } from "react-router-dom"

export const OverviewPage: React.FC = () => {
  const [daemon, setDaemon] = useState<DaemonStatus | null>(null)
  const [projects, setProjects] = useState<ProjectInfo[]>([])
  const [runs, setRuns] = useState<RunManifest[]>([])
  const [loading, setLoading] = useState(true)
  const [quickPrompt, setQuickPrompt] = useState("")
  const [selectedProject, setSelectedProject] = useState("orchestrator-dashboard")
  const [submitting, setSubmitting] = useState(false)
  const [quickSuccess, setQuickSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  const loadData = async () => {
    try {
      setLoading(true)
      const [daemonData, projectsData, runsData] = await Promise.all([
        OrchestratorApi.getDaemonStatus(),
        OrchestratorApi.getProjects(),
        OrchestratorApi.getRuns(),
      ])
      setDaemon(daemonData)
      setProjects(projectsData)
      setRuns(runsData)
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0].id)
      }
    } catch (err) {
      console.error("Failed to load overview data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickPrompt.trim() || !selectedProject) return
    try {
      setSubmitting(true)
      setQuickSuccess(null)
      const res = await OrchestratorApi.requestTask({
        project: selectedProject,
        request: quickPrompt.trim(),
        autoStart: true,
      })
      setQuickSuccess(`Task ${res.task?.id || "baru"} berhasil dibuat dan dimasukkan ke antrean!`)
      setQuickPrompt("")
      loadData()
    } catch (err: any) {
      alert(`Gagal mengirim task: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const reviewRuns = runs.filter((r) => r.state === "REVIEW")
  const activeRuns = runs.filter((r) => ["CLAIMED", "EXECUTING", "VERIFYING", "SCOPE_AUDIT"].includes(r.state))
  const completedRuns = runs.filter((r) => r.state === "DONE")

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/70 border border-indigo-500/20 p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs tracking-wider uppercase">
              <Sparkles className="h-4 w-4" />
              <span>Personal Autonomous Engineering System</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Executive Status Overview</h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Mengontrol dan memantau agen otonom, git worktrees terisolasi, gerbang verifikasi ketat, dan sinkronisasi pengetahuan Wiki secara real-time.
            </p>
          </div>

          <button
            onClick={() => navigate("/tasks")}
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Launch Task Intake</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Worker Slots</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {daemon ? `${daemon.parallel.activeWorkers} / ${daemon.parallel.maxWorkers}` : "0 / 2"}
            </span>
            <span className="text-xs text-slate-400">slots aktif</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Kapasitas paralel worker pool</p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Review Ready</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{reviewRuns.length}</span>
            <span className="text-xs text-slate-400">menunggu keputusan</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Human review gate approval</p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FolderGit2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{projects.length}</span>
            <span className="text-xs text-emerald-400 font-medium">terdaftar di Wiki</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Graphify & sandbox terkoneksi</p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks Done</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{completedRuns.length}</span>
            <span className="text-xs text-slate-400">tasks selesai</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Terverifikasi & tersinkronisasi Wiki</p>
        </div>
      </div>

      {/* Main Grid: Projects & Fast Intake */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Registered Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-indigo-400" />
              Registered Projects & Graphify Status
            </h2>
            <span className="text-xs font-mono text-slate-400">{projects.length} Repositories</span>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-semibold text-base text-white">{proj.id}</h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      agent: {proj.agent}
                    </span>
                    {proj.graphOutputExists ? (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                        Graphify Ready
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Graphify Needed
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-400 break-all">{proj.repository}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                    <span>Verification Defaults:</span>
                    {proj.verificationDefaults.length > 0 ? (
                      proj.verificationDefaults.map((v) => (
                        <span key={v} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          {v}
                        </span>
                      ))
                    ) : (
                      <span className="italic">none</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedProject(proj.id)
                      navigate("/tasks")
                    }}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Create Task</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Task Launcher */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Quick Task Intake
          </h2>

          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <p className="text-xs text-slate-400">
              Kirim instruksi fitur/bugfix dengan bahasa alami. Orchestrator akan merancang canonical task di Wiki dan menjalankannya secara otonom.
            </p>

            <form onSubmit={handleQuickSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Natural Language Prompt</label>
                <textarea
                  rows={4}
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="Contoh: Tambahkan tombol toggle dark mode pada Navbar dan pastikan typecheck lolos..."
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                />
              </div>

              {quickSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{quickSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !quickPrompt.trim()}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                {submitting ? (
                  <span>Planning & Queuing...</span>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    <span>Dispatch Task to Agent</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
