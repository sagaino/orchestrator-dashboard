import React, { useState } from "react"
import { Sparkles, Search } from "lucide-react"
import { CandidateCard } from "./CandidateCard"
import type { KnowledgeCandidatesListProps } from "../types"

export const KnowledgeCandidatesList: React.FC<KnowledgeCandidatesListProps> = ({
  candidates,
  actionLoading,
  onPromote,
  onReject,
  onPreview,
}) => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCandidates = candidates.filter((cand) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      cand.title?.toLowerCase().includes(q) ||
      cand.candidateId?.toLowerCase().includes(q) ||
      cand.candidatePath?.toLowerCase().includes(q) ||
      cand.type?.toLowerCase().includes(q) ||
      cand.summary?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <span>Knowledge Candidates</span>
          <span className="text-xs font-mono text-slate-500 font-normal">
            (05-Knowledge-Candidates/)
          </span>
        </h2>
        <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50">
          {candidates.length} Menunggu Keputusan
        </span>
      </div>

      {candidates.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari candidate berdasarkan judul, tipe, atau path..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
          />
        </div>
      )}

      {!candidates || !Array.isArray(candidates) || candidates.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs space-y-1">
          <p className="text-slate-300 font-medium">Tidak ada candidate pengetahuan yang menunggu review.</p>
          <p className="text-slate-500">Semua candidate telah dipromosikan atau ditolak ke arsip.</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
          Tidak ada candidate yang cocok dengan pencarian "{searchQuery}".
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCandidates.map((cand) => {
            const candidateId = cand.candidateId
            return (
              <CandidateCard
                key={candidateId}
                candidate={cand}
                actionLoading={actionLoading}
                onPromote={onPromote}
                onReject={onReject}
                onPreview={onPreview}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
