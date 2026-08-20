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
  MapPin,
  X,
  MessageSquarePlus,
  Trash2,
} from "lucide-react"
import { OrchestratorApi, type DevServerStatus } from "@/services/orchestrator"
import { toast } from "@/components/ui/toast"
import type { VisualAnnotation } from "@/pages/Runs/types"

interface DevServerControllerProps {
  runId: string
  workspaceExists: boolean
  sources?: string[]
  visualAnnotations?: VisualAnnotation[]
  onAddVisualAnnotation?: (annotation: { x: number; y: number; width?: number; height?: number; comment: string }) => void
  onRemoveVisualAnnotation?: (id: string) => void
}

type ViewMode = "SPLIT" | "WEB_ONLY" | "OVERLAY"
type ViewportSize = "DESKTOP" | "TABLET" | "MOBILE"

export const DevServerController: React.FC<DevServerControllerProps> = ({
  runId,
  workspaceExists,
  sources = [],
  visualAnnotations = [],
  onAddVisualAnnotation,
  onRemoveVisualAnnotation,
}) => {
  const [status, setStatus] = useState<DevServerStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [showIframe, setShowIframe] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewport, setViewport] = useState<ViewportSize>("DESKTOP")
  const [overlayOpacity, setOverlayOpacity] = useState(50)
  const [selectedMockupIndex, setSelectedMockupIndex] = useState(0)

  // Visual Pin & Area Box Annotation State
  const [isPinModeActive, setIsPinModeActive] = useState(false)
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number; width?: number; height?: number } | null>(null)
  const [pinComment, setPinComment] = useState("")
  const [activePinId, setActivePinId] = useState<string | null>(null)

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null)

  // Find mockup images in sources array
  const mockupSources = (sources || []).filter(
    (s) => s.startsWith("03-Sources/assets/ui-mockups/") || /\.(png|jpg|jpeg|webp|svg)$/i.test(s)
  )
  const activeMockup = mockupSources[selectedMockupIndex] || mockupSources[0] || null
  const [viewMode, setViewMode] = useState<ViewMode>(activeMockup ? "SPLIT" : "WEB_ONLY")

  // Auto-switch to WEB_ONLY if no mockup is present
  useEffect(() => {
    if (!activeMockup && viewMode === "SPLIT") {
      setViewMode("WEB_ONLY")
    }
  }, [activeMockup])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinModeActive || pendingPin) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setIsDragging(true)
    setDragStart({ x, y })
    setDragCurrent({ x, y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    setDragCurrent({ x, y })
  }

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragCurrent) return
    setIsDragging(false)

    const minX = Math.min(dragStart.x, dragCurrent.x)
    const minY = Math.min(dragStart.y, dragCurrent.y)
    const width = Math.abs(dragCurrent.x - dragStart.x)
    const height = Math.abs(dragCurrent.y - dragStart.y)

    // If dragged more than 2% in width or height, create an Area Box. Otherwise create a Point Pin.
    if (width > 2 && height > 2) {
      setPendingPin({
        x: minX,
        y: minY,
        width,
        height,
      })
    } else {
      setPendingPin({
        x: dragStart.x,
        y: dragStart.y,
      })
    }

    setDragStart(null)
    setDragCurrent(null)
    setPinComment("")
  }

  const handleSavePin = () => {
    if (!pendingPin || !pinComment.trim() || !onAddVisualAnnotation) return
    onAddVisualAnnotation({
      x: pendingPin.x,
      y: pendingPin.y,
      width: pendingPin.width,
      height: pendingPin.height,
      comment: pinComment.trim(),
    })
    setPendingPin(null)
    setPinComment("")
  }

  const handleCancelPin = () => {
    setPendingPin(null)
    setPinComment("")
  }

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

  const renderPinItem = (pin: VisualAnnotation, idx: number) => {
    const isOpened = activePinId === pin.id
    const isBox = pin.width && pin.height && (pin.width > 1 || pin.height > 1)

    if (isBox) {
      return (
        <div
          key={pin.id}
          style={{
            left: `${pin.x}%`,
            top: `${pin.y}%`,
            width: `${pin.width}%`,
            height: `${pin.height}%`,
          }}
          className={`absolute group pointer-events-auto z-20 border-2 rounded-md transition-all ${
            isOpened
              ? "border-rose-500 bg-rose-500/20 ring-2 ring-rose-500/50 shadow-lg"
              : "border-rose-500/80 bg-rose-500/10 hover:bg-rose-500/20 border-dashed"
          }`}
          onClick={(e) => {
            e.stopPropagation()
            setActivePinId(isOpened ? null : pin.id)
          }}
        >
          {/* Top-Left Badge for Box */}
          <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-rose-500/50 transition-transform hover:scale-110 cursor-pointer">
            {idx + 1}
          </div>

          {/* Popover / Tooltip */}
          <div
            className={`absolute left-0 bottom-full mb-1 z-40 w-64 p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs shadow-2xl space-y-1.5 transition-all ${
              isOpened ? "block ring-2 ring-rose-500/50" : "hidden group-hover:block"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
              <span className="font-semibold text-rose-300">
                Box #{idx + 1} ({Math.round(pin.width || 0)}% × {Math.round(pin.height || 0)}%)
              </span>
              {onRemoveVisualAnnotation && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (activePinId === pin.id) setActivePinId(null)
                    onRemoveVisualAnnotation(pin.id)
                  }}
                  className="text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Trash2 className="h-3 w-3" />
                  Hapus
                </button>
              )}
            </div>
            <p className="text-slate-200 leading-relaxed font-sans text-xs">{pin.comment}</p>
          </div>
        </div>
      )
    }

    return (
      <div
        key={pin.id}
        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        className="absolute -translate-x-1/2 -translate-y-1/2 group pointer-events-auto z-30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pin Badge with Click-to-Toggle and Bridge-Hover */}
        <button
          type="button"
          onClick={() => setActivePinId(isOpened ? null : pin.id)}
          className="h-6 w-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-rose-500/50 transition-transform hover:scale-110 cursor-pointer"
        >
          {idx + 1}
        </button>

        {/* Popover / Tooltip with invisible hover bridge (-bottom-3 pt-3) */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-1 z-40 w-60 p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs shadow-2xl space-y-1.5 transition-all ${
            isOpened ? "block ring-2 ring-rose-500/50" : "hidden group-hover:block"
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
            <span className="font-semibold text-rose-300">Pin #{idx + 1} ({Math.round(pin.x)}%, {Math.round(pin.y)}%)</span>
            {onRemoveVisualAnnotation && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (activePinId === pin.id) setActivePinId(null)
                  onRemoveVisualAnnotation(pin.id)
                }}
                className="text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Trash2 className="h-3 w-3" />
                Hapus
              </button>
            )}
          </div>
          <p className="text-slate-200 leading-relaxed font-sans text-xs">{pin.comment}</p>
        </div>
      </div>
    )
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
                {/* Visual Pin Feedback Mode Button */}
                <button
                  onClick={() => {
                    setIsPinModeActive(!isPinModeActive)
                    setPendingPin(null)
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all border shadow-sm ${
                    isPinModeActive
                      ? "bg-rose-600 border-rose-500 text-white animate-pulse"
                      : visualAnnotations.length > 0
                        ? "bg-rose-950/80 border-rose-500/40 text-rose-300 hover:bg-rose-900/60"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  }`}
                  title="Klik untuk mengaktifkan mode pin anotasi pada layar"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{isPinModeActive ? "Click on Preview to Pin" : "Add Visual Feedback"}</span>
                  {visualAnnotations.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {visualAnnotations.length}
                    </span>
                  )}
                </button>

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
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors border ${
                    isFullscreen
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  }`}
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>

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

            {/* Pin Mode Instruction Banner */}
            {isPinModeActive && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-center justify-between gap-3 text-xs text-rose-200">
                <div className="flex items-center gap-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>Mode Pin Feedback Aktif: Klik pada area mana saja di atas website untuk memberikan catatan revisi visual.</span>
                </div>
                <button
                  onClick={() => setIsPinModeActive(false)}
                  className="px-2 py-0.5 rounded bg-rose-900/60 hover:bg-rose-900 text-rose-200 text-[11px]"
                >
                  Selesai
                </button>
              </div>
            )}
          </div>
        )}

        {/* Visual Inspection Area */}
        {isRunning && status?.url && showIframe && (
          <div className={isFullscreen ? "fixed inset-4 z-50 bg-slate-950 p-4 rounded-2xl border border-indigo-500 shadow-2xl flex flex-col" : "space-y-3"}>
            {isFullscreen && (
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-400">Fullscreen Live Preview:</span>
                  <span className="text-indigo-400 font-semibold">{status.url}</span>
                </div>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium"
                >
                  Close Fullscreen
                </button>
              </div>
            )}

            {/* Mode 1: SIDE-BY-SIDE SPLIT VIEW (Only when Mockup is present) */}
            {viewMode === "SPLIT" && activeMockup && (
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${isFullscreen ? "flex-1 min-h-0 pt-3" : ""}`}>
                {/* Left: Figma / Screenshot Mockup */}
                <div className={`rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex flex-col ${isFullscreen ? "h-full" : "h-[680px]"}`}>
                  <div className="h-9 bg-slate-800/80 px-4 flex items-center justify-between border-b border-slate-700 text-xs text-slate-400 shrink-0">
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
                    <img
                      src={`/api/assets/raw?path=${encodeURIComponent(activeMockup)}`}
                      alt="UI Mockup Reference"
                      className="max-h-full max-w-full object-contain rounded border border-slate-800 shadow-md"
                    />
                  </div>
                </div>

                {/* Right: Live Web Preview */}
                <div className={`rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex flex-col ${isFullscreen ? "h-full" : "h-[680px]"}`}>
                  <div className="h-9 bg-slate-800/80 px-4 flex items-center justify-between border-b border-slate-700 text-xs text-slate-400 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                      <span className="font-mono text-[11px] text-slate-300 ml-2">{status.url}</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium">Live Dev Server</span>
                  </div>
                  <div className="flex-1 overflow-hidden bg-slate-900/30 p-2 flex items-center justify-center">
                    <div className={`relative h-full transition-all ${viewportWidths[viewport]}`}>
                      <iframe src={status.url} className="w-full h-full bg-white border-0 rounded shadow-lg" title="Worktree App Preview" />

                      {/* Interactive Pin & Area Box Annotation Layer */}
                      <div
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        className={`absolute inset-0 z-20 select-none ${
                          isPinModeActive
                            ? "cursor-crosshair bg-rose-500/5 ring-2 ring-rose-500/40"
                            : "pointer-events-none"
                        }`}
                      >
                        {/* Live Dragging Selection Box Preview */}
                        {isDragging && dragStart && dragCurrent && (
                          <div
                            style={{
                              left: `${Math.min(dragStart.x, dragCurrent.x)}%`,
                              top: `${Math.min(dragStart.y, dragCurrent.y)}%`,
                              width: `${Math.abs(dragCurrent.x - dragStart.x)}%`,
                              height: `${Math.abs(dragCurrent.y - dragStart.y)}%`,
                            }}
                            className="absolute border-2 border-dashed border-rose-500 bg-rose-500/20 rounded pointer-events-none z-30"
                          />
                        )}

                        {/* Render Existing Pins & Boxes */}
                        {visualAnnotations.map(renderPinItem)}

                        {/* Pending Pin / Box Popover */}
                        {pendingPin && (
                          <div
                            style={{
                              left: pendingPin.width ? `${pendingPin.x + pendingPin.width / 2}%` : `${pendingPin.x}%`,
                              top: pendingPin.height ? `${pendingPin.y + pendingPin.height / 2}%` : `${pendingPin.y}%`,
                            }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-40 w-64 p-3 rounded-xl bg-slate-900 border border-rose-500 shadow-2xl text-xs space-y-2 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between text-rose-400 font-semibold">
                              <span className="flex items-center gap-1">
                                <MessageSquarePlus className="h-3.5 w-3.5" />
                                {pendingPin.width && pendingPin.height ? "Catatan Area Seleksi" : "Catatan Pin Titik"}
                              </span>
                              <button onClick={handleCancelPin} className="text-slate-400 hover:text-white cursor-pointer">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            {pendingPin.width && pendingPin.height && (
                              <div className="px-2 py-1 rounded bg-rose-950/60 border border-rose-500/30 text-[10px] text-rose-300 font-mono">
                                Box: {Math.round(pendingPin.width)}% × {Math.round(pendingPin.height)}%
                              </div>
                            )}
                            <textarea
                              rows={3}
                              autoFocus
                              value={pinComment}
                              onChange={(e) => setPinComment(e.target.value)}
                              placeholder={
                                pendingPin.width && pendingPin.height
                                  ? "Tuliskan revisi untuk area kotak ini..."
                                  : "Tuliskan revisi untuk titik ini..."
                              }
                              className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-slate-100 text-xs placeholder-slate-500 resize-none outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={handleCancelPin}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
                              >
                                Batal
                              </button>
                              <button
                                onClick={handleSavePin}
                                disabled={!pinComment.trim()}
                                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-[11px] cursor-pointer"
                              >
                                Simpan {pendingPin.width && pendingPin.height ? "Area" : "Pin"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: PIXEL OVERLAY VIEW */}
            {viewMode === "OVERLAY" && activeMockup && (
              <div className={`rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-2xl ${isFullscreen ? "flex-1 min-h-0 flex flex-col mt-3" : ""}`}>
                <div className="h-9 bg-slate-800/80 px-4 flex items-center justify-between border-b border-slate-700 text-xs text-slate-400 shrink-0">
                  <span className="font-mono text-[11px] text-slate-300">
                    Pixel Overlay Comparison (Opacity: {overlayOpacity}%)
                  </span>
                </div>
                <div className={`relative w-full ${isFullscreen ? "flex-1" : "h-[680px]"} bg-slate-900/50 flex items-center justify-center overflow-hidden`}>
                  {/* Underlay: Live Iframe */}
                  <div className={`absolute inset-0 z-0 h-full ${viewportWidths[viewport]}`}>
                    <iframe src={status.url} className="w-full h-full bg-white border-0" title="Worktree App Preview" />
                  </div>

                  {/* Overlay: Mockup Image */}
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
                </div>
              </div>
            )}

            {/* Mode 3: WEB ONLY VIEW (Full Width Default) */}
            {viewMode === "WEB_ONLY" && (
              <div className={`rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-2xl ${isFullscreen ? "flex-1 min-h-0 flex flex-col mt-3" : ""}`}>
                <div className="h-9 bg-slate-800/80 px-4 flex items-center justify-between border-b border-slate-700 text-xs text-slate-400 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-mono text-[11px] text-slate-300 ml-2">{status.url}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Desktop / Laptop Full View</span>
                </div>
                <div className={`${isFullscreen ? "flex-1" : "h-[750px]"} bg-slate-900/30 p-2 flex items-center justify-center`}>
                  <div className={`relative h-full transition-all ${viewportWidths[viewport]} rounded-lg overflow-hidden border border-slate-800 shadow-xl bg-white flex flex-col`}>
                    <iframe
                      src={status.url}
                      className="w-full flex-1 border-0"
                      title="Worktree App Preview"
                    />

                    {/* Interactive Pin & Area Box Annotation Layer */}
                    {isPinModeActive && (
                      <div
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        className="absolute inset-0 z-20 select-none cursor-crosshair bg-rose-500/5 ring-2 ring-rose-500/40"
                      >
                        {/* Live Dragging Selection Box Preview */}
                        {isDragging && dragStart && dragCurrent && (
                          <div
                            style={{
                              left: `${Math.min(dragStart.x, dragCurrent.x)}%`,
                              top: `${Math.min(dragStart.y, dragCurrent.y)}%`,
                              width: `${Math.abs(dragCurrent.x - dragStart.x)}%`,
                              height: `${Math.abs(dragCurrent.y - dragStart.y)}%`,
                            }}
                            className="absolute border-2 border-dashed border-rose-500 bg-rose-500/20 rounded pointer-events-none z-30"
                          />
                        )}

                        {/* Render Existing Pins & Boxes */}
                        {visualAnnotations.map(renderPinItem)}

                        {/* Pending Pin / Box Popover */}
                        {pendingPin && (
                          <div
                            style={{
                              left: pendingPin.width ? `${pendingPin.x + pendingPin.width / 2}%` : `${pendingPin.x}%`,
                              top: pendingPin.height ? `${pendingPin.y + pendingPin.height / 2}%` : `${pendingPin.y}%`,
                            }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-40 w-64 p-3 rounded-xl bg-slate-900 border border-rose-500 shadow-2xl text-xs space-y-2 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between text-rose-400 font-semibold">
                              <span className="flex items-center gap-1">
                                <MessageSquarePlus className="h-3.5 w-3.5" />
                                {pendingPin.width && pendingPin.height ? "Catatan Area Seleksi" : "Catatan Pin Titik"}
                              </span>
                              <button onClick={handleCancelPin} className="text-slate-400 hover:text-white cursor-pointer">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            {pendingPin.width && pendingPin.height && (
                              <div className="px-2 py-1 rounded bg-rose-950/60 border border-rose-500/30 text-[10px] text-rose-300 font-mono">
                                Box: {Math.round(pendingPin.width)}% × {Math.round(pendingPin.height)}%
                              </div>
                            )}
                            <textarea
                              rows={3}
                              autoFocus
                              value={pinComment}
                              onChange={(e) => setPinComment(e.target.value)}
                              placeholder={
                                pendingPin.width && pendingPin.height
                                  ? "Tuliskan revisi untuk area kotak ini..."
                                  : "Tuliskan revisi untuk titik ini..."
                              }
                              className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-slate-100 text-xs placeholder-slate-500 resize-none outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={handleCancelPin}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
                              >
                                Batal
                              </button>
                              <button
                                onClick={handleSavePin}
                                disabled={!pinComment.trim()}
                                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-[11px] cursor-pointer"
                              >
                                Simpan {pendingPin.width && pendingPin.height ? "Area" : "Pin"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Non-pin mode markers */}
                    {!isPinModeActive && visualAnnotations.length > 0 && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        {visualAnnotations.map(renderPinItem)}
                      </div>
                    )}
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
