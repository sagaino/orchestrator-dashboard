import React, { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { AlertTriangle, CheckCircle2, ExternalLink, FileDiff, Eye, Gauge, GitCommitHorizontal, Image, Layers3, RefreshCw, ShieldCheck, Square, Target, XCircle } from "lucide-react"
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
import { useAcceptDeliveryCertification, useAcceptObjective, useAggregatePreview, useCreateDeliveryCertification, useDeliveryCertification, useObjective, useObjectiveEvidence, useObjectives, usePreviewRun, useRequestObjectiveVisualChanges, useStopAggregatePreview } from "@/hooks/use-orchestrator"
import type { AggregatePreview, DeliveryCertification, ObjectiveEvidence, ObjectiveEvidenceNode, ObjectiveSummary, ObjectiveVisualEvidence } from "@/services/orchestrator"
import { CrossProjectIntegrationEvidence } from "./components/CrossProjectIntegrationEvidence"
import { ObjectiveGraph } from "./components/ObjectiveGraph"

const stateTone = (state: string) => {
  if (["DONE", "ACCEPTED", "CERTIFIED", "PASS", "PASSED"].includes(state)) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
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

function AggregatePreviewPanel({ preview, onStop, stopping }: { preview: AggregatePreview | null; onStop: () => void; stopping: boolean }) {
  if (!preview) return null
  return <section className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><div className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-cyan-300" /><h2 className="text-sm font-semibold text-white">Aggregate project preview</h2><StatusBadge state={preview.status} /></div><p className="mt-2 text-xs text-slate-400">Loopback-only URLs untuk project runnable. Preview unavailable tidak dihitung sebagai verification failure.</p></div>
      {preview.cleanup.status === "ACTIVE" && <Button type="button" variant="outline" size="sm" disabled={stopping} onClick={onStop} className="gap-2 border-slate-700 text-slate-200 hover:bg-slate-800"><Square className="h-3.5 w-3.5" />{stopping ? "Cleaning…" : "Stop preview"}</Button>}
    </div>
    <div className="mt-4 grid gap-3 lg:grid-cols-2">
      {preview.previews.map((item) => <div key={item.projectId} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3"><div className="flex items-center justify-between gap-2 text-xs"><span className="font-semibold text-emerald-200">{item.projectId}</span><StatusBadge state={item.status} /></div><a href={item.url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 break-all font-mono text-xs text-cyan-300 hover:text-cyan-200">{item.url}<ExternalLink className="h-3 w-3 shrink-0" /></a></div>)}
      {preview.unavailable.map((item, index) => <div key={`${item.projectId ?? "project"}-${index}`} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs"><div className="flex items-center justify-between gap-2"><span className="font-semibold text-amber-200">{item.projectId ?? "Unknown project"}</span><StatusBadge state="UNAVAILABLE" /></div><p className="mt-2 text-amber-100/80">{item.message ?? item.reason}</p><p className="mt-1 text-[11px] text-slate-500">Verification: NOT EVALUATED</p></div>)}
    </div>
  </section>
}

function ObjectiveVisualEvidencePanel({ report, onRepair, repairing }: { report?: ObjectiveVisualEvidence; onRepair: (nodeId: string, reason: string) => Promise<void>; repairing: boolean }) {
  const [repairNodeId, setRepairNodeId] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  if (!report) return null
  const submitRepair = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!repairNodeId || !reason.trim()) return
    try {
      await onRepair(repairNodeId, reason.trim())
      setMessage("Repair path disetujui dan revision lifecycle sudah dimulai.")
      setRepairNodeId(null)
      setReason("")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Repair path tidak dapat dibuat.")
    }
  }
  return <section className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Image className="h-4 w-4 text-violet-300" /><h2 className="text-sm font-semibold text-white">Objective visual & E2E evidence</h2></div><p className="mt-2 text-xs text-slate-400">Report ini menautkan evidence per-run; artifact screenshot tidak diduplikasi. Ownership tetap terlihat per node dan project.</p></div><div className="text-right text-[11px] text-slate-400"><div>{report.summary.evidenceCount} visual checks · {report.summary.captureCount} captures</div><div>{report.summary.projectCount} project · {report.summary.viewports.join(", ") || "No viewport"}</div></div></div>
    <div className="mt-4 space-y-3">{report.nodes.map((node) => <div key={node.nodeId} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-mono text-xs text-violet-200">{node.nodeId} · {node.projectId}</p><p className="mt-1 text-[11px] text-slate-500">Run: {node.runId ?? "—"} · State: {node.runState ?? "NO_RUN"}</p></div>{node.requestChanges.available && <Button type="button" variant="outline" size="sm" disabled={repairing} onClick={() => { setRepairNodeId(node.nodeId); setMessage(null) }} className="gap-1.5 border-violet-500/30 text-violet-200 hover:bg-violet-500/10"><RefreshCw className="h-3.5 w-3.5" />Request changes</Button>}</div>
      {node.verificationChecks.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{node.verificationChecks.map((check, index) => <span key={`${String(check.command ?? check.script ?? "check")}-${index}`} className="rounded border border-slate-700 px-2 py-1 text-[10px] text-slate-300">{String(check.command ?? check.script ?? "check")} · {String(check.status ?? "UNKNOWN")}</span>)}</div>}
      {node.evidenceRefs.length === 0 ? <p className="mt-3 text-xs text-slate-500">Belum ada visual capture untuk node ini; status visual tetap UNKNOWN.</p> : <div className="mt-3 grid gap-2 lg:grid-cols-2">{node.evidenceRefs.map((item) => <div key={item.evidenceId} className="rounded border border-slate-800 p-2 text-[11px]"><div className="flex items-center justify-between gap-2"><a href={item.href} target="_blank" rel="noreferrer" className="font-mono text-violet-200 hover:text-violet-100">{item.evidenceId}</a><span className="text-slate-500">{item.viewport.name} · {item.viewport.width}×{item.viewport.height}</span></div><p className="mt-1 text-slate-400">Route: <span className="font-mono text-slate-200">{item.route}</span></p><p className="mt-1 text-slate-500">Comparison: <span className="text-slate-300">{item.checks.comparisonStatus}</span> · Accessibility: <span className="text-slate-300">{item.checks.accessibilityStatus}</span></p></div>)}</div>}
      {node.captureRefs.length > 0 && <p className="mt-3 text-[11px] text-slate-500">Capture jobs: {node.captureRefs.map((capture) => `${capture.captureId} (${capture.status})`).join(", ")}</p>}
      {repairNodeId === node.nodeId && <form onSubmit={submitRepair} className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3"><label className="text-[11px] text-violet-200" htmlFor={`repair-reason-${node.nodeId}`}>Alasan request changes</label><textarea id={`repair-reason-${node.nodeId}`} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Contoh: perbaiki overflow pada mobile viewport" className="mt-2 min-h-20 w-full rounded border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200 outline-none focus:border-violet-400" /><div className="mt-2 flex justify-end gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => setRepairNodeId(null)}>Batal</Button><Button type="submit" size="sm" disabled={repairing || !reason.trim()} className="gap-1.5 bg-violet-600 text-white hover:bg-violet-500">{repairing ? "Memulai…" : "Approve repair"}</Button></div></form>}
    </div>)}</div>
    {message && <p className="mt-3 text-xs text-violet-200">{message}</p>}
  </section>
}

function DeliveryCertificationPanel({ certification, canRun, onRun, onAccept, running, accepting }: { certification: DeliveryCertification | null; canRun: boolean; onRun: () => Promise<void>; onAccept: () => Promise<void>; running: boolean; accepting: boolean }) {
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const run = async () => {
    try {
      await onRun()
      setMessage(null)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delivery certification tidak dapat dibuat.")
    }
  }
  const accept = async () => {
    try {
      await onAccept()
      setAcceptOpen(false)
      setMessage(null)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delivery certification tidak dapat diterima.")
    }
  }
  return <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /><h2 className="text-sm font-semibold text-white">Delivery certification</h2>{certification && <StatusBadge state={certification.status} />}</div><p className="mt-2 max-w-2xl text-xs text-slate-400">Satu bundle durable yang memeriksa plan, execution, integration, preview, visual/E2E evidence, human acceptance, cleanup, dan knowledge capture.</p></div>
      <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" disabled={!canRun || running} onClick={() => void run()} className="border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10">{running ? "Checking…" : certification ? "Re-run certification" : "Run delivery certification"}</Button>{certification?.status === "HUMAN_GATE_REQUIRED" && <Button type="button" size="sm" disabled={accepting} onClick={() => setAcceptOpen(true)} className="bg-emerald-600 text-white hover:bg-emerald-500">Accept delivery certification</Button>}</div>
    </div>
    {!canRun && !certification && <p className="mt-3 text-xs text-amber-200">Jalankan setelah objective final acceptance berstatus ACCEPTED.</p>}
    {certification && <>
      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3"><div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3"><p className="text-slate-500">Certification ID</p><p className="mt-1 break-all font-mono text-slate-200">{certification.certificationId}</p></div><div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3"><p className="text-slate-500">Machine checks</p><p className="mt-1 font-semibold text-white">{certification.checks.filter((check) => check.passed).length} / {certification.checks.length} PASS</p></div><div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3"><p className="text-slate-500">Human gate</p><p className="mt-1 text-slate-200">{certification.humanGate.confirmed ? `Accepted by ${certification.humanGate.approvedBy ?? "operator"}` : "Required"}</p></div></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{certification.checks.map((check) => <div key={check.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/30 p-3 text-xs"><div><p className="font-mono text-slate-200">{check.id}</p><p className="mt-1 text-slate-500">{check.message}</p></div><StatusBadge state={check.status} /></div>)}</div>
      {certification.blockers.length > 0 && <p className="mt-3 text-xs text-rose-300">Blockers: {certification.blockers.join(", ")}</p>}
      <p className="mt-3 text-xs text-slate-500">{certification.nextAction}</p>
    </>}
    {message && <p className="mt-3 text-xs text-rose-300">{message}</p>}
    <AlertDialog open={acceptOpen} onOpenChange={setAcceptOpen}><AlertDialogContent className="border border-slate-800 bg-slate-950 text-slate-100"><AlertDialogHeader><AlertDialogTitle>Accept delivery certification</AlertDialogTitle><AlertDialogDescription className="text-slate-400">Human gate ini mengunci bundle certification setelah seluruh machine checks lulus. Pastikan evidence delivery sudah ditinjau.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={accepting}>Batal</AlertDialogCancel><AlertDialogAction disabled={accepting} onClick={(event) => { event.preventDefault(); void accept() }} className="bg-emerald-600 text-white hover:bg-emerald-500">{accepting ? "Menyimpan…" : "Accept certification"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>
}

function EvidenceView({ evidence }: { evidence: ObjectiveEvidence }) {
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [previewMessage, setPreviewMessage] = useState<string | null>(null)
  const [aggregatePreview, setAggregatePreview] = useState<AggregatePreview | null>(null)
  const accept = useAcceptObjective()
  const preview = usePreviewRun()
  const aggregate = useAggregatePreview()
  const stopAggregate = useStopAggregatePreview()
  const visualRepair = useRequestObjectiveVisualChanges()
  const objective = evidence.objective
  const delivery = useDeliveryCertification(objective.objectiveId)
  const createDelivery = useCreateDeliveryCertification()
  const acceptDelivery = useAcceptDeliveryCertification()
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
  const handleAggregatePreview = async () => {
    try {
      setAggregatePreview(await aggregate.mutateAsync({ objectiveId: objective.objectiveId }))
    } catch (error) {
      setPreviewMessage(error instanceof Error ? error.message : "Aggregate preview tidak tersedia.")
    }
  }
  const handleStopAggregatePreview = async () => {
    if (!aggregatePreview) return
    setAggregatePreview(await stopAggregate.mutateAsync({ objectiveId: objective.objectiveId, sessionId: aggregatePreview.sessionId }))
  }
  const handleVisualRepair = async (nodeId: string, reason: string) => {
    await visualRepair.mutateAsync({ objectiveId: objective.objectiveId, nodeId, reason })
    setPreviewMessage(`Visual repair untuk ${nodeId} disetujui.`)
  }
  const handleDeliveryRun = async () => {
    await createDelivery.mutateAsync(objective.objectiveId)
  }
  const handleDeliveryAccept = async () => {
    await acceptDelivery.mutateAsync({ objectiveId: objective.objectiveId, certificationId: delivery.data?.latest?.certificationId })
  }
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><Link to="/objectives" className="text-xs text-indigo-300 hover:text-indigo-200">← Semua objectives</Link><div className="mt-3 flex items-center gap-3"><div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2.5 text-indigo-300"><Target className="h-5 w-5" /></div><div><p className="font-mono text-xs text-indigo-300">{objective.objectiveId}</p><h1 className="text-2xl font-semibold text-white">{objective.request}</h1></div></div></div>
        <div className="flex flex-col items-end gap-2"><StatusBadge state={objective.state} /><div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={aggregate.isPending || aggregatePreview?.cleanup.status === "ACTIVE"} onClick={() => void handleAggregatePreview()} className="gap-2 border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"><Layers3 className="h-4 w-4" />{aggregate.isPending ? "Starting preview…" : "Aggregate preview"}</Button><Button type="button" disabled={!evidence.finalAcceptance.canAccept || accept.isPending} onClick={() => setAcceptOpen(true)} className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500"><CheckCircle2 className="h-4 w-4" />Final Acceptance</Button></div></div>
      </div>

      {previewMessage && <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-200">{previewMessage}</div>}
      <AggregatePreviewPanel preview={aggregatePreview} onStop={() => void handleStopAggregatePreview()} stopping={stopAggregate.isPending} />
      <ObjectiveVisualEvidencePanel report={evidence.visualEvidence} onRepair={handleVisualRepair} repairing={visualRepair.isPending} />
      <DeliveryCertificationPanel certification={delivery.data?.latest ?? null} canRun={evidence.finalAcceptance.state === "ACCEPTED"} onRun={handleDeliveryRun} onAccept={handleDeliveryAccept} running={createDelivery.isPending} accepting={acceptDelivery.isPending} />
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
