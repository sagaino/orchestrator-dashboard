import React, { useState } from "react"
import {
  FileCode,
  Plus,
  Minus,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  FilePlus,
  FileMinus,
  FileEdit,
} from "lucide-react"
import type { RunDiffData, DiffFile } from "@/services/orchestrator"

interface DiffViewerProps {
  diffData: RunDiffData | null
  loading?: boolean
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diffData, loading = false }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0)
  const [copied, setCopied] = useState(false)

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        <span className="animate-pulse">Mengambil git diff dari isolated worktree...</span>
      </div>
    )
  }

  if (!diffData || !diffData.workspaceExists || !diffData.files || diffData.files.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-500 space-y-2">
        <FileCode className="h-8 w-8 mx-auto text-slate-600 mb-2" />
        <p className="text-slate-300 font-medium">
          {diffData?.message || "Tidak ada perubahan file (diff kosong) pada worktree ini."}
        </p>
        <p className="text-slate-500">
          Worktree mungkin telah dibersihkan atau belum menghasilkan perubahan kode.
        </p>
      </div>
    )
  }

  const selectedFile = diffData.files[selectedFileIndex] || diffData.files[0]

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderDiffLines = (patch: string) => {
    const lines = patch.split("\n")
    return lines.map((line, idx) => {
      let lineStyle = "text-slate-400"
      let bgStyle = "hover:bg-slate-800/30"
      let prefix = " "

      if (line.startsWith("diff --git") || line.startsWith("index ") || line.startsWith("---") || line.startsWith("+++")) {
        lineStyle = "text-slate-500 font-bold"
        bgStyle = "bg-slate-900/80"
      } else if (line.startsWith("@@")) {
        lineStyle = "text-indigo-400 bg-indigo-950/30 px-1 rounded"
        bgStyle = "bg-indigo-950/20"
      } else if (line.startsWith("+")) {
        lineStyle = "text-emerald-300"
        bgStyle = "bg-emerald-950/30 border-l-2 border-emerald-500"
        prefix = "+"
      } else if (line.startsWith("-")) {
        lineStyle = "text-rose-300"
        bgStyle = "bg-rose-950/30 border-l-2 border-rose-500"
        prefix = "-"
      }

      return (
        <div key={idx} className={`flex items-start px-3 py-0.5 font-mono text-xs leading-relaxed ${bgStyle}`}>
          <span className="w-8 shrink-0 select-none text-slate-600 text-[10px] text-right pr-2">
            {idx + 1}
          </span>
          <pre className={`flex-1 whitespace-pre-wrap break-all ${lineStyle}`}>{line}</pre>
        </div>
      )
    })
  }

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col md:flex-row h-[550px]">
      {/* File List Sidebar (Left) */}
      <div className="w-full md:w-72 border-r border-slate-800/80 bg-slate-950/60 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Changed Files ({diffData.files.length})</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-900/60 p-2 space-y-1">
          {diffData.files.map((file, i) => {
            const isSelected = i === selectedFileIndex
            const Icon = file.status === "added" ? FilePlus : file.status === "deleted" ? FileMinus : FileEdit
            const statusColor =
              file.status === "added"
                ? "text-emerald-400"
                : file.status === "deleted"
                  ? "text-rose-400"
                  : "text-amber-400"

            return (
              <button
                key={file.file}
                onClick={() => setSelectedFileIndex(i)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-medium"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${statusColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-mono">{file.file}</p>
                  <div className="flex items-center gap-2 mt-1 font-mono text-[10px]">
                    {file.additions > 0 && <span className="text-emerald-400">+{file.additions}</span>}
                    {file.deletions > 0 && <span className="text-rose-400">-{file.deletions}</span>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Diff Code View (Right) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/90">
        {/* Header toolbar */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 px-4">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-200">
            <FileCode className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold">{selectedFile.file}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-sans">
              {selectedFile.status}
            </span>
          </div>

          <button
            onClick={() => handleCopy(selectedFile.patch)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy patch"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="text-[11px] font-sans">{copied ? "Copied" : "Copy Diff"}</span>
          </button>
        </div>

        {/* Diff lines container */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-900/40">
          {renderDiffLines(selectedFile.patch)}
        </div>
      </div>
    </div>
  )
}
