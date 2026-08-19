import React, { useState } from "react"
import {
  FolderGit2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Layers,
} from "lucide-react"
import type { HarvestRun, HarvestRunPattern } from "@/services/orchestrator"

interface HarvestRunsOverviewProps {
  harvests: HarvestRun[]
  isLoading?: boolean
}

export const HarvestRunsOverview: React.FC<HarvestRunsOverviewProps> = ({
  harvests,
  isLoading,
}) => {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(
    harvests.length > 0 ? harvests[0].harvestId : null
  )

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-4">
        <div className="h-5 bg-slate-800 rounded w-1/3" />
        <div className="h-20 bg-slate-800/60 rounded-xl" />
      </div>
    )
  }

  if (!harvests || harvests.length === 0) {
    return null
  }

  const totalHarvestedPatterns = harvests.reduce((acc, h) => acc + (h.patterns?.length || 0), 0)

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-5 w-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">
            Hasil Harvest Repositori & Pola Teridentifikasi
          </h2>
          <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/50">
            {harvests.length} Repositori ({totalHarvestedPatterns} Pola)
          </span>
        </div>
      </div>

      {/* Accordion / List of Harvested Repositories */}
      <div className="space-y-3">
        {harvests.map((harvest) => {
          const isExpanded = expandedRunId === harvest.harvestId
          const packageName =
            harvest.packageName ||
            harvest.repositoryPath.split("/").filter(Boolean).pop() ||
            "Unnamed Repo"
          const patternCount = harvest.patterns?.length || 0

          return (
            <div
              key={harvest.harvestId}
              className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all shadow-sm"
            >
              {/* Repository Item Header */}
              <button
                type="button"
                onClick={() => setExpandedRunId(isExpanded ? null : harvest.harvestId)}
                className="w-full p-4 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="flex items-center gap-3 min-w-[240px]">
                  <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
                    <FolderGit2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-wide">
                        {packageName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-indigo-950/90 text-indigo-300 border border-indigo-800/60">
                        {harvest.domain}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                      {harvest.repositoryPath}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {harvest.capturedAt && (
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>
                        {new Date(harvest.capturedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 bg-emerald-950/40 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-800/40 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>{patternCount} Pola</span>
                  </div>

                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Collapsible Content: Detailed Patterns & Architecture Summary */}
              {isExpanded && (
                <div className="p-4 sm:p-5 pt-0 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
                  {/* Architecture & Scan Meta Pill */}
                  {harvest.scanSummary?.detectedPatterns && (
                    <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-slate-400">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-indigo-400" />
                        Komponen Terdeteksi:
                      </span>
                      {Object.entries(harvest.scanSummary.detectedPatterns).map(([key, val]) => {
                        if (!val || typeof val !== "object" || !val.detected) return null
                        return (
                          <span
                            key={key}
                            className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-mono"
                          >
                            {key}: {val.relevantFiles?.length || 0} file
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Patterns Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    {harvest.patterns?.map((pattern: HarvestRunPattern, idx: number) => {
                      const isPromoted = pattern.confidence >= 0.9
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            {/* Pattern Header */}
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-white leading-snug">
                                {pattern.title}
                              </h4>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                                    isPromoted
                                      ? "bg-emerald-950/90 text-emerald-300 border border-emerald-700/50"
                                      : "bg-amber-950/90 text-amber-300 border border-amber-700/50"
                                  }`}
                                >
                                  {isPromoted ? "01-Knowledge" : "05-Candidates"}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
                                  {(pattern.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>

                            {/* Summary */}
                            <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                              {pattern.summary}
                            </p>

                            {/* Key Implementation Points Bullet list */}
                            {pattern.keyPoints && pattern.keyPoints.length > 0 && (
                              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Key Implementation Points:
                                </span>
                                <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                                  {pattern.keyPoints.slice(0, 3).map((pt, pIdx) => (
                                    <li key={pIdx} className="line-clamp-1">
                                      {pt}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Tags & Code Structure */}
                          <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1">
                              {(pattern.tags || []).slice(0, 3).map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            {pattern.codeStructure && (
                              <span className="text-[10px] font-mono text-indigo-400 flex items-center gap-1">
                                <Code2 className="h-3 w-3" />
                                <span>Structured</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
