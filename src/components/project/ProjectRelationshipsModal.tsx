import React, { useEffect, useMemo, useState } from "react"
import { Link2, Loader2, Plus, Save, Trash2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useProjectRelationships, useProjects, useReplaceProjectRelationships } from "@/hooks/use-orchestrator"
import type { ProjectRelationship, ProjectRelationshipType } from "@/services/orchestrator"
import { toast } from "@/components/ui/toast"

interface ProjectRelationshipsModalProps {
  isOpen: boolean
  projectId: string | null
  onClose: () => void
}

type RelationshipDraft = ProjectRelationship & { key: string }

const relationshipTypes: ProjectRelationshipType[] = ["CONSUMES_API", "PROVIDES_API", "SHARES_SCHEMA", "DEPENDS_ON", "DEPLOYS_WITH"]

const splitValues = (value: string) => [...new Set(value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean))]

export const ProjectRelationshipsModal: React.FC<ProjectRelationshipsModalProps> = ({ isOpen, projectId, onClose }) => {
  const { data: projects = [] } = useProjects()
  const { data, isLoading } = useProjectRelationships(projectId, isOpen)
  const { mutateAsync: replaceRelationships, isPending } = useReplaceProjectRelationships()
  const [drafts, setDrafts] = useState<RelationshipDraft[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const availableTargets = useMemo(
    () => projects.filter((project) => project.id !== projectId).sort((left, right) => left.id.localeCompare(right.id)),
    [projects, projectId],
  )

  useEffect(() => {
    if (!data) return
    setDrafts(data.relationships.map((relationship, index) => ({ ...relationship, key: `${relationship.type}-${relationship.targetProjectId}-${index}` })))
  }, [data])

  useEffect(() => {
    if (!isOpen) return
    setConfirmed(false)
    setErrorMessage(null)
    setSuccessMessage(null)
  }, [isOpen, projectId])

  const updateDraft = (index: number, update: Partial<RelationshipDraft>) => {
    setDrafts((current) => current.map((draft, draftIndex) => draftIndex === index ? { ...draft, ...update } : draft))
  }

  const addDraft = () => {
    const targetProjectId = availableTargets[0]?.id ?? ""
    setDrafts((current) => [...current, { key: `new-${Date.now()}`, type: "CONSUMES_API", targetProjectId, contractPaths: [], verification: [] }])
    setConfirmed(false)
  }

  const handleSave = async () => {
    if (!projectId || !confirmed) {
      setErrorMessage("Centang konfirmasi human sebelum menyimpan perubahan relationship.")
      return
    }
    if (drafts.some((draft) => !availableTargets.some((project) => project.id === draft.targetProjectId))) {
      setErrorMessage("Semua target relationship harus berasal dari project yang terdaftar.")
      return
    }
    const relationships: ProjectRelationship[] = drafts.map((draft) => ({
      type: draft.type,
      targetProjectId: draft.targetProjectId,
      contractPaths: draft.contractPaths,
      verification: draft.verification,
    }))
    try {
      setErrorMessage(null)
      const result = await replaceRelationships({ projectId, relationships })
      setSuccessMessage(result.changed ? "Relationship berhasil disimpan dan diaudit." : "Tidak ada perubahan relationship.")
      setConfirmed(false)
      toast.add({ title: result.changed ? "Relationship Disimpan" : "Relationship Tidak Berubah", description: result.changed ? "Konfigurasi linked project sudah diperbarui." : "Konfigurasi tetap sama.", type: "success" })
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.message || "Gagal menyimpan relationship."
      setErrorMessage(message)
      toast.add({ title: "Gagal Menyimpan Relationship", description: message, type: "error" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl border border-slate-800 bg-slate-900 p-0 text-slate-100">
        <DialogHeader className="border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-600/15 text-emerald-400"><Link2 className="h-5 w-5" /></div>
            <div>
              <DialogTitle>Project Relationships</DialogTitle>
              <DialogDescription className="mt-1 text-xs text-slate-400">Atur relationship metadata untuk <span className="font-mono text-emerald-300">{projectId}</span>. Relationship tidak memberi akses tulis ke repository.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto p-6">
          {errorMessage && <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{errorMessage}</span></div>}
          {successMessage && <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300"><CheckCircle2 className="h-4 w-4 shrink-0" /><span>{successMessage}</span></div>}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-xs text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Memuat relationship...</div>
          ) : (
            <>
              {drafts.length === 0 && <p className="rounded-lg border border-dashed border-slate-700 p-5 text-center text-xs text-slate-500">Belum ada relationship. Tambahkan project terkait untuk mengaktifkan Linked Projects intake.</p>}
              <div className="space-y-3">
                {drafts.map((draft, index) => (
                  <div key={draft.key} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <label className="space-y-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Relationship type
                        <select value={draft.type} onChange={(event) => updateDraft(index, { type: event.target.value as ProjectRelationshipType })} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-normal normal-case tracking-normal text-slate-200">
                          {relationshipTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </label>
                      <label className="space-y-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Target registered project
                        <select value={draft.targetProjectId} onChange={(event) => updateDraft(index, { targetProjectId: event.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-normal normal-case tracking-normal text-slate-200">
                          <option value="" disabled>Select project</option>
                          {availableTargets.map((project) => <option key={project.id} value={project.id}>{project.id}</option>)}
                        </select>
                      </label>
                      <button type="button" onClick={() => setDrafts((current) => current.filter((_, draftIndex) => draftIndex !== index))} className="self-end rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20" aria-label={`Remove relationship ${index + 1}`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <label className="block space-y-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Contract paths <span className="font-normal normal-case tracking-normal text-slate-600">comma or newline separated</span>
                      <textarea value={draft.contractPaths.join(", ")} onChange={(event) => updateDraft(index, { contractPaths: splitValues(event.target.value) })} rows={2} placeholder="openapi.yaml, src/api/**" className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-normal normal-case tracking-normal text-slate-200 placeholder:text-slate-600" />
                    </label>
                    <label className="block space-y-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Configured verification checks <span className="font-normal normal-case tracking-normal text-slate-600">comma or newline separated</span>
                      <input value={draft.verification.join(", ")} onChange={(event) => updateDraft(index, { verification: splitValues(event.target.value) })} placeholder="test:contract" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-normal normal-case tracking-normal text-slate-200 placeholder:text-slate-600" />
                    </label>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addDraft} disabled={availableTargets.length === 0} className="flex items-center gap-2 rounded-lg border border-dashed border-emerald-500/40 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4" /> Add relationship</button>
              <label className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500" /><span>Saya mengonfirmasi perubahan relationship ini sebagai operator lokal. Perubahan akan dicatat di audit chain.</span></label>
            </>
          )}
        </div>

        <DialogFooter className="border-t border-slate-800 p-6">
          <button type="button" onClick={onClose} disabled={isPending} className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800">Cancel</button>
          <button type="button" onClick={handleSave} disabled={isPending || isLoading || !confirmed} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"><Save className="h-4 w-4" /> {isPending ? "Saving..." : "Save Relationships"}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
