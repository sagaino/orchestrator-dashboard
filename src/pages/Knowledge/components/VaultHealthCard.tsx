import React, { useState } from "react"
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Link2,
  FileQuestion,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Search,
  Copy,
  Check,
  Info,
  RefreshCw,
  Sparkles,
  Wrench,
  Loader2,
} from "lucide-react"
import { useFixSafeKnowledgeHealth } from "@/hooks/use-orchestrator"
import { toast } from "@/components/ui/toast"
import type { VaultHealthCardProps } from "../types"

type FilterCategory = "all" | "broken_links" | "unindexed" | "orphan_candidates" | "errors" | "warnings"

interface UnifiedIssue {
  id: string
  severity: "error" | "warning"
  code: string
  message: string
  file?: string
  category: "broken_links" | "unindexed" | "orphan_candidates" | "other"
}

// Categorize an issue item based on code and message
const categorizeIssue = (code: string, message: string): "broken_links" | "unindexed" | "orphan_candidates" | "other" => {
  const c = code.toUpperCase()
  const m = message.toLowerCase()

  if (c.includes("LINK") || m.includes("link") || m.includes("tautan")) {
    return "broken_links"
  }
  if (c.includes("INDEX") || m.includes("index") || m.includes("indeks") || m.includes("unindexed")) {
    return "unindexed"
  }
  if (c.includes("ORPHAN") || c.includes("CANDIDATE") || m.includes("orphan") || m.includes("candidate")) {
    return "orphan_candidates"
  }
  return "other"
}

export const VaultHealthCard: React.FC<VaultHealthCardProps> = ({ health, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  const { mutateAsync: fixSafeHealth, isPending: isFixing } = useFixSafeKnowledgeHealth()

  if (!health) return null

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  const handleAutoFixSafe = async () => {
    try {
      const res = await fixSafeHealth()
      toast.add({
        title: "Auto-Fix Safe Selesai",
        description:
          res?.message ||
          "Isu aman pada Vault berhasil diperbaiki dan didaftarkan ke indeks.",
        type: "success",
      })
      if (onRefresh) {
        onRefresh()
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Auto-Fix Safe",
        description: errorMessage,
        type: "error",
      })
    }
  }

  // Combine errors and warnings into unified issue list
  const errors = Array.isArray(health.errors) ? health.errors : []
  const warnings = Array.isArray(health.warnings) ? health.warnings : []
  const unindexedCount = health.unindexedCount || 0
  const hasSafeFixableIssues = unindexedCount > 0 || warnings.length > 0

  const unifiedIssues: UnifiedIssue[] = [
    ...errors.map((err, idx) => ({
      id: `err-${idx}-${err.code}`,
      severity: "error" as const,
      code: err.code || "VAULT_ERROR",
      message: err.message || "Unknown vault error detected",
      file: err.file,
      category: categorizeIssue(err.code || "", err.message || ""),
    })),
    ...warnings.map((warn, idx) => ({
      id: `warn-${idx}-${warn.code}`,
      severity: "warning" as const,
      code: warn.code || "VAULT_WARNING",
      message: warn.message || "Unknown vault warning detected",
      file: warn.file,
      category: categorizeIssue(warn.code || "", warn.message || ""),
    })),
  ]

  const totalIssues = unifiedIssues.length

  // Filter issues based on active category and search query
  const filteredIssues = unifiedIssues.filter((issue) => {
    // Category match
    if (activeCategory === "broken_links" && issue.category !== "broken_links") return false
    if (activeCategory === "unindexed" && issue.category !== "unindexed") return false
    if (activeCategory === "orphan_candidates" && issue.category !== "orphan_candidates") return false
    if (activeCategory === "errors" && issue.severity !== "error") return false
    if (activeCategory === "warnings" && issue.severity !== "warning") return false

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const inCode = issue.code.toLowerCase().includes(q)
      const inMsg = issue.message.toLowerCase().includes(q)
      const inFile = issue.file ? issue.file.toLowerCase().includes(q) : false
      return inCode || inMsg || inFile
    }
    return true
  })

  // Handle clicking metric boxes
  const handleMetricClick = (category: FilterCategory) => {
    setActiveCategory(category)
    setIsExpanded(true)
  }

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
      {/* Top Bar: Title, Status, and Timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              health.healthy
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
            }`}
          >
            {health.healthy ? (
              <ShieldCheck className="h-6 w-6" />
            ) : (
              <AlertTriangle className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Vault Knowledge Health
              </h2>
              {health.healthy ? (
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  HEALTHY
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  ATTENTION REQUIRED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Audit integritas tautan, kelengkapan indeks, dan konsistensi skema Obsidian Vault.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {health.timestamp && (
            <div className="text-right font-mono text-[11px] text-slate-500">
              Audit Terakhir: {new Date(health.timestamp).toLocaleTimeString()}
            </div>
          )}
          {hasSafeFixableIssues && (
            <button
              type="button"
              onClick={handleAutoFixSafe}
              disabled={isFixing}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              title="Perbaiki otomatis isu aman pada Obsidian Vault"
            >
              {isFixing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>{isFixing ? "Memperbaiki..." : "Auto-Fix Safe Issues"}</span>
            </button>
          )}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isFixing}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Perbarui status audit vault"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFixing ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Broken Links Card */}
        <button
          type="button"
          onClick={() => handleMetricClick("broken_links")}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            activeCategory === "broken_links" && isExpanded
              ? "bg-slate-800/90 border-rose-500/60 ring-1 ring-rose-500/30 shadow-md"
              : "bg-slate-800/40 border-slate-800 hover:bg-slate-800/70 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Link2 className="h-4 w-4 text-rose-400" />
              Broken Links
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                health.brokenLinksCount > 0
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {health.brokenLinksCount > 0 ? "Issues" : "Clean"}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">
              {health.brokenLinksCount}
            </span>
            <span className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
              Klik untuk drill-down →
            </span>
          </div>
        </button>

        {/* Unindexed Pages Card */}
        <button
          type="button"
          onClick={() => handleMetricClick("unindexed")}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            activeCategory === "unindexed" && isExpanded
              ? "bg-slate-800/90 border-amber-500/60 ring-1 ring-amber-500/30 shadow-md"
              : "bg-slate-800/40 border-slate-800 hover:bg-slate-800/70 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-amber-400" />
              Unindexed Pages
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                health.unindexedCount > 0
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {health.unindexedCount > 0 ? "Pending" : "Indexed"}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">
              {health.unindexedCount}
            </span>
            <span className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
              Klik untuk drill-down →
            </span>
          </div>
        </button>

        {/* Orphan Candidates Card */}
        <button
          type="button"
          onClick={() => handleMetricClick("orphan_candidates")}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            activeCategory === "orphan_candidates" && isExpanded
              ? "bg-slate-800/90 border-indigo-500/60 ring-1 ring-indigo-500/30 shadow-md"
              : "bg-slate-800/40 border-slate-800 hover:bg-slate-800/70 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <FileQuestion className="h-4 w-4 text-indigo-400" />
              Orphan Candidates
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                health.orphanCandidatesCount > 0
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {health.orphanCandidatesCount > 0 ? "Orphans" : "None"}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">
              {health.orphanCandidatesCount}
            </span>
            <span className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
              Klik untuk drill-down →
            </span>
          </div>
        </button>
      </div>

      {/* Drill-down Toggle Button */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Info className="h-3.5 w-3.5 text-slate-500" />
          <span>
            Total Masalah Terdeteksi:{" "}
            <strong className="font-mono text-slate-200">{totalIssues}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span>{isExpanded ? "Sembunyikan Rincian Drill-Down" : "Buka Rincian Drill-Down"}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Interactive Drill-down Detail Panel */}
      {isExpanded && (
        <div className="pt-2 space-y-4 border-t border-slate-800/80 animate-in fade-in-0 duration-200">
          {/* Filter Bar & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeCategory === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                Semua ({totalIssues})
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory("broken_links")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  activeCategory === "broken_links"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Link2 className="h-3 w-3" />
                Broken Links ({health.brokenLinksCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory("unindexed")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  activeCategory === "unindexed"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <FileSpreadsheet className="h-3 w-3" />
                Unindexed ({health.unindexedCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory("orphan_candidates")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  activeCategory === "orphan_candidates"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <FileQuestion className="h-3 w-3" />
                Orphans ({health.orphanCandidatesCount})
              </button>

              {errors.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("errors")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    activeCategory === "errors"
                      ? "bg-rose-700 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  <AlertCircle className="h-3 w-3 text-rose-400" />
                  Errors ({errors.length})
                </button>
              )}

              {warnings.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("warnings")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    activeCategory === "warnings"
                      ? "bg-amber-700 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                  Warnings ({warnings.length})
                </button>
              )}
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari file atau pesan isu..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>
          </div>

          {/* Quick Auto-Fix Action Banner if safe fixable issues exist */}
          {hasSafeFixableIssues && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>
                  {unindexedCount > 0
                    ? `Terdapat ${unindexedCount} berkas belum terindeks yang dapat didaftarkan otomatis ke index.md.`
                    : "Terdapat peringatan aman pada Vault yang dapat diperbaiki otomatis."}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutoFixSafe}
                disabled={isFixing}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ml-auto shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                {isFixing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wrench className="h-3.5 w-3.5" />
                )}
                <span>{isFixing ? "Memperbaiki..." : "Auto-Fix Safe Issues"}</span>
              </button>
            </div>
          )}

          {/* Issues List or Clean State */}
          {filteredIssues.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="mx-auto h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-semibold text-slate-200">
                Tidak Ada Masalah Ditemukan
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {activeCategory === "broken_links" &&
                  "Semua wikilink dalam vault terhubung dengan valid ke halaman target."}
                {activeCategory === "unindexed" &&
                  "Semua berkas knowledge telah terdaftar rapi pada index.md."}
                {activeCategory === "orphan_candidates" &&
                  "Tidak ada berkas candidate yatim yang kehilangan sumber asal."}
                {activeCategory === "all" &&
                  "Seluruh komponen vault berada dalam kondisi prima tanpa error atau peringatan."}
                {activeCategory === "errors" &&
                  "Tidak ada critical error yang mengancam integritas vault."}
                {activeCategory === "warnings" &&
                  "Tidak ada peringatan linting atau format pada halaman vault."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredIssues.map((issue) => {
                const isError = issue.severity === "error"
                return (
                  <div
                    key={issue.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {isError ? (
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            ERROR
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            WARNING
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded font-mono text-[10px] text-slate-400 bg-slate-900 border border-slate-800">
                          {issue.code}
                        </span>
                      </div>

                      {issue.category !== "other" && (
                        <span className="text-[10px] uppercase font-mono text-slate-500">
                          {issue.category.replace("_", " ")}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {issue.message}
                    </p>

                    {issue.file && (
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800/80">
                        <span className="truncate max-w-md text-indigo-300">{issue.file}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyPath(issue.file!)}
                          className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer ml-2 shrink-0"
                          title="Salin path file"
                        >
                          {copiedPath === issue.file ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400 text-[10px]">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span className="text-[10px]">Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
