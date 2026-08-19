import React, { useState, useEffect } from "react"
import { useSSEEvents } from "@/providers/EventsProvider"
import { Sparkles, Loader2, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp, Folder } from "lucide-react"

interface HarvestProgressState {
  harvestId: string
  repositoryPath: string
  domain: string
  mode: "normal" | "pro"
  pass?: number
  totalPasses?: number
  label?: string
  progress: number
  foundCount?: number
  status: "RUNNING" | "COMPLETED" | "FAILED"
  error?: string
}

export const FloatingHarvestProgress: React.FC = () => {
  const { lastEvent } = useSSEEvents()
  const [harvestState, setHarvestState] = useState<HarvestProgressState | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    if (!lastEvent) return

    switch (lastEvent.event) {
      case "KNOWLEDGE_HARVEST_STARTED": {
        const data = lastEvent.data || {}
        setHarvestState({
          harvestId: data.harvestId || "",
          repositoryPath: data.repositoryPath || "",
          domain: data.domain || "backend",
          mode: data.mode || "normal",
          progress: 10,
          label: data.mode === "pro" ? "Memulai multi-pass deep scan..." : "Memindai arsitektur codebase...",
          status: "RUNNING",
          foundCount: 0,
        })
        setIsMinimized(false)
        break
      }

      case "KNOWLEDGE_HARVEST_PROGRESS": {
        const data = lastEvent.data || {}
        setHarvestState((prev) => {
          if (!prev || prev.harvestId !== data.harvestId) {
            return {
              harvestId: data.harvestId || "",
              repositoryPath: data.repositoryPath || "",
              domain: data.domain || "backend",
              mode: data.mode || "normal",
              pass: data.pass,
              totalPasses: data.totalPasses,
              label: data.label || "Menganalisis pola...",
              progress: data.progress || 50,
              foundCount: data.foundCount || 0,
              status: "RUNNING",
            }
          }
          return {
            ...prev,
            pass: data.pass,
            totalPasses: data.totalPasses,
            label: data.label || prev.label,
            progress: data.progress || prev.progress,
            foundCount: data.foundCount !== undefined ? data.foundCount : prev.foundCount,
            status: "RUNNING",
          }
        })
        break
      }

      case "KNOWLEDGE_HARVESTED": {
        const data = lastEvent.data || {}
        setHarvestState((prev) => {
          const count = data.count || data.harvested?.length || prev?.foundCount || 0
          return {
            harvestId: data.harvestId || prev?.harvestId || "",
            repositoryPath: data.repositoryPath || prev?.repositoryPath || "",
            domain: data.domain || prev?.domain || "",
            mode: data.mode || prev?.mode || "normal",
            progress: 100,
            label: `Selesai! ${count} pola arsitektur berhasil disimpan ke Wiki.`,
            status: "COMPLETED",
            foundCount: count,
          }
        })
        // Auto-dismiss completed state after 8 seconds
        setTimeout(() => {
          setHarvestState((curr) => (curr?.status === "COMPLETED" ? null : curr))
        }, 8000)
        break
      }

      case "KNOWLEDGE_HARVEST_FAILED": {
        const data = lastEvent.data || {}
        setHarvestState((prev) => ({
          harvestId: data.harvestId || prev?.harvestId || "",
          repositoryPath: data.repositoryPath || prev?.repositoryPath || "",
          domain: data.domain || prev?.domain || "",
          mode: data.mode || prev?.mode || "normal",
          progress: 100,
          label: "Pemindaian arsitektur gagal.",
          status: "FAILED",
          error: data.error || "Terjadi kesalahan pada harvester.",
        }))
        break
      }
    }
  }, [lastEvent])

  if (!harvestState) return null

  const repoName = harvestState.repositoryPath.split("/").filter(Boolean).pop() || harvestState.repositoryPath

  return (
    <aside aria-label="Status Pemindaian Arsitektur" className="fixed bottom-5 right-5 z-50 w-80 sm:w-96 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-slate-100 overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          {harvestState.status === "RUNNING" && (
            <Loader2 className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />
          )}
          {harvestState.status === "COMPLETED" && (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          {harvestState.status === "FAILED" && (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold truncate text-white">
            {harvestState.status === "RUNNING" && `Harvesting ${repoName}`}
            {harvestState.status === "COMPLETED" && `Harvest Sukses: ${repoName}`}
            {harvestState.status === "FAILED" && `Harvest Gagal: ${repoName}`}
          </span>
          <span
            className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
              harvestState.mode === "pro"
                ? "bg-amber-950/90 text-amber-300 border-amber-800/60"
                : "bg-indigo-950/90 text-indigo-300 border-indigo-800/60"
            }`}
          >
            {harvestState.mode === "pro" ? "PRO" : "NORMAL"}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setHarvestState(null)}
            className="p-1 rounded text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
            title="Tutup"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Body Content (Expanded) */}
      {!isMinimized && (
        <div className="p-3.5 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 truncate max-w-[70%]">
              <Folder className="h-3 w-3 text-indigo-400 shrink-0" />
              <span className="font-mono text-slate-300 truncate">{harvestState.repositoryPath}</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400 shrink-0">
              Domain: {harvestState.domain}
            </span>
          </div>

          {/* Label / Sub-message */}
          <div className="text-xs text-slate-200 leading-snug">
            {harvestState.label}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>
                {harvestState.pass && harvestState.totalPasses
                  ? `Batch ${harvestState.pass}/${harvestState.totalPasses}`
                  : harvestState.status === "RUNNING"
                  ? "Pemindaian..."
                  : harvestState.status}
              </span>
              <span>{harvestState.progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  harvestState.status === "FAILED"
                    ? "bg-rose-500"
                    : harvestState.status === "COMPLETED"
                    ? "bg-emerald-500"
                    : harvestState.mode === "pro"
                    ? "bg-amber-400"
                    : "bg-indigo-500"
                }`}
                style={{ width: `${harvestState.progress}%` }}
              />
            </div>
          </div>

          {/* Error Message Details if failed */}
          {harvestState.status === "FAILED" && harvestState.error && (
            <div className="p-2 rounded bg-rose-950/60 border border-rose-900 text-rose-300 text-[11px] leading-relaxed">
              {harvestState.error}
            </div>
          )}

          {/* Found Patterns Counter */}
          {harvestState.status === "RUNNING" && (harvestState.foundCount ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>{harvestState.foundCount} pola berhasil diidentifikasi sejauh ini</span>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
