import React, { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { AlertTriangle, CheckCircle2, FileDiff, Eye, Gauge, GitCommitHorizontal, ShieldCheck, Target, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAcceptObjective, useObjective, useObjectiveEvidence, useObjectives, usePreviewRun } from "@/hooks/use-orchestrator"
import type { ObjectiveEvidence, ObjectiveEvidenceNode, ObjectiveSummary } from "@/services/orchestrator"
import { CrossProjectIntegrationEvidence } from "./components/CrossProjectIntegrationEvidence"
import { ObjectiveGraph } from "./components/ObjectiveGraph"

const stateTone = (state: string) => {
  if (["DONE", "ACCEPTED", "PASS", "PASSED"].includes(state)) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
  if (["FAILED", "BLOCKED", "FAIL"].includes(state)) return "border-rose-500/30 bg-rose-500/10 text-rose-300"
  return "border-amber-500/30 bg-amber-500/10 text-amber-300"
}

const humanize = (value: string) => value.replaceAll("_", " ")

function StatusBadge({ state }: { state: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider ${stateTone(state)}`}>{humanize(state)}</span>
}

function SummaryList({ items }: { items: ObjectiveSummary[] }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Objectives</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Objective evidence center</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">Pilih objective untuk meninjau outcome node, diff, preview, verification, blocker, usage, dan final acceptance.</p>
      </div>
      {items.length === 0 ? <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">Belum ada objective.</div> : items.map((item) => (
        <Link key={item.objectiveId} to={`/objectives/${encodeURIComponent(item.objectiveId)}`} className="block rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-indigo-500/40 hover:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="font-mono text-xs text-indigo-300">{item.objectiveId}</p><h2 className="mt-1 text-sm font-semibold text-white">{item.request}</h2><p className="mt-1 text-xs text-slate-500">{item.projectIds.join(", ")}</p></div>
            <StatusBadge state={item.state} />
          </div>
        </Link>
      ))}
    </div>
  )
}

function NodeCard({ node, onPreview, previewing }: { node: ObjectiveEvidenceNode; onPreview: (runId: string) => void; previewing: boolean }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><p className="font-mono text-xs text-indigo-300">{node.nodeId} · {node.type}</p><h3 className="mt-1 text-sm font-semibold text-white">{node.title}</h3><p className="mt-1 text-xs text-slate-400">{node.projectId} · {node.role}</p></div>
        <StatusBadge state={node.state} />
      </div>
      <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
        <div><p className="text-[10px] uppercase tracking-wider text-slate-500">Run</p><p className="mt-1 break-all font-mono text-slate-300">{node.runId ?? "—"}</p></div>
        <div><p className="text-[10px] uppercase tracking-wider text-slate-500">Commit</p><p className="mt-1 break-all font-mono text-slate-300">{node.commitHash ?? "—"}</p></div>
        <div><p className="text-[10px] uppercase tracking-wider text-slate-500">Verification</p><p className="mt-1"><StatusBadge state={node.verificationStatus} /></p></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {node.links.evidence && <a className="inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200" href={node.links.evidence} target="_blank" rel="noreferrer"><ShieldCheck className="h-3.5 w-3.5" />Evidence</a>}
        {node.links.diff && <a className="inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200" href={node.links.diff} target="_blank" rel="noreferrer"><FileDiff className="h-3.5 w-3.5" />Diff</a>}
        {node.runId && <Button type="button" variant="link" size="sm" className="h-auto p-0 text-indigo-300" disabled={previewing} onClick={() => onPreview(node.runId!)}><Eye className="h-3.5 w-3.5" />Preview</Button>}
      </div>
      <p className="mt-3 text-xs text-slate-500">Changed paths: {node.changedPaths.length ? node.changedPaths.join(", ") : "Tidak ada"}</p>
      {node.error && <p className="mt-2 flex items-start gap-1.5 text-xs text-rose-300"><XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{node.error.message ?? "Node memiliki error."}</p>}
    </article>
  )
}

function EvidenceView({ evidence }: { evidence: ObjectiveEvidence }) {
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [previewMessage, setPreviewMessage] = useState<string | null>(null)
  const accept = useAcceptObjective()
  const preview = usePreviewRun()
  const objective = evidence.objective
  const handlePreview = async (runId: string) => {
    try {
      const result = await preview.mutateAsync(runId)
      setPreviewMessage(`Preview opened: ${result.workspacePath ?? runId}`)
    } catch (error) {
      setPreviewMessage(error instanceof Error ? error.message : "Preview tidak tersedia.")
    }
  }
  const handleAccept = async () => {
    await accept.mutateAsync(objective.objectiveId)
    setAcceptOpen(false)
  }
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><Link to="/objectives" className="text-xs text-indigo-300 hover:text-indigo-200">← Semua objectives</Link><div className="mt-3 flex items-center gap-3"><div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2.5 text-indigo-300"><Target className="h-5 w-5" /></div><div><p className="font-mono text-xs text-indigo-300">{objective.objectiveId}</p><h1 className="text-2xl font-semibold text-white">{objective.request}</h1></div></div></div>
        <div className="flex flex-col items-end gap-2"><StatusBadge state={objective.state} /><Button type="button" disabled={!evidence.finalAcceptance.canAccept || accept.isPending} onClick={() => setAcceptOpen(true)} className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500"><CheckCircle2 className="h-4 w-4" />Final Acceptance</Button></div>
      </div>

      {previewMessage && <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-200">{previewMessage}</div>}
      {evidence.finalAcceptance.state !== "ACCEPTED" && evidence.blockers.length > 0 && <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"><div className="flex items-center gap-2 text-amber-200"><AlertTriangle className="h-4 w-4" /><h2 className="text-sm font-semibold">Unresolved blockers</h2></div><div className="mt-3 space-y-2 text-xs text-amber-100/80">{evidence.blockers.map((blocker) => <div key={blocker.id} className="rounded-lg border border-amber-500/20 bg-slate-950/20 p-2"><span className="font-mono text-amber-200">{blocker.id}</span> · {blocker.message}</div>)}</div></section>}

      {objective.mode === "CROSS_PROJECT_INCIDENT" && evidence.integration && <CrossProjectIntegrationEvidence integration={evidence.integration} objectiveProjectIds={objective.projectIds} nodes={evidence.nodes} blockers={evidence.blockers} canAccept={evidence.finalAcceptance.canAccept} />}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">Orchestration</p><p className="mt-2 text-lg font-semibold text-white">{evidence.orchestration?.state ?? "NOT_STARTED"}</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">Nodes</p><p className="mt-2 text-lg font-semibold text-white">{evidence.nodes.filter((node) => node.state === "DONE").length} / {evidence.nodes.length} done</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">Verification</p><p className="mt-2"><StatusBadge state={evidence.verification.status} /></p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><p className="text-[10px] uppercase tracking-wider text-slate-500">Final review</p><p className="mt-2"><StatusBadge state={evidence.finalAcceptance.state} /></p></div>
      </section>

      <ObjectiveGraph objectiveId={objective.objectiveId} />

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><div className="flex items-center gap-2"><GitCommitHorizontal className="h-4 w-4 text-indigo-300" /><h2 className="text-sm font-semibold text-white">Node outcomes & evidence</h2></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{evidence.nodes.map((node) => <NodeCard key={node.nodeId} node={node} onPreview={handlePreview} previewing={preview.isPending} />)}</div></section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /><h2 className="text-sm font-semibold text-white">Aggregate verification</h2></div><div className="mt-4 flex items-center justify-between text-sm"><span className="text-slate-400">Integration</span><StatusBadge state={evidence.verification.integration.status} /></div>{evidence.integration?.artifactPath && <p className="mt-3 break-all font-mono text-[11px] text-slate-500">{evidence.integration.artifactPath}</p>}<div className="mt-4 space-y-2 text-xs text-slate-400">{evidence.verification.results.length ? evidence.verification.results.map((result, index) => <div key={`${String(result.script ?? result.command ?? "check")}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-800 p-2"><span>{String(result.script ?? result.command ?? "Verification")}</span><StatusBadge state={String(result.status ?? (result.passed ? "PASS" : "UNKNOWN"))} /></div>) : <p>Belum ada verification result.</p>}</div></section>
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-violet-300" /><h2 className="text-sm font-semibold text-white">Usage & budget</h2></div><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-lg bg-slate-950/60 p-3"><p className="text-lg font-semibold text-white">{evidence.usage.actual.totalTokens}</p><p className="text-slate-500">Tokens</p></div><div className="rounded-lg bg-slate-950/60 p-3"><p className="text-lg font-semibold text-white">{evidence.usage.actual.agentInvocations}</p><p className="text-slate-500">Invocations</p></div><div className="rounded-lg bg-slate-950/60 p-3"><p className="text-lg font-semibold text-white">{evidence.usage.actual.retries}</p><p className="text-slate-500">Retries</p></div></div><p className="mt-4 text-xs text-slate-400">Budget: {evidence.usage.budget.maxTotalTokens ?? "unlimited"} tokens · {evidence.usage.budget.maxSubtasks} nodes · {evidence.usage.budget.maxRetriesPerNode} retries/node</p><p className="mt-1 text-xs text-slate-500">Remaining tokens: {evidence.usage.remainingTokens ?? "unlimited"}</p></section>
      </div>

      <AlertDialog open={acceptOpen} onOpenChange={setAcceptOpen}><AlertDialogContent className="border border-slate-800 bg-slate-950 text-slate-100"><AlertDialogHeader><AlertDialogTitle>Confirm final acceptance</AlertDialogTitle><AlertDialogDescription className="text-slate-400">Acceptance akan membuat decision durable dan menandai objective sebagai DONE. Pastikan node outcomes, diff, preview, verification, blocker, dan usage sudah ditinjau.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={accept.isPending}>Batal</AlertDialogCancel><AlertDialogAction disabled={accept.isPending} onClick={(event) => { event.preventDefault(); void handleAccept() }} className="bg-emerald-600 text-white hover:bg-emerald-500">{accept.isPending ? "Menyimpan…" : "Accept objective"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  )
}

export const ObjectivePage: React.FC = () => {
  const { objectiveId } = useParams<{ objectiveId: string }>()
  const summaries = useObjectives()
  const objective = useObjective(objectiveId ?? null)
  const evidence = useObjectiveEvidence(objectiveId ?? null)
  if (!objectiveId) return summaries.isLoading ? <div className="p-6 text-slate-400">Memuat objectives…</div> : <SummaryList items={summaries.data ?? []} />
  if (objective.isLoading || evidence.isLoading) return <div className="p-6 text-slate-400">Memuat objective evidence…</div>
  if (objective.error || evidence.error || !evidence.data) return <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-200">Objective evidence tidak dapat dimuat. {objective.error?.message ?? evidence.error?.message ?? "Periksa objective ID."}</div>
  return <EvidenceView evidence={evidence.data} />
}

export default ObjectivePage
