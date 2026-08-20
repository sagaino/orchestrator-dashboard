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
  Image as ImageIcon,
  Columns,
  Layers,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
} from "lucide-react"
import { OrchestratorApi, type DevServerStatus } from "@/services/orchestrator"
import { toast } from "@/components/ui/toast"

interface DevServerControllerProps {
  runId: string
  workspaceExists: boolean
  sources?: string[]
}

type ViewMode = "SPLIT" | "WEB_ONLY" | "OVERLAY"
type ViewportSize = "DESKTOP" | "TABLET" | "MOBILE"

export const DevServerController: React.FC<DevServerControllerProps> = ({
  runId,
  workspaceExists,
  sources = [],
}) => {
  const [status, setStatus] = useState<DevServerStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [showIframe, setShowIframe] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("SPLIT")
  const [viewport, setViewport] = useState<ViewportSize>("DESKTOP")
  const [overlayOpacity, setOverlayOpacity] = useState(50)
  const [selectedMockupIndex, setSelectedMockupIndex] = useState(0)

  // Find mockup images in sources array
  const mockupSources = (sources || []).filter(
    (s) => s.startsWith("03-Sources/assets/ui-mockups/") || /\.(png|jpg|jpeg|webp|svg)$/i.test(s)
  )
  const activeMockup = mockupSources[selectedMockupIndex] || mockupSources[0] || null

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
      setShowIframe(true)
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

  // Viewport widths
  const viewportWidths = {
    DESKTOP: "w-full",
    TABLET: "max-w-[768px] mx-auto",
    MOBILE: "max-w-[375px] mx-auto",
  }

  return (
    <div className="space-y-5">
      {/* Control Card */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Globe className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">Visual QA & Slicing Inspector</h3>
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
              Bandingkan live review preview berdampingan dengan Figma mockup desain untuk validasi akurasi pixel-perfect.
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

        {/* Active Controls & Toolbar */}
        {isRunning && status?.url && (
          <div className="space-y-3">
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

              {/* Viewport Size Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewport("DESKTOP")}
                  className={`p-1.5 rounded transition-colors ${
                    viewport === "DESKTOP" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewport("TABLET")}
                  className={`p-1.5 rounded transition-colors ${
                    viewport === "TABLET" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewport("MOBILE")}
                  className={`p-1.5 rounded transition-colors ${
                    viewport === "MOBILE" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-2">
                {activeMockup && (
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setViewMode("SPLIT")}
                      className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        viewMode === "SPLIT" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Columns className="h-3 w-3" />
                      <span>Side-by-Side</span>
                    </button>
                    <button
                      onClick={() => setViewMode("OVERLAY")}
                      className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        viewMode === "OVERLAY" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Layers className="h-3 w-3" />
                      <span>Pixel Overlay</span>
                    </button>
                    <button
                      onClick={() => setViewMode("WEB_ONLY")}
                      className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        viewMode === "WEB_ONLY" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Globe className="h-3 w-3" />
                      <span>Web Only</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowIframe(!showIframe)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {showIframe ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showIframe ? "Hide" : "Show"}</span>
                </button>
              </div>
            </div>

            {/* Overlay Slider if in Overlay Mode */}
            {viewMode === "OVERLAY" && activeMockup && showIframe && (
              <div className="p-3 rounded-lg bg-slate-950/60 border border-indigo-500/30 flex items-center justify-between gap-4 text-xs">
                <span className="text-indigo-300 font-medium flex items-center gap-1.5">
                  <Layers className="h-4 w-4" />
                  Mockup Overlay Opacity: {overlayOpacity}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  className="w-48 accent-indigo-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* Visual Inspection Area */}
        {isRunning && status?.url && showIframe && (
          <div className="space-y-3">
            {/* Mode 1: SIDE-BY-SIDE SPLIT VIEW */}
            {viewMode === "SPLIT" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Figma / Screenshot Mockup */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex flex-col h-[520px]">
                  <div className="h-9 bg-slate-800/80 px-4 flex items-center justify-between border-b border-slate-700 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                      Figma UI Mockup Reference
                    </span>
                    {mockupSources.length > 1 && (
                      <select
                        value={selectedMockupIndex}
                        onChange={(e) => setSelectedMockupIndex(Number(e.target.value))}
                        className="bg-slate-900 text-[11px] text-slate-300 border border-slate-700 rounded px-2 py-0.5"
                      >
                        {mockupSources.map((s, idx) => (
                          <option key={idx} value={idx}>
                            Mockup #{idx + 1}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-900/40">
                    {activeMockup ? (
                      <img
                        src={`/api/assets/raw?path=${encodeURIComponent(activeMockup)}`}
                        alt="UI Mockup Reference"
                        className="max-h-full max-w-full object-contain rounded border border-slate-800 shadow-md"
                      />
                    ) : (
                      <div className="text-center text-slate-500 text-xs">
                        <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-40" />
                        <span>Tidak ada mockup visual terlampir pada task ini.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Live Web Preview */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex flex-col h-[520px]">
                  <div className="h-9 bg-slate-800/80 px-4 flex items-center justify-between border-b border-slate-700 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                      <span className="font-mono text-[11px] text-slate-300 ml-2">{status.url}</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium">Live Dev Server</span>
                  </div>
                  <div className="flex-1 overflow-auto bg-slate-900/30 p-1 flex items-center justify-center">
                    <div className={`h-full transition-all ${viewportWidths[viewport]}`}>
                      <iframe src={status.url} className="w-full h-full bg-white border-0 rounded" title="Worktree App Preview" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: PIXEL OVERLAY VIEW */}
            {viewMode === "OVERLAY" && (
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-2xl">
                <div className="h-9 bg-slate-800/80 px-4 flex items-center justify-between border-b border-slate-700 text-xs text-slate-400">
                  <span className="font-mono text-[11px] text-slate-300">
                    Pixel Overlay Comparison (Opacity: {overlayOpacity}%)
                  </span>
                </div>
                <div className="relative w-full h-[520px] bg-slate-900/50 flex items-center justify-center overflow-hidden">
                  {/* Underlay: Live Iframe */}
                  <div className={`absolute inset-0 z-0 h-full ${viewportWidths[viewport]}`}>
                    <iframe src={status.url} className="w-full h-full bg-white border-0" title="Worktree App Preview" />
                  </div>

                  {/* Overlay: Mockup Image */}
                  {activeMockup && (
                    <div
                      className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
                      style={{ opacity: overlayOpacity / 100 }}
                    >
                      <img
                        src={`/api/assets/raw?path=${encodeURIComponent(activeMockup)}`}
                        alt="Overlay Mockup"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 3: WEB ONLY VIEW */}
            {viewMode === "WEB_ONLY" && (
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-2xl">
                <div className="h-9 bg-slate-800/80 px-4 flex items-center justify-between border-b border-slate-700 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-mono text-[11px] text-slate-300 ml-2">{status.url}</span>
                  </div>
                </div>
                <div className="h-[520px] bg-slate-900/30 p-2 flex items-center justify-center">
                  <div className={`h-full transition-all ${viewportWidths[viewport]}`}>
                    <iframe src={status.url} className="w-full h-full bg-white border-0 rounded" title="Worktree App Preview" />
                  </div>
                </div>
              </div>
            )}
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

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 h-36 overflow-y-auto space-y-1">
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
