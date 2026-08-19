import React, { useState } from "react"
import {
  FileCode,
  Plus,
  Copy,
  Check,
  FilePlus,
  FileMinus,
  FileEdit,
  MessageSquare,
  Trash2,
} from "lucide-react"
import type { RunDiffData } from "@/services/orchestrator"

export interface InlineCommentItem {
  id?: string
  file: string
  line: number
  comment: string
}

export interface DiffViewerProps {
  diffData: RunDiffData | null
  loading?: boolean
  comments?: InlineCommentItem[]
  onAddComment?: (comment: { file: string; line: number; comment: string }) => void
  onRemoveComment?: (index: number) => void
}

function parseHunkHeader(line: string): { oldStart: number; newStart: number } | null {
  const match = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
  if (match) {
    return {
      oldStart: parseInt(match[1], 10),
      newStart: parseInt(match[2], 10),
    }
  }
  return null
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  diffData,
  loading = false,
  comments = [],
  onAddComment,
  onRemoveComment,
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0)
  const [copied, setCopied] = useState(false)
  const [activeCommentLineKey, setActiveCommentLineKey] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")

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
  const selectedFileComments = comments.filter((c) => c.file === selectedFile.file)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderDiffLines = (patch: string) => {
    const lines = patch.split("\n")
    let currentOld = 0
    let currentNew = 0
    let inHunk = false

    return lines.map((line, idx) => {
      let lineStyle = "text-slate-400"
      let bgStyle = "hover:bg-slate-800/30"
      let isHeader = false
      let isHunk = false
      let calculatedLineNum: number | null = null

      if (
        line.startsWith("diff --git") ||
        line.startsWith("index ") ||
        line.startsWith("---") ||
        line.startsWith("+++")
      ) {
        lineStyle = "text-slate-500 font-bold"
        bgStyle = "bg-slate-900/80"
        isHeader = true
      } else if (line.startsWith("@@")) {
        lineStyle = "text-indigo-400 bg-indigo-950/30 px-1 rounded"
        bgStyle = "bg-indigo-950/20"
        isHunk = true
        const hunk = parseHunkHeader(line)
        if (hunk) {
          currentOld = hunk.oldStart
          currentNew = hunk.newStart
          inHunk = true
        }
      } else if (line.startsWith("+")) {
        lineStyle = "text-emerald-300"
        bgStyle = "bg-emerald-950/30 border-l-2 border-emerald-500"
        calculatedLineNum = inHunk ? currentNew++ : idx + 1
      } else if (line.startsWith("-")) {
        lineStyle = "text-rose-300"
        bgStyle = "bg-rose-950/30 border-l-2 border-rose-500"
        calculatedLineNum = inHunk ? currentOld++ : idx + 1
      } else {
        if (inHunk) {
          currentOld++
          calculatedLineNum = currentNew++
        } else {
          calculatedLineNum = idx + 1
        }
      }

      const canAnnotate = !isHeader && !isHunk
      const targetLineNum = calculatedLineNum || idx + 1
      const lineKey = `${selectedFile.file}:${idx}:${targetLineNum}`

      const activeLineComments = comments.filter(
        (c) => c.file === selectedFile.file && c.line === targetLineNum
      )

      return (
        <div key={idx} className="group/diffline flex flex-col">
          <div className={`flex items-start px-3 py-0.5 font-mono text-xs leading-relaxed transition-colors ${bgStyle}`}>
            {/* Line Gutter with Hover + Button */}
            <div className="w-14 shrink-0 flex items-center justify-end pr-2 gap-1 select-none">
              {canAnnotate && onAddComment && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeCommentLineKey === lineKey) {
                      setActiveCommentLineKey(null)
                      setCommentText("")
                    } else {
                      setActiveCommentLineKey(lineKey)
                      setCommentText("")
                    }
                  }}
                  title={`Tambah inline comment di baris ${targetLineNum}`}
                  className="opacity-0 group-hover/diffline:opacity-100 hover:scale-110 p-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
                >
                  <Plus className="h-2.5 w-2.5" />
                </button>
              )}
              <span className="text-slate-600 text-[10px] text-right font-mono">
                {targetLineNum}
              </span>
            </div>

            {/* Code Line Content */}
            <pre className={`flex-1 whitespace-pre-wrap break-all ${lineStyle}`}>{line}</pre>

            {/* Indicator if line already has comments */}
            {activeLineComments.length > 0 && (
              <span className="shrink-0 text-amber-400 ml-2 select-none" title={`${activeLineComments.length} catatan`}>
                <MessageSquare className="h-3 w-3" />
              </span>
            )}
          </div>

          {/* Inline Input Form if this line is active */}
          {activeCommentLineKey === lineKey && (
            <div className="my-2 ml-14 mr-4 p-3 rounded-lg bg-slate-900 border border-indigo-500/40 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Tambah Catatan Reviewer (Baris {targetLineNum})</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                  {selectedFile.file}
                </span>
              </div>

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Tuliskan catatan revisi atau komentar untuk baris kode ini..."
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-md text-slate-100 placeholder-slate-500 resize-none outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                autoFocus
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCommentLineKey(null)
                    setCommentText("")
                  }}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!commentText.trim()}
                  onClick={() => {
                    if (!commentText.trim()) return
                    onAddComment?.({
                      file: selectedFile.file,
                      line: targetLineNum,
                      comment: commentText.trim(),
                    })
                    setActiveCommentLineKey(null)
                    setCommentText("")
                  }}
                  className="px-3 py-1 text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-3 w-3" />
                  <span>Simpan Catatan</span>
                </button>
              </div>
            </div>
          )}

          {/* Active comments list attached to this line */}
          {activeLineComments.length > 0 && (
            <div className="my-1.5 ml-14 mr-4 space-y-1.5">
              {activeLineComments.map((c) => {
                const commentIndex = comments.findIndex((item) => item === c)
                return (
                  <div
                    key={c.id || `${c.file}-${c.line}-${c.comment}`}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-amber-950/25 border border-amber-500/30 text-xs"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <MessageSquare className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-amber-300 text-[11px]">
                            Reviewer Note
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Line {c.line}
                          </span>
                        </div>
                        <p className="text-slate-200 whitespace-pre-wrap font-sans">{c.comment}</p>
                      </div>
                    </div>

                    {onRemoveComment && commentIndex !== undefined && commentIndex >= 0 && (
                      <button
                        type="button"
                        onClick={() => onRemoveComment(commentIndex)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                        title="Hapus catatan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
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
          {comments.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
              {comments.length} note{comments.length > 1 ? "s" : ""}
            </span>
          )}
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
            const fileCommentsCount = comments.filter((c) => c.file === file.file).length

            return (
              <button
                key={file.file}
                onClick={() => setSelectedFileIndex(i)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isSelected
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-medium"
                    : "text-slate-300 hover:bg-slate-900 border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${statusColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-mono">{file.file}</p>
                  <div className="flex items-center justify-between mt-1 font-mono text-[10px]">
                    <div className="flex items-center gap-2">
                      {file.additions > 0 && <span className="text-emerald-400">+{file.additions}</span>}
                      {file.deletions > 0 && <span className="text-rose-400">-{file.deletions}</span>}
                    </div>
                    {fileCommentsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono flex items-center gap-1 border border-amber-500/30 shrink-0">
                        <MessageSquare className="h-2.5 w-2.5" />
                        {fileCommentsCount}
                      </span>
                    )}
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
            {selectedFileComments.length > 0 && (
              <span className="text-amber-400 text-[11px] font-sans flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                <MessageSquare className="h-3 w-3" />
                <span>{selectedFileComments.length} note{selectedFileComments.length > 1 ? "s" : ""}</span>
              </span>
            )}
          </div>

          <button
            onClick={() => handleCopy(selectedFile.patch)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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

