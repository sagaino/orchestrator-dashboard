import React, { useEffect, useState } from "react"
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FolderTree,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from "lucide-react"
import {
  OrchestratorApi,
  type KnowledgeCandidate,
  type VaultHealth,
} from "@/services/orchestrator"

export const KnowledgePage: React.FC = () => {
  const [candidates, setCandidates] = useState<KnowledgeCandidate[]>([])
  const [health, setHealth] = useState<VaultHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [candList, healthData] = await Promise.all([
        OrchestratorApi.getKnowledgeCandidates(),
        OrchestratorApi.getKnowledgeHealth(),
      ])
      setCandidates(candList)
      setHealth(healthData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handlePromote = async (candidateId: string) => {
    const target = prompt("Masukkan target path di 01-Knowledge/ (opsional):", "")
    try {
      setActionLoading(true)
      await OrchestratorApi.promoteKnowledge(candidateId, target || undefined)
      alert("Candidate berhasil dipromosikan ke 01-Knowledge/!")
      loadData()
    } catch (err: any) {
      alert(`Gagal promosi: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (candidateId: string) => {
    const reason = prompt("Masukkan alasan penolakan candidate:", "Duplicate or not reusable")
    if (reason === null) return
    try {
      setActionLoading(true)
      await OrchestratorApi.rejectKnowledge(candidateId, reason)
      alert("Candidate berhasil ditolak dan diarsipkan.")
      loadData()
    } catch (err: any) {
      alert(`Gagal reject: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  const knowledgeSections = [
    { title: "Concepts", path: "01-Knowledge/concepts/", desc: "Konsep fundamental, state management, dan arsitektur." },
    { title: "Patterns", path: "01-Knowledge/patterns/", desc: "Standar implementasi frontend/backend yang dapat digunakan kembali." },
    { title: "Snippets", path: "01-Knowledge/snippets/", desc: "Potongan kode hooks, utilities, dan komponen reusable." },
    { title: "Decisions", path: "01-Knowledge/decisions/", desc: "Architectural Decision Records (ADR) dan roadmap produk." },
    { title: "Debugging", path: "01-Knowledge/debugging/", desc: "Catatan investigasi root-cause dan cara perbaikan bug." },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Knowledge Center & Vault Governance</h1>
          <p className="text-sm text-slate-400">
            Persistent global knowledge layer di Obsidian Vault. Evaluasi calon pengetahuan (Candidates) dan pantau kesehatan link.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Vault Health Summary */}
      {health && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Vault Knowledge Health</h2>
            </div>
            <span
              className={`px-3 py-1 rounded-full font-mono text-xs font-semibold ${
                health.healthy
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
              }`}
            >
              {health.healthy ? "HEALTHY (0 Broken Links)" : "WARNING / ATTENTION"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 flex justify-between">
              <span className="text-slate-400">Broken Links:</span>
              <span className="text-slate-100 font-semibold">{health.brokenLinksCount}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 flex justify-between">
              <span className="text-slate-400">Unindexed Pages:</span>
              <span className="text-slate-100 font-semibold">{health.unindexedCount}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 flex justify-between">
              <span className="text-slate-400">Orphan Candidates:</span>
              <span className="text-slate-100 font-semibold">{health.orphanCandidatesCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2-Column: Candidate Decisions & Vault Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Candidates Decision Center (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Knowledge Candidates (05-Knowledge-Candidates/)
            </h2>
            <span className="text-xs font-mono text-slate-400">{candidates.length} Menunggu Keputusan</span>
          </div>

          {candidates.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
              Tidak ada candidate pengetahuan yang menunggu review.
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((cand) => (
                <div
                  key={cand.candidateId}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-sm text-white">{cand.title}</h3>
                      <p className="text-xs font-mono text-slate-500">{cand.candidatePath}</p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Confidence: {(cand.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  {cand.summary && <p className="text-xs text-slate-300 leading-relaxed">{cand.summary}</p>}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-500 font-mono">Provenance: {cand.provenance}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePromote(cand.candidateId)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        Promote to Wiki
                      </button>
                      <button
                        onClick={() => handleReject(cand.candidateId)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Wiki Architecture Structure (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-indigo-400" />
            01-Knowledge Architecture
          </h2>

          <div className="space-y-3">
            {knowledgeSections.map((sec) => (
              <div
                key={sec.title}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-200">{sec.title}</span>
                  <span className="font-mono text-[10px] text-slate-500">{sec.path}</span>
                </div>
                <p className="text-xs text-slate-400">{sec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
