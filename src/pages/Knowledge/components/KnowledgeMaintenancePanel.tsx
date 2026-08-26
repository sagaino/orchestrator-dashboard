import React, { useState } from "react"
import { AlertTriangle, Clock3, Copy, Eye, Loader2, Merge, ShieldCheck } from "lucide-react"
import { useApplyKnowledgeMerge, useKnowledgeMaintenance, usePreviewKnowledgeMerge } from "@/hooks/use-orchestrator"
import { toast } from "@/components/ui/toast"

export const KnowledgeMaintenancePanel: React.FC = () => {
  const { data, isLoading } = useKnowledgeMaintenance()
  const { mutateAsync: previewMerge, isPending: previewLoading } = usePreviewKnowledgeMerge()
  const { mutateAsync: applyMerge, isPending: applyLoading } = useApplyKnowledgeMerge()
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewMerge>> | null>(null)
  const [confirm, setConfirm] = useState(false)

  const openPreview = async (sourcePath: string, targetPath: string) => {
    try {
      setPreview(await previewMerge({ sourcePath, targetPath }))
      setConfirm(false)
    } catch (error) {
      toast.add({ title: "Merge preview gagal", description: error instanceof Error ? error.message : String(error), type: "error" })
    }
  }

  const executeMerge = async () => {
    if (!preview || !confirm) return
    try {
      await applyMerge({ sourcePath: preview.source.path, targetPath: preview.target.path, preview })
      toast.add({ title: "Knowledge berhasil dikonsolidasikan", description: "Source dipertahankan dan index memiliki jejak rollback.", type: "success" })
      setPreview(null)
      setConfirm(false)
    } catch (error) {
      toast.add({ title: "Merge dibatalkan", description: error instanceof Error ? error.message : String(error), type: "error" })
    }
  }

  if (isLoading) return <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">Memuat antrean maintenance knowledge…</div>
  if (!data) return null

  return (
    <section aria-labelledby="knowledge-maintenance-title" className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="knowledge-maintenance-title" className="flex items-center gap-2 text-base font-semibold text-white"><ShieldCheck className="h-5 w-5 text-indigo-400" /> P8.1 Knowledge Maintenance</h2>
          <p className="mt-1 text-xs text-slate-400">Duplikat hanya menjadi kandidat. Merge selalu melalui preview, konfirmasi, checksum, dan rollback artifact.</p>
        </div>
        <div className="flex gap-2 text-[11px] text-slate-400"><span className="rounded bg-slate-800 px-2 py-1">{data.summary.duplicateCandidates} duplicate</span><span className="rounded bg-amber-950/50 px-2 py-1 text-amber-200">{data.summary.staleReviewItems} review</span></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 min-w-0">
        <div className="rounded-lg border border-slate-800 p-4 min-w-0">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200"><Copy className="h-4 w-4 text-indigo-300" /> Duplicate candidates</h3>
          {data.duplicates.length === 0 ? <p className="text-xs text-slate-500">Tidak ada kandidat duplikat.</p> : <div className="space-y-2">{data.duplicates.slice(0, 6).map((item) => <div key={item.candidateId} className="rounded border border-slate-800/80 p-3 min-w-0"><div className="flex items-center justify-between gap-2 min-w-0"><p className="text-xs text-slate-200 truncate flex-1 min-w-0">{item.left.title} ↔ {item.right.title}</p><span className="text-[10px] text-indigo-300 shrink-0">{Math.round(item.score * 100)}%</span></div><p className="mt-1 truncate font-mono text-[10px] text-slate-500">{item.left.path} · {item.right.path}</p><button type="button" disabled={previewLoading} onClick={() => openPreview(item.right.path, item.left.path)} className="mt-2 inline-flex items-center gap-1 rounded bg-indigo-600/20 px-2 py-1 text-[11px] text-indigo-200 hover:bg-indigo-600/30 disabled:opacity-50"><Eye className="h-3 w-3" /> Preview merge</button></div>)}</div>}
        </div>

        <div className="rounded-lg border border-slate-800 p-4 min-w-0">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200"><Clock3 className="h-4 w-4 text-amber-300" /> Stale review queue</h3>
          {data.stale.length === 0 ? <p className="text-xs text-slate-500">Semua halaman masih dalam review window.</p> : <div className="space-y-2">{data.stale.slice(0, 6).map((item) => <div key={item.queueId} className="flex items-start justify-between gap-3 rounded border border-slate-800/80 p-3 min-w-0"><div className="min-w-0 flex-1"><p className="text-xs text-slate-200 truncate font-medium">{item.title}</p><p className="mt-1 truncate font-mono text-[10px] text-slate-500">{item.path}</p></div><span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-mono font-semibold ${item.status === "STALE" ? "bg-rose-950/50 text-rose-200 border border-rose-800/50" : "bg-amber-950/50 text-amber-200 border border-amber-800/50"}`}>{item.status}</span></div>)}</div>}
        </div>
      </div>

      {preview && <div role="dialog" aria-labelledby="knowledge-merge-preview-title" className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-4"><h3 id="knowledge-merge-preview-title" className="flex items-center gap-2 text-sm font-medium text-indigo-100"><Merge className="h-4 w-4" /> Merge preview</h3><p className="mt-2 text-xs text-slate-300"><span className="font-mono">{preview.source.path}</span> → <span className="font-mono">{preview.target.path}</span></p><p className="mt-2 text-xs text-slate-400">Source akan tetap disimpan dengan status SUPERSEDED. Index update dapat dikembalikan menggunakan plan artifact.</p><pre className="mt-3 max-h-40 overflow-auto rounded bg-slate-950/70 p-3 text-[10px] text-slate-300">{preview.proposedChanges.targetAppend}</pre><label className="mt-3 flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={confirm} onChange={(event) => setConfirm(event.target.checked)} /> Saya memahami merge ini mengubah target dan menandai source sebagai SUPERSEDED.</label><button type="button" disabled={!confirm || applyLoading} onClick={executeMerge} className="mt-3 inline-flex items-center gap-2 rounded bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50">{applyLoading && <Loader2 className="h-3 w-3 animate-spin" />} Terapkan merge dengan rollback</button></div>}
      {data.summary.contradictionCandidates > 0 && <p className="flex items-center gap-2 text-xs text-amber-200"><AlertTriangle className="h-4 w-4" /> {data.summary.contradictionCandidates} kandidat berpotensi kontradiktif; wajib review manusia.</p>}
    </section>
  )
}
