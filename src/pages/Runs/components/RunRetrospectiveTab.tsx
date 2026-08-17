import React from "react"
import {
  Brain,
  Sparkles,
  Compass,
  Layers,
  BookOpen,
  Info,
} from "lucide-react"
import type { RunRetrospectiveTabProps } from "../types"

const getDecisionBadge = (decision?: string) => {
  const d = (decision || "PROJECT_ONLY").toUpperCase()
  switch (d) {
    case "WIKI":
    case "NEW":
      return {
        label: d,
        className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        description: "Promosi langsung ke global LLM Wiki (confidence >= 0.90)",
      }
    case "CANDIDATE":
      return {
        label: "CANDIDATE",
        className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        description: "Disimpan ke 05-Knowledge-Candidates untuk review manusia",
      }
    case "UPDATE":
      return {
        label: "UPDATE",
        className: "bg-teal-500/15 text-teal-300 border-teal-500/30",
        description: "Memperbarui dokumen knowledge yang sudah ada",
      }
    case "PROJECT_ONLY":
      return {
        label: "PROJECT_ONLY",
        className: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        description: "Spesifik hanya untuk repository ini, tidak dipromosikan ke Wiki global",
      }
    case "IGNORE":
    default:
      return {
        label: d || "IGNORE",
        className: "bg-slate-700/40 text-slate-300 border-slate-600",
        description: "Tidak memerlukan pencatatan knowledge baru",
      }
  }
}

export const RunRetrospectiveTab: React.FC<RunRetrospectiveTabProps> = ({ selectedRun }) => {
  const retro = selectedRun.retrospective

  if (!retro) {
    const isRunning = [
      "CLAIMING",
      "CLAIMED",
      "RUNNING",
      "EXECUTING",
      "SCOPE_AUDIT",
      "VERIFYING",
      "GRAPHIFY",
    ].includes(selectedRun.state)

    const isFailed = selectedRun.state === "FAILED" || selectedRun.state === "BLOCKED"

    return (
      <div className="p-8 rounded-xl bg-slate-800/20 border border-slate-800 text-center space-y-3">
        <div className="mx-auto h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
          <Brain className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-200">
            {isRunning
              ? "Retrospeksi Sedang Diproses"
              : isFailed
                ? "Retrospeksi Tidak Tersedia"
                : "Belum Ada Data Retrospeksi"}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isRunning
              ? "Analisis retrospeksi AI dan rekomendasi knowledge routing akan otomatis digenerate setelah tahap verifikasi dan eksekusi selesai."
              : isFailed
                ? "Eksekusi run terhenti atau gagal sebelum mencapai tahap evaluasi retrospeksi AI."
                : "Run ini belum memiliki artefak retrospeksi yang tersimpan di manifest."}
          </p>
        </div>
      </div>
    )
  }

  const decisionInfo = getDecisionBadge(retro.knowledgeDecision)
  const confidencePercent =
    typeof retro.confidence === "number"
      ? Math.round(retro.confidence > 1 ? retro.confidence : retro.confidence * 100)
      : null

  const getConfidenceBarColor = (val: number) => {
    if (val >= 85) return "bg-emerald-500"
    if (val >= 70) return "bg-amber-500"
    return "bg-rose-500"
  }

  return (
    <div className="space-y-5">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Knowledge Classification */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              Knowledge Decision
            </span>
          </div>
          <div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${decisionInfo.className}`}
            >
              {decisionInfo.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            {decisionInfo.description}
          </p>
        </div>

        {/* Confidence Level */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              AI Confidence
            </span>
            {confidencePercent !== null && (
              <span className="font-mono text-xs font-bold text-slate-200">
                {confidencePercent}%
              </span>
            )}
          </div>

          {confidencePercent !== null ? (
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getConfidenceBarColor(
                    confidencePercent
                  )}`}
                  style={{ width: `${Math.min(100, Math.max(0, confidencePercent))}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                {confidencePercent >= 90
                  ? "Tinggi (Memenuhi syarat auto-promote Wiki)"
                  : confidencePercent >= 70
                    ? "Sedang (Disarankan masuk antrean Candidate)"
                    : "Rendah (Memerlukan verifikasi manual ketat)"}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Nilai confidence tidak diset.</p>
          )}
        </div>

        {/* Suggested Routing */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              Suggested Routing
            </span>
          </div>
          <div>
            {retro.suggestedRouting ? (
              <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 break-all">
                {retro.suggestedRouting}
              </span>
            ) : (
              <span className="font-mono text-xs text-slate-400">
                {decisionInfo.label === "PROJECT_ONLY"
                  ? "Local Project Task Context"
                  : "Automatic Routing"}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Target lokasi penyimpanan artefak knowledge.
          </p>
        </div>
      </div>

      {/* AI Retrospective Analysis & Findings */}
      {(retro.analysis || retro.summary) && (
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Analisis Retrospeksi AI
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
            {retro.analysis || retro.summary}
          </div>
        </div>
      )}

      {/* Candidate Proposal (If available) */}
      {retro.candidateProposal && (
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-amber-400" />
              Proposal Dokumen Knowledge
            </span>
            {retro.candidateProposal.type && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {retro.candidateProposal.type}
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {retro.candidateProposal.title && (
              <div>
                <span className="text-slate-500">Judul: </span>
                <span className="font-semibold text-slate-200">
                  {retro.candidateProposal.title}
                </span>
              </div>
            )}

            {retro.candidateProposal.targetPath && (
              <div>
                <span className="text-slate-500">Target Path: </span>
                <span className="font-mono text-indigo-300">
                  {retro.candidateProposal.targetPath}
                </span>
              </div>
            )}

            {retro.candidateProposal.summary && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                {retro.candidateProposal.summary}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes / Caveats */}
      {retro.notes && (
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            Catatan & Pertimbangan Tambahan
          </div>
          <p className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800/70 leading-relaxed">
            {retro.notes}
          </p>
        </div>
      )}
    </div>
  )
}
