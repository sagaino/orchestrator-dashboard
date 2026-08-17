import React from "react"
import { Eye, BookOpen, Trash2, Sparkles, FileText, ArrowRight } from "lucide-react"
import type { CandidateCardProps } from "../types"

// Helper to determine suggested target path based on candidate type
const getSuggestedTargetPath = (type?: string, title?: string, candidatePath?: string): string => {
  const cleanType = (type || "concepts").toLowerCase()
  let folder = "concepts"
  if (cleanType.includes("pattern")) folder = "patterns"
  else if (cleanType.includes("snippet")) folder = "snippets"
  else if (cleanType.includes("decision") || cleanType.includes("adr")) folder = "decisions"
  else if (cleanType.includes("debug")) folder = "debugging"

  if (candidatePath) {
    const filename = candidatePath.split("/").pop() || ""
    if (filename) return `01-Knowledge/${folder}/${filename}`
  }

  const slug = (title || "new-knowledge")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  return `01-Knowledge/${folder}/${slug}.md`
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  actionLoading,
  onPromote,
  onReject,
  onPreview,
}) => {
  const candidatePath = candidate.candidatePath
  const suggestedTarget = getSuggestedTargetPath(
    candidate.type,
    candidate.title,
    candidatePath
  )

  const handleCardClick = () => {
    if (onPreview) {
      onPreview(candidate)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && onPreview) {
      e.preventDefault()
      onPreview(candidate)
    }
  }

  return (
    <div
      tabIndex={0}
      role="button"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              {candidate.title}
            </h3>
          </div>
          <p className="text-xs font-mono text-slate-500">{candidatePath}</p>
        </div>

        <div className="flex items-center gap-2">
          {candidate.confidence !== null && candidate.confidence !== undefined && (
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              {(candidate.confidence * 100).toFixed(0)}%
            </span>
          )}
          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/50">
            {candidate.type || "concept"}
          </span>
        </div>
      </div>

      {candidate.summary && (
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
          {candidate.summary}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <span className="text-slate-500">Target:</span>
          <span className="text-indigo-300 flex items-center gap-1">
            <ArrowRight className="h-3 w-3 text-slate-500" />
            {suggestedTarget}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onPreview(candidate)
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center gap-1.5"
            >
              <Eye className="h-3.5 w-3.5 text-indigo-400" />
              <span>Preview</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPromote(candidate)
            }}
            disabled={actionLoading}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Promote to Wiki</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onReject(candidate)
            }}
            disabled={actionLoading}
            className="px-2.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reject</span>
          </button>
        </div>
      </div>
    </div>
  )
}
