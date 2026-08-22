import React, { useState } from "react"
import { CheckCircle2, FileKey2, Loader2, RotateCcw, ShieldCheck } from "lucide-react"
import {
  useApplyKnowledgeProvenanceMigration,
  usePreviewKnowledgeProvenanceMigration,
  useRollbackKnowledgeProvenanceMigration,
} from "@/hooks/use-orchestrator"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

export const KnowledgeProvenanceMigrationPanel: React.FC = () => {
  const previewMutation = usePreviewKnowledgeProvenanceMigration()
  const applyMutation = useApplyKnowledgeProvenanceMigration()
  const rollbackMutation = useRollbackKnowledgeProvenanceMigration()
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewMutation.mutateAsync>> | null>(null)
  const [applied, setApplied] = useState<Awaited<ReturnType<typeof applyMutation.mutateAsync>> | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [rollbackConfirmed, setRollbackConfirmed] = useState(false)

  const createPreview = async () => {
    try {
      setPreview(await previewMutation.mutateAsync({ reviewDays: 180 }))
      setApplied(null)
      setConfirmed(false)
      setRollbackConfirmed(false)
    } catch (error) {
      toast.add({ title: "Preview provenance gagal", description: error instanceof Error ? error.message : String(error), type: "error" })
    }
  }

  const applyMigration = async () => {
    if (!preview || !confirmed) return
    try {
      const result = await applyMutation.mutateAsync({ planId: preview.planId, approvedBy: "dashboard-user" })
      setApplied(result)
      toast.add({ title: "Provenance berhasil dimigrasikan", description: "Health dan maintenance knowledge akan diperbarui.", type: "success" })
    } catch (error) {
      toast.add({ title: "Migrasi dibatalkan", description: error instanceof Error ? error.message : String(error), type: "error" })
    }
  }

  const rollbackMigration = async () => {
    if (!applied || !rollbackConfirmed) return
    try {
      await rollbackMutation.mutateAsync({ planId: applied.planId, revertedBy: "dashboard-user" })
      setApplied(null)
      setPreview(null)
      setRollbackConfirmed(false)
      toast.add({ title: "Migrasi di-rollback", description: "Snapshot provenance dipulihkan dari artifact yang sama.", type: "success" })
    } catch (error) {
      toast.add({ title: "Rollback dibatalkan", description: error instanceof Error ? error.message : String(error), type: "error" })
    }
  }

  return (
    <section aria-labelledby="knowledge-provenance-migration-title" className="space-y-4 rounded-xl border border-cyan-500/25 bg-cyan-950/10 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="knowledge-provenance-migration-title" className="flex items-center gap-2 text-base font-semibold text-white"><ShieldCheck className="h-5 w-5 text-cyan-300" /> P8.0 Provenance migration</h2>
          <p className="mt-1 text-xs text-slate-400">Lengkapi metadata legacy melalui preview, checksum, konfirmasi eksplisit, dan rollback artifact. Tidak ada auto-apply.</p>
        </div>
        <FileKey2 className="h-5 w-5 text-cyan-300" />
      </div>

      <Button size="sm" variant="outline" disabled={previewMutation.isPending} onClick={createPreview}>
        {previewMutation.isPending ? <Loader2 className="animate-spin" /> : <FileKey2 />} Buat preview migrasi
      </Button>

      {preview && <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200"><span className="font-semibold">{preview.summary.candidateCount} halaman</span><span className="text-slate-500">·</span><span>{preview.summary.changedFieldCount} field berubah</span><span className="text-slate-500">·</span><span>{preview.summary.inferredFieldCount} inferred</span></div>
        <p className="mt-2 text-xs text-slate-400">Plan <code className="text-cyan-200">{preview.planId}</code> · audit <code className="text-cyan-200">{preview.auditPath}</code></p>
        {preview.files.length > 0 ? <ul className="mt-3 space-y-1 text-xs text-slate-400">{preview.files.slice(0, 4).map((file) => <li key={file.path} className="truncate"><span className="text-slate-200">{file.title}</span> · <code>{file.path}</code></li>)}{preview.files.length > 4 && <li>… dan {preview.files.length - 4} halaman lainnya</li>}</ul> : <p className="mt-3 flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Provenance Vault sudah lengkap.</p>}
        {preview.files.length > 0 && !applied && <>
          <label className="mt-4 flex items-start gap-2 text-xs text-slate-300"><input aria-label="Konfirmasi migrasi provenance" type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>Saya memahami preview ini akan menulis provenance dan dapat di-rollback. Frasa konfirmasi: <code className="text-cyan-200">{preview.confirmation.phrase}</code>.</span></label>
          <Button className="mt-3" size="sm" disabled={!confirmed || applyMutation.isPending} onClick={applyMigration}>{applyMutation.isPending && <Loader2 className="animate-spin" />} Terapkan migrasi dengan rollback</Button>
        </>}
      </div>}

      {applied && <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4"><p className="text-sm text-emerald-200">Migrasi {applied.status.toLowerCase()} untuk plan <code>{applied.planId}</code>.</p><p className="mt-1 text-xs text-slate-400">Artifact: <code>{applied.auditPath}</code></p><label className="mt-3 flex items-start gap-2 text-xs text-slate-300"><input aria-label="Konfirmasi rollback provenance" type="checkbox" checked={rollbackConfirmed} onChange={(event) => setRollbackConfirmed(event.target.checked)} /><span>Saya ingin memulihkan snapshot sebelum migrasi.</span></label><Button className="mt-3" size="sm" variant="destructive" disabled={!rollbackConfirmed || rollbackMutation.isPending} onClick={rollbackMigration}>{rollbackMutation.isPending && <Loader2 className="animate-spin" />} <RotateCcw /> Rollback migrasi</Button></div>}
    </section>
  )
}
