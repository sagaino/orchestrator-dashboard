import React, { useState } from "react"
import {
  FolderGit2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Search,
  Copy,
  Check,
  Tag,
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
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isSectionOpen, setIsSectionOpen] = useState(true)
  const [expandedPatternIndices, setExpandedPatternIndices] = useState<Set<number>>(new Set())
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null)

  const handleCopyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeKey(key)
    setTimeout(() => setCopiedCodeKey(null), 2000)
  }

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

  // Filter repos by domain
  const filteredRepos = React.useMemo(() => {
    return groupedRepos.filter((g) => {
      const matchDomain = selectedDomain === "ALL" || g.domain.toLowerCase() === selectedDomain.toLowerCase()
      return matchDomain
    })
  }, [groupedRepos, selectedDomain])

  const currentActiveRepo = groupedRepos.find((g) => g.repositoryPath === selectedRepoKey) || (filteredRepos.length > 0 ? filteredRepos[0] : null)

  // Collect all available tags for active repo
  const availableTags = React.useMemo(() => {
    if (!currentActiveRepo) return []
    const tagSet = new Set<string>()
    for (const pat of currentActiveRepo.allUniquePatterns) {
      for (const t of pat.tags || []) {
        tagSet.add(t.toLowerCase().trim())
      }
    }
    return Array.from(tagSet).sort()
  }, [currentActiveRepo])

  // Filter active repo patterns by search query and selected tag
  const filteredPatterns = React.useMemo(() => {
    if (!currentActiveRepo) return []
    return currentActiveRepo.allUniquePatterns.filter((pat) => {
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        pat.title.toLowerCase().includes(q) ||
        pat.summary.toLowerCase().includes(q) ||
        (pat.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        (pat.keyPoints || []).some((kp) => kp.toLowerCase().includes(q)) ||
        (pat.codeSnippets || []).some((cs) => cs.code.toLowerCase().includes(q) || (cs.description || "").toLowerCase().includes(q))

      const matchTag = !selectedTag || (pat.tags || []).some((t) => t.toLowerCase().trim() === selectedTag)
      return matchSearch && matchTag
    })
  }, [currentActiveRepo, searchQuery, selectedTag])

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
          {/* Controls Bar: Select Dropdown & Domain Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            {/* Repository Dropdown Picker */}
            <div className="flex-1 max-w-md space-y-1">
              <label className="block text-[11px] font-medium text-slate-400">
                Pilih Repositori:
              </label>
              <select
                value={currentActiveRepo?.repositoryPath || ""}
                onChange={(e) => {
                  setSelectedRepoKey(e.target.value)
                  setSelectedTag(null)
                }}
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
                  onClick={() => {
                    setSelectedDomain(d)
                    setSelectedTag(null)
                  }}
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

              {/* Real-time Search & Tag Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                {/* Search input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari pola, fungsi, atau snippet kode..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Available Tag Pills */}
                {availableTags.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0 mr-1">
                      <Tag className="h-3 w-3" />
                      Tags:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTag(null)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors shrink-0 cursor-pointer ${
                        selectedTag === null
                          ? "bg-indigo-600 text-white font-bold"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Semua
                    </button>
                    {availableTags.slice(0, 8).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors shrink-0 cursor-pointer ${
                          selectedTag === tag
                            ? "bg-indigo-600 text-white font-bold"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Patterns Grid / Accordion List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-slate-300">
                    Daftar Pola Arsitektur ({filteredPatterns.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedPatternIndices(new Set(filteredPatterns.map((_, i) => i)))}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium cursor-pointer"
                    >
                      Buka Semua
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => setExpandedPatternIndices(new Set())}
                      className="text-[11px] text-slate-400 hover:text-slate-300 transition-colors font-medium cursor-pointer"
                    >
                      Tutup Semua
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredPatterns.map((pattern: HarvestRunPattern, idx: number) => {
                    const isPromoted = pattern.confidence >= 0.9
                    const isPatternExpanded = expandedPatternIndices.has(idx)

                    return (
                      <div
                        key={idx}
                        className={`rounded-xl border transition-all overflow-hidden ${
                          isPatternExpanded
                            ? "bg-slate-900/95 border-indigo-500/40 shadow-md"
                            : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                        }`}
                      >
                        {/* Collapsible Pattern Header */}
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedPatternIndices((prev) => {
                              const next = new Set(prev)
                              if (next.has(idx)) {
                                next.delete(idx)
                              } else {
                                next.add(idx)
                              }
                              return next
                            })
                          }}
                          className="w-full p-3.5 flex flex-wrap items-center justify-between gap-3 text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <div className="flex items-center gap-2.5 min-w-[260px] flex-1">
                            <div className="p-1.5 rounded-md bg-slate-800/80 text-slate-400 shrink-0">
                              {isPatternExpanded ? (
                                <ChevronDown className="h-4 w-4 text-indigo-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white tracking-wide truncate">
                                {pattern.title}
                              </h4>
                              {!isPatternExpanded && pattern.summary && (
                                <p className="text-[11px] text-slate-400 truncate max-w-xl">
                                  {pattern.summary}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="hidden sm:flex flex-wrap gap-1">
                              {(pattern.tags || []).slice(0, 3).map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>

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
                        </button>

                        {/* Collapsible Details Body */}
                        {isPatternExpanded && (
                          <div className="p-4 pt-1 border-t border-slate-800/80 bg-slate-950/40 space-y-3.5">
                            {/* Full Summary */}
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Overview:
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {pattern.summary}
                              </p>
                            </div>

                            {/* Key Implementation Points */}
                            {pattern.keyPoints && pattern.keyPoints.length > 0 && (
                              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1.5">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Key Implementation Points:
                                </span>
                                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                                  {pattern.keyPoints.map((pt, pIdx) => (
                                    <li key={pIdx} className="leading-relaxed">
                                      {pt}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Code Examples with 1-Click Copy */}
                            {pattern.codeSnippets && pattern.codeSnippets.length > 0 && (
                              <div className="space-y-3">
                                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1.5">
                                  <Code2 className="h-3.5 w-3.5" />
                                  Code Implementation Snippets:
                                </span>
                                {pattern.codeSnippets.map((snippet, sIdx) => {
                                  const snippetKey = `${idx}-${sIdx}`
                                  const isCopied = copiedCodeKey === snippetKey

                                  return (
                                    <div
                                      key={sIdx}
                                      className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner"
                                    >
                                      <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                                        <span className="text-[11px] font-mono text-slate-300 font-semibold truncate">
                                          {snippet.description || `Example ${sIdx + 1} (${snippet.language || "code"})`}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleCopyCode(snippet.code, snippetKey)}
                                          className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                                            isCopied
                                              ? "bg-emerald-600 text-white font-bold"
                                              : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                          }`}
                                        >
                                          {isCopied ? (
                                            <>
                                              <Check className="h-3 w-3 text-white" />
                                              <span>Tersalin!</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="h-3 w-3" />
                                              <span>Salin Kode</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <pre className="p-3.5 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-72 select-text">
                                        <code>{snippet.code}</code>
                                      </pre>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Tags & Architecture Structure Footer */}
                            <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap gap-1.5">
                                {(pattern.tags || []).map((tag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                              {pattern.codeStructure && (
                                <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1">
                                  <Code2 className="h-3.5 w-3.5" />
                                  <span>Structured Implementation</span>
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs">
              Tidak ada pola yang cocok dengan pencarian atau filter.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

