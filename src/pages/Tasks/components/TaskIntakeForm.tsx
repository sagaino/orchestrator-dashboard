import React, { useRef, useState } from "react"
import { FileText, Play, RefreshCw, CheckCircle2, AlertCircle, Image as ImageIcon, Upload, X, Box, Sparkles } from "lucide-react"
import type { TaskIntakeFormProps } from "../types"

export const TaskIntakeForm: React.FC<TaskIntakeFormProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  prompt,
  onPromptChange,
  autoStart,
  onAutoStartChange,
  attachedAssets = [],
  onRemoveAsset,
  isUploadingAsset,
  onUploadFile,
  statusMessage,
  submitting,
  onSubmit,
}) => {
  const mockupInputRef = useRef<HTMLInputElement>(null)
  const assetInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFiles = async (files: FileList | null, type: "MOCKUP" | "PROJECT_ASSET") => {
    if (!files || files.length === 0) return
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith("image/") || file.name.endsWith(".svg")) {
        await onUploadFile(file, type)
      }
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile()
        if (blob) {
          const file = new File([blob], `clipboard-mockup-${Date.now()}.png`, { type: blob.type })
          await onUploadFile(file, "MOCKUP")
        }
      }
    }
  }

  return (
    <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-400" />
          Canonical Task Intake Form
        </h2>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          Multimodal Slicing Enabled
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Target Repository / Project
          </label>
          <select
            value={selectedProject}
            onChange={(e) => onSelectProject(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} ({p.repository})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Natural Language Instruction
            </label>
            <span className="text-[11px] text-slate-500">
              Bisa paste screenshot langsung (Ctrl+V)
            </span>
          </div>
          <textarea
            rows={5}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onPaste={handlePaste}
            placeholder="Deskripsikan fitur, refactor, atau instruksi slicing UI sesuai desain..."
            className="w-full px-3.5 py-3 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none font-sans"
          />
        </div>

        {/* Optional Visual Attachments: Mockups & Project Assets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Lampiran Gambar Desain & Asset (Opsional)
            </label>
            {isUploadingAsset && (
              <span className="text-xs text-indigo-400 flex items-center gap-1.5 font-medium animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Mengunggah asset...
              </span>
            )}
          </div>

          {/* Dropzone & Buttons */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={async (e) => {
              e.preventDefault()
              setIsDragOver(false)
              await handleFiles(e.dataTransfer.files, "MOCKUP")
            }}
            className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isDragOver
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-800 text-indigo-400 shrink-0">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-slate-200">
                  Tarik & lepas screenshot / Figma mockup di sini
                </p>
                <p className="text-[11px] text-slate-500">
                  Mendukung PNG, JPG, WebP, SVG • Tersimpan aman di Vault
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={mockupInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files, "MOCKUP")}
              />
              <input
                ref={assetInputRef}
                type="file"
                accept="image/*,.svg"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files, "PROJECT_ASSET")}
              />

              <button
                type="button"
                onClick={() => mockupInputRef.current?.click()}
                disabled={isUploadingAsset}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>+ UI Mockup</span>
              </button>

              <button
                type="button"
                onClick={() => assetInputRef.current?.click()}
                disabled={isUploadingAsset}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Simpan file logo/icon langsung ke folder src/assets project"
              >
                <Box className="h-3.5 w-3.5 text-slate-400" />
                <span>+ Asset Logo/Icon</span>
              </button>
            </div>
          </div>

          {/* Attached Files List */}
          {attachedAssets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {attachedAssets.map((asset, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {asset.type === "MOCKUP" ? (
                      <div className="p-1 rounded bg-indigo-500/20 text-indigo-400 shrink-0">
                        <ImageIcon className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 shrink-0">
                        <Box className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="truncate">
                      <p className="font-mono text-[11px] text-slate-200 truncate">
                        {asset.fileName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {asset.type === "MOCKUP"
                          ? "UI Mockup Referensi (Vault)"
                          : `Project Asset (${asset.relativeProjectPath})`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveAsset(index)}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0 ml-2"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoStart"
              checked={autoStart}
              onChange={(e) => onAutoStartChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
  )
}
