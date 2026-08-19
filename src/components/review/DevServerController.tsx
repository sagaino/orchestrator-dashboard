import React, { useEffect, useState } from "react"
import {
  Play,
  Square,
  ExternalLink,
  RefreshCw,
  Terminal,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react"
import { OrchestratorApi, type DevServerStatus } from "@/services/orchestrator"
import { toast } from "@/components/ui/toast"

interface DevServerControllerProps {
  runId: string
  workspaceExists: boolean
}

export const DevServerController: React.FC<DevServerControllerProps> = ({ runId, workspaceExists }) => {
  const [status, setStatus] = useState<DevServerStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [showIframe, setShowIframe] = useState(false)

  const checkStatus = async () => {
    try {
      const data = await OrchestratorApi.getDevServerStatus(runId)
      setStatus(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [runId])

  const handleStart = async () => {
    try {
      setLoading(true)
      const data = await OrchestratorApi.startDevServer(runId)
      setStatus(data)
      toast.add({
        title: "Dev Server Dimulai",
        description: `Visual QA dev server aktif pada port ${data.port || "default"}`,
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Menjalankan Dev Server",
        description: errorMessage,
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    try {
      setLoading(true)
      await OrchestratorApi.stopDevServer(runId)
      checkStatus()
      toast.add({
        title: "Dev Server Dihentikan",
        description: "Dev server berhasil dimatikan.",
        type: "info",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Menghentikan Dev Server",
        description: errorMessage,
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }


  if (!workspaceExists) {
    return (
      <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-500 space-y-2">
        <Globe className="h-8 w-8 mx-auto text-slate-600 mb-2" />
        <p className="text-slate-300 font-medium">Isolated worktree tidak aktif.</p>
        <p className="text-slate-500">Dev server hanya dapat dijalankan saat task dalam status review dengan workspace aktif.</p>
      </div>
    )
  }

  const isRunning = status?.running && status?.status === "RUNNING"
  const isStarting = status?.status === "STARTING"

  return (
    <div className="space-y-5">
      {/* Control Card */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Globe className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">Visual QA Dev Server</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase ${
                  isRunning
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : isStarting
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {status?.status || "STOPPED"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Jalankan dev server terisolasi pada worktree review ini untuk inspeksi visual sebelum approval.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isRunning ? (
              <button
                onClick={handleStart}
                disabled={loading || isStarting}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-600/20 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {isStarting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Booting Server...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Start Dev Server</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleStop}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-rose-600/20 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Square className="h-3.5 w-3.5 fill-white" />
                <span>Stop Server</span>
              </button>
            )}
          </div>
        </div>

        {/* Server Active Details & Actions */}
        {isRunning && status?.url && (
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 font-mono">
              <span className="text-slate-400">Preview URL:</span>
              <a
                href={status.url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 font-semibold hover:underline flex items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                <span>{status.url}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-slate-500 font-sans">| Port: {status.port}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowIframe(!showIframe)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {showIframe ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showIframe ? "Hide Embedded Preview" : "Show Embedded Preview"}</span>
              </button>

              <a
                href={status.url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>Open in New Window</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Embedded Iframe Preview */}
        {isRunning && status?.url && showIframe && (
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-2xl">
            <div className="h-9 bg-slate-800/80 px-4 flex items-center justify-between border-b border-slate-700 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-[11px] text-slate-300 ml-2">{status.url}</span>
              </div>
            </div>
            <iframe src={status.url} className="w-full h-[450px] bg-white border-0" title="Worktree App Preview" />
          </div>
        )}

        {/* Terminal Log Stream */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-slate-500" />
              Dev Server Console Logs
            </span>
            <span className="font-mono text-[10px] text-slate-500">{(Array.isArray(status?.logTail) ? status.logTail.length : 0)} lines</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 h-44 overflow-y-auto space-y-1">
            {!Array.isArray(status?.logTail) || status.logTail.length === 0 ? (
              <span className="text-slate-600 italic">Dev server belum dimulai atau tidak ada log.</span>
            ) : (
              status.logTail.map((line, i) => (
                <div key={i} className="leading-relaxed break-all">
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
