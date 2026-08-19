import React, { useState, type FormEvent } from "react"
import {
  Sparkles,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Compass,
  FileText,
  FolderGit2,
  Folder,
  Layers,
  RotateCcw,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useIngestKnowledge, useHarvestKnowledge } from "@/hooks/use-orchestrator"
import type { HarvestKnowledgeResponse } from "@/services/orchestrator"
import { toast } from "@/components/ui/toast"

export interface KnowledgeIngestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const DOMAIN_OPTIONS = [
  "General",
  "Frontend",
  "Backend",
  "Mobile",
  "DevOps",
  "Architecture",
] as const

const HARVEST_DOMAIN_OPTIONS = [
  "Backend",
  "Frontend",
  "Mobile",
  "DevOps",
  "Architecture",
  "General",
] as const

const TYPE_OPTIONS = [
  { value: "Concept", label: "Concept (01-Knowledge/concepts/)", desc: "Konsep fundamental & arsitektur" },
  { value: "Pattern", label: "Pattern (01-Knowledge/patterns/)", desc: "Standar implementasi reusable" },
  { value: "Snippet", label: "Snippet (01-Knowledge/snippets/)", desc: "Potongan kode & hooks reusable" },
  { value: "Decision", label: "Decision (01-Knowledge/decisions/)", desc: "ADR & keputusan arsitektural" },
  { value: "Debugging", label: "Debugging (01-Knowledge/debugging/)", desc: "Root-cause & perbaikan bug" },
] as const

export const KnowledgeIngestModal: React.FC<KnowledgeIngestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"raw" | "harvest">("raw")

  // Tab 1: Raw text state
  const [title, setTitle] = useState("")
  const [domain, setDomain] = useState<string>("General")
  const [type, setType] = useState<string>("Concept")
  const [destination, setDestination] = useState<"CANDIDATE" | "WIKI">("CANDIDATE")
  const [content, setContent] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Tab 2: Harvest codebase state
  const [repoPath, setRepoPath] = useState("")
  const [harvestDomain, setHarvestDomain] = useState<string>("Backend")
  const [harvestMode, setHarvestMode] = useState<"normal" | "pro">("normal")
  const [harvestSuccessMessage, setHarvestSuccessMessage] = useState<string | null>(null)
  const [harvestErrorMessage, setHarvestErrorMessage] = useState<string | null>(null)
  const [harvestResult, setHarvestResult] = useState<HarvestKnowledgeResponse | null>(null)

  const { mutateAsync: ingestKnowledge, isPending: isIngesting } = useIngestKnowledge()
  const { mutateAsync: harvestKnowledge, isPending: isHarvesting } = useHarvestKnowledge()

  const isPending = isIngesting || isHarvesting

  const resetForm = () => {
    setTitle("")
    setDomain("General")
    setType("Concept")
    setDestination("CANDIDATE")
    setContent("")
    setSuccessMessage(null)
    setErrorMessage(null)

    setRepoPath("")
    setHarvestDomain("Backend")
    setHarvestMode("normal")
    setHarvestSuccessMessage(null)
    setHarvestErrorMessage(null)
    setHarvestResult(null)
  }

  const handleClose = () => {
    if (!isPending) {
      resetForm()
      onClose()
    }
  }

  const handleRawSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setErrorMessage("Konten teks mentah wajib diisi.")
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await ingestKnowledge({
        content: content.trim(),
        title: title.trim() || undefined,
        domain,
        type: type.toLowerCase(),
        destination,
      })

      const targetDest = destination === "WIKI" ? "01-Knowledge/" : "05-Knowledge-Candidates/"
      const msg = `Knowledge "${title.trim() || "Dokumen Baru"}" berhasil disintesis dan disimpan ke ${targetDest}`
      setSuccessMessage(msg)

      toast.add({
        title: "Ingest Knowledge Berhasil",
        description: msg,
        type: "success",
      })

      if (onSuccess) {
        onSuccess()
      }

      // Close modal after brief feedback
      setTimeout(() => {
        handleClose()
      }, 1200)
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : String(err)
      setErrorMessage(errStr || "Terjadi kesalahan saat memproses ingest knowledge.")
      toast.add({
        title: "Gagal Ingest Knowledge",
        description: errStr,
        type: "error",
      })
    }
  }

  const handleHarvestSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!repoPath.trim()) {
      setHarvestErrorMessage("Path repositori lokal wajib diisi.")
      return
    }

    setHarvestErrorMessage(null)
    setHarvestSuccessMessage(null)
    setHarvestResult(null)

    try {
      const res = await harvestKnowledge({
        repositoryPath: repoPath.trim(),
        domain: harvestDomain,
        mode: harvestMode,
      })

      const articles = res?.harvested || res?.articles || res?.items || []
      const count = articles.length || res?.count || 0
      const msg =
        res?.message ||
        (count > 0
          ? `Berhasil memanen ${count} pola arsitektur dari repositori!`
          : `Pemindaian arsitektur selesai untuk repositori "${repoPath.trim()}".`)

      toast.add({
        title: "Harvest Knowledge Berhasil",
        description: msg,
        type: "success",
      })

      if (onSuccess) {
        onSuccess()
      }

      // Close modal on success so user returns to updated Knowledge Center
      handleClose()
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : String(err)
      setHarvestErrorMessage(errStr || "Terjadi kesalahan saat memproses harvest knowledge dari repositori.")
      toast.add({
        title: "Gagal Harvest Knowledge",
        description: errStr,
        type: "error",
      })
    }
  }

  const harvestedArticles = harvestResult?.articles || harvestResult?.items || []

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-4xl max-h-[90vh] p-4 sm:p-6 overflow-y-auto w-full">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-base">
            <PlusCircle className="h-5 w-5" />
            <DialogTitle className="text-white text-base">Knowledge Ingest Studio</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-xs leading-relaxed">
            Ekstrak, sintesis, dan simpan best practice arsitektur atau catatan mentah ke Obsidian Vault.
          </DialogDescription>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setErrorMessage(null)
                setActiveTab("raw")
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeTab === "raw"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              } disabled:opacity-50`}
            >
              <FileText className="h-4 w-4" />
              <span>Raw Text / Snippet</span>
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setHarvestErrorMessage(null)
                setActiveTab("harvest")
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeTab === "harvest"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              } disabled:opacity-50`}
            >
              <FolderGit2 className="h-4 w-4" />
              <span>Harvest from Codebase / Repo</span>
            </button>
          </div>
        </DialogHeader>

        {/* TAB 1: Raw Ingest Content */}
        {activeTab === "raw" && (
          <div className="space-y-4 pt-1">
            {/* AI Synthesis Status Feedback */}
            {isIngesting && (
              <div className="flex items-center gap-3 p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-indigo-200 text-xs animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-indigo-100">AI Sedang Mensintesis Knowledge...</span>
                  <span className="text-indigo-300/90 text-[11px]">
                    Menganalisis konten mentah, mengekstrak entitas, dan merutekan ke Vault.
                  </span>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-emerald-950/50 border border-emerald-700/50 text-emerald-200 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">Ingest Berhasil!</p>
                  <p className="text-emerald-300 text-[11px]">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-200 text-xs">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">Gagal Ingest</p>
                  <p className="text-rose-300 text-[11px]">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleRawSubmit} className="space-y-4">
              {/* Judul Dokumen (Opsional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-indigo-400" />
                    Judul Dokumen
                  </span>
                  <span className="text-slate-500 font-normal text-[11px]">(Opsional / AI Inferred)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isIngesting}
                  placeholder="Contoh: Strategi Optimasi Caching React Query (Opsional)"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
                />
                <p className="text-[11px] text-slate-500">
                  Biarkan kosong jika ingin AI menentukan judul yang paling tepat berdasarkan isi teks.
                </p>
              </div>

              {/* Domain Target Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-amber-400" />
                  Domain Target
                </label>
                <div className="flex flex-wrap gap-2">
                  {DOMAIN_OPTIONS.map((d) => {
                    const isSelected = domain === d
                    return (
                      <button
                        key={d}
                        type="button"
                        disabled={isIngesting}
                        onClick={() => setDomain(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                            : "bg-slate-800/90 text-slate-400 hover:text-slate-200 border border-slate-700/60"
                        } disabled:opacity-50`}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tipe Knowledge & Destinasi */}
              <div className="grid grid-cols-1 gap-4 sm:gap-5">
                {/* Tipe Knowledge */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Tipe Knowledge
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={isIngesting}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer disabled:opacity-50"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    {TYPE_OPTIONS.find((t) => t.value === type)?.desc}
                  </p>
                </div>

                {/* Destinasi Pengetahuan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Destinasi Vault
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      type="button"
                      disabled={isIngesting}
                      onClick={() => setDestination("CANDIDATE")}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        destination === "CANDIDATE"
                          ? "bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500/50"
                          : "bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200"
                      } disabled:opacity-50 flex flex-col justify-between`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 font-medium text-xs text-indigo-300">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="font-semibold text-white">Simpan Candidate</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-mono truncate">
                        05-Knowledge-Candidates/
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">
                        Review & verifikasi sebelum promosi.
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={isIngesting}
                      onClick={() => setDestination("WIKI")}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        destination === "WIKI"
                          ? "bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500/50"
                          : "bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200"
                      } disabled:opacity-50 flex flex-col justify-between`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 font-medium text-xs text-emerald-300">
                        <BookOpen className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-white">Direct ke Wiki</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-mono truncate">
                        01-Knowledge/
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">
                        Langsung aktif di knowledge layer.
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Text Area Besar untuk Konten Mentah */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Teks Mentah / Snippet Referensi *</span>
                  <span className="text-slate-500 text-[11px] font-normal font-mono">
                    {content.length} karakter
                  </span>
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isIngesting}
                  placeholder="Tempel teks mentah, artikel panduan, dokumentasi API, catatan investigasi debugging, atau snippet kode di sini..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-mono leading-relaxed resize-y disabled:opacity-50"
                  required
                />
                <p className="text-[11px] text-slate-500">
                  AI akan otomatis menyusun frontmatter, overview, implementasi, dan kaitan arsitektur sesuai schema wiki.
                </p>
              </div>

              <DialogFooter className="border-slate-800 bg-slate-900/50 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-4 rounded-b-xl flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={isIngesting}
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isIngesting || !content.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-600/30"
                >
                  {isIngesting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mensintesis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>Ingest Knowledge</span>
                    </>
                  )}
                </button>
              </DialogFooter>
            </form>
          </div>
        )}

        {/* TAB 2: Harvest from Codebase / Repo */}
        {activeTab === "harvest" && (
          <div className="space-y-4 pt-1">
            {/* AI Harvesting Status Feedback */}
            {isHarvesting && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 text-xs animate-pulse">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400 shrink-0" />
                <div className="space-y-0.5">
                  <span className="font-semibold block text-indigo-100">
                    AI Sedang Menganalisis Arsitektur Codebase...
                  </span>
                  <span className="text-indigo-300/90 text-[11px] leading-relaxed">
                    Memindai struktur repositori, mengekstrak pola AST, auth, error handling, layer database, dan mensintesis artikel knowledge.
                  </span>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {harvestSuccessMessage && (
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-emerald-950/50 border border-emerald-700/50 text-emerald-200 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <p className="font-semibold text-white">Harvesting Selesai!</p>
                  <p className="text-emerald-300 text-[11px]">{harvestSuccessMessage}</p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {harvestErrorMessage && (
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-200 text-xs">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <p className="font-semibold text-white">Gagal Memanen Knowledge</p>
                  <p className="text-rose-300 text-[11px]">{harvestErrorMessage}</p>
                </div>
              </div>
            )}

            {/* List of harvested knowledge articles if available */}
            {harvestedArticles.length > 0 && (
              <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Artikel Knowledge Baru yang Berhasil Dibuat ({harvestedArticles.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Domain: {harvestDomain}
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {harvestedArticles.map((art, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-white leading-snug">
                          {art.title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-950/90 text-indigo-300 border border-indigo-700/50">
                            {art.type}
                          </span>
                          {art.destination && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                                art.destination === "WIKI"
                                  ? "bg-emerald-950/90 text-emerald-300 border border-emerald-700/50"
                                  : "bg-amber-950/90 text-amber-300 border border-amber-700/50"
                              }`}
                            >
                              {art.destination === "WIKI" ? "01-Knowledge" : "05-Candidates"}
                            </span>
                          )}
                          {typeof art.confidence === "number" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800">
                              {(art.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                      {art.summary && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {art.summary}
                        </p>
                      )}
                      {art.targetPath && (
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          Target: {art.targetPath}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleHarvestSubmit} className="space-y-4">
              {/* Path Repositori Lokal */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Folder className="h-3.5 w-3.5 text-indigo-400" />
                    Path Repositori Lokal *
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  disabled={isHarvesting}
                  placeholder="Contoh: /Users/sagaino/projects/my-backend-service"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-mono disabled:opacity-50"
                />
                <p className="text-[11px] text-slate-500">
                  Masukkan path absolut repositori lokal yang akan dipindai secara terstruktur oleh AI.
                </p>
              </div>

              {/* Selector Domain */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-amber-400" />
                  Selector Domain
                </label>
                <div className="flex flex-wrap gap-2">
                  {HARVEST_DOMAIN_OPTIONS.map((d) => {
                    const isSelected = harvestDomain === d
                    return (
                      <button
                        key={d}
                        type="button"
                        disabled={isHarvesting}
                        onClick={() => setHarvestDomain(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                            : "bg-slate-800/90 text-slate-400 hover:text-slate-200 border border-slate-700/60"
                        } disabled:opacity-50`}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-slate-500">
                  Domain memandu AI untuk memfokuskan ekstraksi pola arsitektur, auth, database, state, atau konfigurasi deployment.
                </p>
              </div>

              {/* Mode Harvest: Normal vs Pro */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    Intensitas Pemindaian (Harvest Mode)
                  </span>
                  {harvestMode === "pro" && (
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/50">
                      ⚡ High Token Usage
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isHarvesting}
                    onClick={() => setHarvestMode("normal")}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      harvestMode === "normal"
                        ? "bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500/50"
                        : "bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200"
                    } disabled:opacity-50 flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">Mode Normal</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/50">
                        Hemat Token
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Ekstrak 4–8 pola inti tercepat & hemat kuota token.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={isHarvesting}
                    onClick={() => setHarvestMode("pro")}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                      harvestMode === "pro"
                        ? "bg-amber-950/60 border-amber-500 text-white ring-1 ring-amber-500/50"
                        : "bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200"
                    } disabled:opacity-50 flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-amber-300 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        Mode Pro
                      </span>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/50">
                        Deep Scan
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Pemindaian exhaustive ke seluruh layer (8–15+ pola komprehensif).
                    </p>
                  </button>
                </div>

                {harvestMode === "pro" && (
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-600/40 flex items-start gap-2 text-amber-200 text-xs mt-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed text-amber-300">
                      <strong>Peringatan Penggunaan Token:</strong> Mode Pro menggunakan model reasoning tinggi (*effort: high*) untuk memindai seluruh sub-modul repositori secara mendalam. Mode ini akan mengekstrak lebih banyak pola arsitektur sekaligus namun mengonsumsi kuota token yang lebih besar.
                    </div>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-start gap-2.5 text-slate-400 text-xs">
                <Layers className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  Pemindaian repositori akan mengekstraksi AST dan best practice arsitektur. Hasil dengan confidence &ge; 0.90 otomatis dipromosikan ke <span className="font-mono text-slate-300">01-Knowledge/</span> dan hasil lainnya disimpan di <span className="font-mono text-slate-300">05-Knowledge-Candidates/</span>.
                </div>
              </div>

              <DialogFooter className="border-slate-800 bg-slate-900/50 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-4 rounded-b-xl flex items-center justify-between gap-3">
                {harvestResult ? (
                  <button
                    type="button"
                    disabled={isHarvesting}
                    onClick={() => {
                      setHarvestResult(null)
                      setHarvestSuccessMessage(null)
                      setRepoPath("")
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Harvest Repo Lain</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isHarvesting}
                    onClick={handleClose}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isHarvesting || !repoPath.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-600/30"
                >
                  {isHarvesting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menganalisis Arsitektur...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>Harvest Knowledge</span>
                    </>
                  )}
                </button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
