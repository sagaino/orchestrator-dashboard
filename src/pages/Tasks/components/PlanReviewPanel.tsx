import React, { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, ChevronRight, CircleDot, FileCheck2, GitBranch, Layers3, ShieldAlert, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PlanReviewPanelProps } from "../types"

const EmptyValue = () => <span className="text-slate-500">Tidak ditentukan</span>

const toneForState = (state: string) => {
  if (state === "APPROVED") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
  if (state === "SUPERSEDED" || state === "CANCELLED") return "border-slate-700 bg-slate-800 text-slate-400"
  return "border-amber-500/30 bg-amber-500/10 text-amber-300"
}

const humanize = (value: string) => value.replaceAll("_", " ")

export const PlanReviewPanel: React.FC<PlanReviewPanelProps> = ({
  isOpen,
  objective,
  plan,
  decisions = [],
  actionLoading = false,
  onClose,
  onApprove,
  onRequestChanges,
  onCancel,
  skillCatalog,
  onAssignSkills,
}) => {
  const [requestMode, setRequestMode] = useState(false)
  const [reason, setReason] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<Record<string, string>>({})
  const [skillMessage, setSkillMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!plan) return
    const next = Object.fromEntries(plan.nodes.flatMap((node) => node.skills?.[0] ? [[node.nodeId, `${node.skills[0].skillId}@${node.skills[0].version}`]] : []))
    setSelectedSkills(next)
    setSkillMessage(null)
  }, [plan])

  if (!objective || !plan) return null

  const canApprove = plan.state === "PENDING_APPROVAL" && !plan.clarificationNeeded && objective.state !== "CANCELLED"
  const canMaterialize = plan.state === "APPROVED" && !objective.activeOrchestrationId && objective.state !== "CANCELLED"
  const canCancel = objective.state !== "CANCELLED" && plan.state !== "CANCELLED"
  const submitChanges = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = reason.trim()
    if (!trimmed) return
    await onRequestChanges(trimmed)
    setReason("")
    setRequestMode(false)
  }
  const compatibleSkills = (node: typeof plan.nodes[number]) => skillCatalog.skills.filter((skill) => (
    skill.enabled
    &&
    (skill.supportedRoles.includes(node.role) || skill.supportedRoles.includes("GENERAL"))
    && (skill.supportedTaskTypes.includes(node.type) || skill.supportedTaskTypes.includes("ANY"))
  ))
  const submitSkills = async () => {
    const assignments = plan.nodes.flatMap((node) => {
      const identity = selectedSkills[node.nodeId]
      const skill = compatibleSkills(node).find((candidate) => `${candidate.skillId}@${candidate.version}` === identity)
      return skill ? [{ nodeId: node.nodeId, skillId: skill.skillId, version: skill.version, checksum: skill.instructionChecksum }] : []
    })
    if (!assignments.length) return
    await onAssignSkills(assignments)
    setSkillMessage(`${assignments.length} skill assignment dipilih dan dibuat sebagai plan revision baru.`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !actionLoading && onClose()}>
      <DialogContent aria-describedby="plan-review-description" className="max-h-[92vh] max-w-5xl overflow-y-auto border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2.5 text-indigo-300">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg text-white">Plan Review</DialogTitle>
                <DialogDescription id="plan-review-description" className="mt-1 text-xs leading-relaxed text-slate-400">
                  Periksa scope, dependency, budget, dan warning sebelum memberi approval untuk revision ini. Approval plan bukan final result acceptance.
                </DialogDescription>
              </div>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider ${toneForState(plan.state)}`}>
              {humanize(plan.state)}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <section className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-indigo-300">{objective.objectiveId} · {plan.planId}</p>
                <h3 className="mt-1 text-sm font-semibold text-white">{plan.summary}</h3>
                <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-400">{objective.request}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                <div className="rounded-lg bg-slate-950/70 px-3 py-2"><p className="text-lg font-bold text-white">r{plan.planId.match(/-r(\d+)$/)?.[1] ?? plan.revision}</p><p className="text-[10px] text-slate-500">Revision</p></div>
                <div className="rounded-lg bg-slate-950/70 px-3 py-2"><p className="text-lg font-bold text-indigo-300">{plan.nodes.length}</p><p className="text-[10px] text-slate-500">Nodes</p></div>
                <div className="rounded-lg bg-slate-950/70 px-3 py-2"><p className="text-lg font-bold text-violet-300">{plan.projects.length}</p><p className="text-[10px] text-slate-500">Projects</p></div>
                <div className="rounded-lg bg-slate-950/70 px-3 py-2"><p className="text-lg font-bold text-amber-300">{plan.estimatedTokens ?? "—"}</p><p className="text-[10px] text-slate-500">Est. tokens</p></div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 border-t border-indigo-500/15 pt-3 text-xs sm:grid-cols-3">
              <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Projects</p><p className="mt-1 text-slate-200">{plan.projects.join(", ")}</p></div>
              <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Risk / Complexity</p><p className="mt-1 text-slate-200">{plan.risk} · {plan.complexity}</p></div>
              <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Fingerprint</p><p className="mt-1 break-all font-mono text-[10px] text-slate-400">{plan.planFingerprint ?? "Belum tersedia"}</p></div>
            </div>
          </section>

          {plan.clarificationNeeded && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div><strong>Klarifikasi diperlukan.</strong><p className="mt-1 text-amber-200/80">{plan.clarificationQuestion || "Planner meminta klarifikasi sebelum plan dapat disetujui."}</p></div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-200"><Layers3 className="h-4 w-4 text-violet-400" />Architecture Decisions</h4>
              {plan.architectureDecisions.length ? <ul className="space-y-2">{plan.architectureDecisions.map((item, index) => <li key={`${index}-${item}`} className="flex gap-2 text-xs leading-relaxed text-slate-400"><span className="font-mono text-violet-400">{index + 1}.</span><span>{item}</span></li>)}</ul> : <EmptyValue />}
            </section>
            <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-200"><CircleDot className="h-4 w-4 text-sky-400" />Assumptions & Warnings</h4>
              {plan.assumptions.length ? <ul className="space-y-2">{plan.assumptions.map((item, index) => <li key={`${index}-${item}`} className="flex gap-2 text-xs leading-relaxed text-slate-400"><span className="font-mono text-sky-400">{index + 1}.</span><span>{item}</span></li>)}</ul> : <EmptyValue />}
            </section>
          </div>

          <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-200"><GitBranch className="h-4 w-4 text-indigo-400" />Dependency Graph / Subtasks</h4>
              <span className="text-[10px] text-slate-500">Edges ditampilkan sebagai predecessor ID</span>
            </div>
            <div className="space-y-3">
              {plan.nodes.map((node, index) => (
                <article key={node.nodeId} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span className="mt-0.5 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 font-mono text-[10px] font-semibold text-indigo-300">{node.nodeId}</span>
                      <div className="min-w-0"><h5 className="text-xs font-semibold text-white">{node.title}</h5><p className="mt-1 text-[11px] leading-relaxed text-slate-400">{node.purpose}</p></div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-300">{node.role}</span>
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-300">Risk {node.risk}</span>
                      <span className={`rounded-full border px-2 py-0.5 ${node.canRunInParallel ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-slate-700 bg-slate-800 text-slate-400"}`}>{node.canRunInParallel ? "Parallel eligible" : "Sequential"}</span>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 border-t border-slate-800 pt-3 text-[11px] md:grid-cols-2 xl:grid-cols-4">
                    <div><p className="font-semibold uppercase tracking-wider text-[9px] text-slate-600">Project / Type</p><p className="mt-1 text-slate-300">{node.projectId} · {node.type}</p></div>
                    <div><p className="font-semibold uppercase tracking-wider text-[9px] text-slate-600">Dependencies</p><p className="mt-1 text-slate-300">{node.dependsOn.length ? node.dependsOn.join(" → ") : "None (root node)"}</p></div>
                    <div><p className="font-semibold uppercase tracking-wider text-[9px] text-slate-600">Allowed Paths</p>{node.allowedPaths.length ? <ul className="mt-1 space-y-0.5">{node.allowedPaths.map((item) => <li key={item} className="break-all font-mono text-slate-400">{item}</li>)}</ul> : <p className="mt-1 text-slate-500">Read-only</p>}</div>
                    <div><p className="font-semibold uppercase tracking-wider text-[9px] text-slate-600">Verification</p>{node.verification.length ? <ul className="mt-1 space-y-0.5">{node.verification.map((item) => <li key={item} className="font-mono text-slate-400">{item}</li>)}</ul> : <p className="mt-1 text-slate-500">None</p>}</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
                    <span>Acceptance: {node.acceptanceCriteria.length}</span><span>•</span><span>Complexity: {node.complexity}</span><span>•</span><span>{node.requiresChanges ? "Writes required" : "No product-code writes"}</span>
                  </div>
                  <div className="mt-3 border-t border-violet-500/20 pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-2"><label htmlFor={`skill-assignment-${node.nodeId}`} className="text-[10px] font-semibold uppercase tracking-wider text-violet-300">Manual skill assignment</label>{node.skills?.length ? <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-200">{node.skills.map((skill) => `${skill.skillId}@${skill.version}`).join(", ")}</span> : <span className="text-[10px] text-slate-500">No skill</span>}</div>
                    {skillCatalog.skills.length === 0 ? <p className="mt-2 text-[11px] text-slate-500">Registry skill kosong. Node tetap menggunakan general role agent fallback.</p> : <select id={`skill-assignment-${node.nodeId}`} aria-label={`Skill assignment ${node.nodeId}`} value={selectedSkills[node.nodeId] ?? ""} onChange={(event) => setSelectedSkills((current) => ({ ...current, [node.nodeId]: event.target.value }))} disabled={actionLoading || plan.state !== "PENDING_APPROVAL"} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-violet-400"><option value="">No skill selected</option>{compatibleSkills(node).map((skill) => <option key={`${skill.skillId}@${skill.version}`} value={`${skill.skillId}@${skill.version}`}>{skill.skillId}@{skill.version} · {skill.purpose}</option>)}</select>}
                  </div>
                  {index < plan.nodes.length - 1 && <ChevronRight className="mx-auto mt-2 hidden h-3 w-3 text-slate-700 md:block" aria-hidden="true" />}
                </article>
              ))}
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-200"><ShieldAlert className="h-4 w-4 text-amber-400" />Budget Ceiling</h4>
              <div className="grid grid-cols-2 gap-2 text-center text-[11px] sm:grid-cols-5">
                <div className="rounded-lg bg-slate-900 p-2"><p className="font-semibold text-white">{objective.budget.maxSubtasks}</p><p className="text-slate-500">Max nodes</p></div>
                <div className="rounded-lg bg-slate-900 p-2"><p className="font-semibold text-white">{objective.budget.maxParallelAgents}</p><p className="text-slate-500">Parallel</p></div>
                <div className="rounded-lg bg-slate-900 p-2"><p className="font-semibold text-white">{objective.budget.maxRetriesPerNode}</p><p className="text-slate-500">Retries</p></div>
                <div className="rounded-lg bg-slate-900 p-2"><p className="font-semibold text-white">{objective.budget.maxTotalTokens ?? "—"}</p><p className="text-slate-500">Tokens</p></div>
                <div className="rounded-lg bg-slate-900 p-2"><p className="font-semibold text-white">{objective.budget.deadlineAt ? new Date(objective.budget.deadlineAt).toLocaleDateString("id-ID") : "—"}</p><p className="text-slate-500">Deadline</p></div>
              </div>
            </section>
            <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-200"><CheckCircle2 className="h-4 w-4 text-emerald-400" />Integration Checks</h4>
              <div className="space-y-2 text-[11px] text-slate-400"><p>Required: <span className="text-slate-200">{plan.integration.required ? "Yes" : "No"}</span></p><p>Preview: <span className="text-slate-200">{plan.integration.previewRequired ? "Required" : "Not required"}</span></p><p>Project verification: <span className="text-slate-200">{plan.integration.projectVerification.length ? plan.integration.projectVerification.join(", ") : "None"}</span></p><p>Cross-project verification: <span className="text-slate-200">{plan.integration.crossProjectVerification.length ? plan.integration.crossProjectVerification.join(", ") : "None"}</span></p></div>
            </section>
          </div>

          {decisions.length > 0 && <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><h4 className="mb-3 text-xs font-semibold text-slate-200">Decisions & Audit</h4><ul className="space-y-2">{decisions.slice(-5).map((decision) => <li key={decision.decisionId} className="flex flex-wrap items-center justify-between gap-2 text-[11px]"><span className="font-mono text-slate-400">{decision.type} · {decision.decisionId}</span><span className="text-slate-500">{decision.resolution ? `${decision.resolution.action} · ${decision.resolution.resolvedBy}` : decision.state}</span></li>)}</ul></section>}

          <section className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h4 className="text-xs font-semibold text-violet-200">Skill registry</h4><p className="mt-1 text-[11px] text-slate-400">Catalog read-only: {skillCatalog.registryState}. Assignment hanya membuat revision baru dan tidak memuat instruksi penuh ke plan.</p></div>{plan.state === "PENDING_APPROVAL" && skillCatalog.skills.length > 0 && <button type="button" disabled={actionLoading || !Object.values(selectedSkills).some(Boolean)} onClick={() => void submitSkills()} className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50">{actionLoading ? "Menyimpan..." : "Assign selected skills"}</button>}</div>{skillMessage && <p className="mt-3 text-xs text-violet-200">{skillMessage}</p>}</section>

          {requestMode && (
            <form onSubmit={submitChanges} className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <label htmlFor="plan-change-reason" className="block text-xs font-semibold text-amber-200">Alasan request plan revision</label>
              <textarea id="plan-change-reason" required rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Tuliskan bagian plan yang perlu diubah..." className="mt-2 w-full resize-none rounded-lg border border-amber-500/30 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus-visible:ring-2 focus-visible:ring-amber-500" />
              <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setRequestMode(false)} disabled={actionLoading} className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">Batal</button><button type="submit" disabled={actionLoading || !reason.trim()} className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50">{actionLoading ? "Mengirim..." : "Kirim Request Revision"}</button></div>
            </form>
          )}
        </div>

        <DialogFooter className="-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:justify-between">
          <div className="flex gap-2"><button type="button" disabled={actionLoading} onClick={onClose} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50">Tutup</button>{canCancel && <button type="button" disabled={actionLoading} onClick={onCancel} className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-50"><XCircle className="h-3.5 w-3.5" />Cancel Objective</button>}</div>
          <div className="flex gap-2">{plan.state === "PENDING_APPROVAL" && <button type="button" disabled={actionLoading || requestMode} onClick={() => setRequestMode(true)} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-50">Request Plan Revision</button>}{canApprove || canMaterialize ? <button type="button" disabled={actionLoading} onClick={onApprove} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"><CheckCircle2 className="h-3.5 w-3.5" />{actionLoading ? "Memulai..." : canMaterialize ? "Materialize & Run" : "Approve & Run"}</button> : plan.state === "APPROVED" ? <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />Plan Materialized</span> : null}</div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
