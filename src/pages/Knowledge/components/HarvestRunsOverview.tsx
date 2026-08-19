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

interface GroupedRepositoryHarvest {
  repositoryPath: string
  packageName: string
  domain: string
  latestRun: HarvestRun
  historyRuns: HarvestRun[]
  totalUniquePatterns: number
  allUniquePatterns: HarvestRunPattern[]
}

export const HarvestRunsOverview: React.FC<HarvestRunsOverviewProps> = ({
  harvests,
  isLoading,
}) => {
  const [selectedRepoKey, setSelectedRepoKey] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL")
  const [isSectionOpen, setIsSectionOpen] = useState(true)

  // Group harvests by normalized repository path
  const groupedRepos = React.useMemo(() => {
    if (!harvests || harvests.length === 0) return []

    const map = new Map<string, HarvestRun[]>()
    for (const h of harvests) {
      const key = h.repositoryPath || "unknown"
      const list = map.get(key) || []
      list.push(h)
      map.set(key, list)
    }

    const grouped: GroupedRepositoryHarvest[] = []
    for (const [repoPath, runs] of map.entries()) {
      // Sort runs by capturedAt descending
      runs.sort((a, b) => {
        const timeA = a.capturedAt ? new Date(a.capturedAt).getTime() : 0
        const timeB = b.capturedAt ? new Date(b.capturedAt).getTime() : 0
        return timeB - timeA
      })

      const latest = runs[0]
      const packageName =
        latest.packageName ||
        latest.repositoryPath.split("/").filter(Boolean).pop() ||
        "Unnamed Repo"

      // Deduplicate patterns across runs for this repo
      const patternMap = new Map<string, HarvestRunPattern>()
      for (const run of runs) {
        for (const pat of run.patterns || []) {
          const titleKey = (pat.title || "").trim().toLowerCase()
          if (titleKey && !patternMap.has(titleKey)) {
            patternMap.set(titleKey, pat)
          }
        }
      }

      const allUniquePatterns = Array.from(patternMap.values())

      grouped.push({
        repositoryPath: repoPath,
        packageName,
        domain: latest.domain,
        latestRun: latest,
        historyRuns: runs,
        totalUniquePatterns: allUniquePatterns.length,
        allUniquePatterns,
      })
    }

    return grouped
  }, [harvests])

  // Set default selected repo on initial load
  React.useEffect(() => {
    if (groupedRepos.length > 0 && selectedRepoKey === null) {
      setSelectedRepoKey(groupedRepos[0].repositoryPath)
    }
  }, [groupedRepos, selectedRepoKey])

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

  const totalDistinctRepos = groupedRepos.length
  const totalUniquePatternsCount = groupedRepos.reduce((acc, g) => acc + g.totalUniquePatterns, 0)

  // Filter repos by domain and search query
  const filteredRepos = groupedRepos.filter((g) => {
    const matchDomain = selectedDomain === "ALL" || g.domain.toLowerCase() === selectedDomain.toLowerCase()
    const matchSearch =
      !searchQuery.trim() ||
      g.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.repositoryPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.allUniquePatterns.some((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchDomain && matchSearch
  })

  const currentActiveRepo = groupedRepos.find((g) => g.repositoryPath === selectedRepoKey) || (filteredRepos.length > 0 ? filteredRepos[0] : null)

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-lg space-y-0">
      {/* Section Header with Collapsible Toggle */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400">
            <FolderGit2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Hasil Harvest Repositori & Pola Teridentifikasi
              </h2>
              <span className="text-xs font-mono font-semibold text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800/50">
                {totalDistinctRepos} Repositori ({totalUniquePatternsCount} Pola)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih repositori dari menu dropdown untuk meninjau pola arsitektur yang terekam.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSectionOpen(!isSectionOpen)}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <span>{isSectionOpen ? "Tutup Bagian" : "Buka Bagian"}</span>
          {isSectionOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {isSectionOpen && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Controls Bar: Search & Select Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            {/* Repository Dropdown Picker */}
            <div className="flex-1 max-w-md space-y-1">
              <label className="block text-[11px] font-medium text-slate-400">
                Pilih Repositori:
              </label>
              <select
                value={currentActiveRepo?.repositoryPath || ""}
                onChange={(e) => setSelectedRepoKey(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              >
                {filteredRepos.map((repo) => (
                  <option key={repo.repositoryPath} value={repo.repositoryPath}>
                    {repo.packageName} ({repo.domain.toUpperCase()}) — {repo.totalUniquePatterns} Pola
                  </option>
                ))}
              </select>
            </div>

            {/* Domain Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "frontend", "backend", "mobile", "devops"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDomain(d)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedDomain === d
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Active Repository Card & Patterns Grid */}
          {currentActiveRepo ? (
            <div className="space-y-4">
              {/* Selected Repo Header Banner */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold text-white">
                      {currentActiveRepo.packageName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-950/90 text-indigo-300 border border-indigo-800/60">
                      {currentActiveRepo.domain}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      • {currentActiveRepo.historyRuns.length}x Pemindaian
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400">
                    {currentActiveRepo.repositoryPath}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {currentActiveRepo.latestRun.capturedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>
                        Terakhir: {new Date(currentActiveRepo.latestRun.capturedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 bg-emerald-950/60 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800/50 text-xs font-bold shadow-sm">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>{currentActiveRepo.totalUniquePatterns} Pola Arsitektur</span>
                  </div>
                </div>
              </div>

              {/* Patterns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentActiveRepo.allUniquePatterns.map((pattern: HarvestRunPattern, idx: number) => {
                  const isPromoted = pattern.confidence >= 0.9
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
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

                        {/* Key Implementation Points */}
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
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs">
              Tidak ada repositori yang cocok dengan filter.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

