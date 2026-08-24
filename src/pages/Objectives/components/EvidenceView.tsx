import React from "react"
import { Link } from "react-router-dom"
import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  GitCommitHorizontal,
  Layers3,
  ShieldCheck,
  Target,
  TestTube2,
} from "lucide-react"
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
import { StatusBadge } from "./StatusBadge"
import { ObjectiveRequestHeading } from "./ObjectiveRequestHeading"
import { ObjectivePlanGate } from "./ObjectivePlanGate"
import { AggregatePreviewPanel } from "./AggregatePreviewPanel"
import { ObjectiveVisualEvidencePanel } from "./ObjectiveVisualEvidencePanel"
import { DeliveryCertificationPanel } from "./DeliveryCertificationPanel"
import { CrossProjectIntegrationEvidence } from "./CrossProjectIntegrationEvidence"
import { ObjectiveGraph } from "./ObjectiveGraph"
import { NodeCard } from "./NodeCard"
import { useEvidenceView } from "../hooks/useEvidenceView"
import type { EvidenceViewProps } from "../types"

export const EvidenceView: React.FC<EvidenceViewProps> = ({ evidence, lifecycle }) => {
  const {
    acceptOpen,
    setAcceptOpen,
    previewMessage,
    aggregatePreview,
    delivery,
    previewPending,
    acceptPending,
    aggregatePending,
    stopAggregatePending,
    visualRepairPending,
    createDeliveryPending,
    acceptDeliveryPending,
    integrationPending,
    handlePreview,
    handleAccept,
    handleAggregatePreview,
    handleStopAggregatePreview,
    handleVisualRepair,
    handleDeliveryRun,
    handleDeliveryAccept,
    handleIntegration,
  } = useEvidenceView(evidence)

  const objective = evidence.objective
  const integrationState = String(
    (evidence.orchestration?.integration as { state?: string } | undefined)?.state
      ?? evidence.integration?.status
      ?? evidence.verification.integration.status
      ?? "NOT_READY",
  )
  const allNodesDone = evidence.nodes.length > 0 && evidence.nodes.every((node) => node.state === "DONE")
  const integrationRequired = evidence.plan?.integration.required === true || evidence.verification.integration.required === true
  const integrationFinished = ["PASS", "PASSED", "DONE"].includes(integrationState)
  const integrationRunning = ["RUNNING", "INTEGRATING"].includes(integrationState)
  const canRunIntegration = integrationRequired && allNodesDone && !integrationFinished && !integrationRunning
  const integrationLabel = integrationFinished
    ? "Integration Verified"
    : integrationState === "BLOCKED" || integrationState === "FAILED"
      ? "Retry Integration Verification"
      : "Run Integration Verification"
  return (
    <div className="w-full space-y-6">
      <Link to="/objectives" className="text-xs text-indigo-300 hover:text-indigo-200">
        ← Semua objectives
      </Link>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 shrink-0 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2.5 text-indigo-300">
            <Target className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="mb-1 font-mono text-xs text-indigo-300">{objective.objectiveId}</p>
            <ObjectiveRequestHeading request={objective.request} />
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
          <StatusBadge state={objective.state} />
          <ObjectivePlanGate lifecycle={lifecycle} />
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {integrationRequired && (
              <Button
                type="button"
                variant="outline"
                disabled={!canRunIntegration || integrationPending}
                onClick={() => void handleIntegration()}
                className="gap-2 border-violet-500/30 text-violet-200 hover:bg-violet-500/10"
                title={!allNodesDone ? "Menunggu seluruh node selesai." : integrationRunning ? "Integration verification sedang berjalan." : undefined}
              >
                <TestTube2 className="h-4 w-4" />
                {integrationPending ? "Running integration…" : integrationRunning ? "Integration running…" : integrationLabel}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              disabled={aggregatePending || aggregatePreview?.cleanup.status === "ACTIVE"}
              onClick={() => void handleAggregatePreview()}
              className="gap-2 border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"
            >
              <Layers3 className="h-4 w-4" />
              {aggregatePending ? "Starting preview…" : "Aggregate preview"}
            </Button>
            <Button
              type="button"
              disabled={!evidence.finalAcceptance.canAccept || acceptPending}
              onClick={() => setAcceptOpen(true)}
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
            >
              <CheckCircle2 className="h-4 w-4" />
              Final Acceptance
            </Button>
          </div>
        </div>
      </div>

      {previewMessage && (
        <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-200">
          {previewMessage}
        </div>
      )}

      <AggregatePreviewPanel
        preview={aggregatePreview}
        onStop={() => void handleStopAggregatePreview()}
        stopping={stopAggregatePending}
      />

      <ObjectiveVisualEvidencePanel
        report={evidence.visualEvidence}
        onRepair={handleVisualRepair}
        repairing={visualRepairPending}
      />

      <DeliveryCertificationPanel
        certification={delivery}
        canRun={evidence.finalAcceptance.state === "ACCEPTED"}
        onRun={handleDeliveryRun}
        onAccept={handleDeliveryAccept}
        running={createDeliveryPending}
        accepting={acceptDeliveryPending}
      />

      {evidence.finalAcceptance.state !== "ACCEPTED" && evidence.blockers.length > 0 && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <h2 className="text-sm font-semibold">Unresolved blockers</h2>
          </div>
          <div className="mt-3 space-y-2 text-xs text-amber-100/80">
            {evidence.blockers.map((blocker) => (
              <div key={blocker.id} className="rounded-lg border border-amber-500/20 bg-slate-950/20 p-2">
                <span className="font-mono text-amber-200">{blocker.id}</span> · {blocker.message}
              </div>
            ))}
          </div>
        </section>
      )}

      {objective.mode === "CROSS_PROJECT_INCIDENT" && evidence.integration && (
        <CrossProjectIntegrationEvidence
          integration={evidence.integration}
          objectiveProjectIds={objective.projectIds}
          nodes={evidence.nodes}
          blockers={evidence.blockers}
          canAccept={evidence.finalAcceptance.canAccept}
        />
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Orchestration</p>
          <p className="mt-2 text-lg font-semibold text-white">{evidence.orchestration?.state ?? "NOT_STARTED"}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Nodes</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {evidence.nodes.filter((node) => node.state === "DONE").length} / {evidence.nodes.length} done
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Verification</p>
          <div className="mt-2">
            <StatusBadge state={evidence.verification.status} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Final review</p>
          <div className="mt-2">
            <StatusBadge state={evidence.finalAcceptance.state} />
          </div>
        </div>
      </section>

      <ObjectiveGraph objectiveId={objective.objectiveId} />

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center gap-2">
          <GitCommitHorizontal className="h-4 w-4 text-indigo-300" />
          <h2 className="text-sm font-semibold text-white">Node outcomes & evidence</h2>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {evidence.nodes.map((node) => (
            <NodeCard
              key={node.nodeId}
              node={node}
              onPreview={(runId) => void handlePreview(runId)}
              previewing={previewPending}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <h2 className="text-sm font-semibold text-white">Aggregate verification</h2>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-400">Integration</span>
            <StatusBadge state={evidence.verification.integration.status} />
          </div>
          {evidence.integration?.artifactPath && (
            <p className="mt-3 break-all font-mono text-[11px] text-slate-500">{evidence.integration.artifactPath}</p>
          )}
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            {evidence.verification.results.length ? (
              evidence.verification.results.map((result, index) => (
                <div
                  key={`${String(result.script ?? result.command ?? "check")}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-slate-800 p-2"
                >
                  <span>{String(result.script ?? result.command ?? "Verification")}</span>
                  <StatusBadge state={String(result.status ?? (result.passed ? "PASS" : "UNKNOWN"))} />
                </div>
              ))
            ) : (
              <p>Belum ada verification result.</p>
            )}
          </div>
        </section>
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-violet-300" />
            <h2 className="text-sm font-semibold text-white">Usage & budget</h2>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-slate-950/60 p-3">
              <p className="text-lg font-semibold text-white">{evidence.usage.actual.totalTokens}</p>
              <p className="text-slate-500">Tokens</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-3">
              <p className="text-lg font-semibold text-white">{evidence.usage.actual.agentInvocations}</p>
              <p className="text-slate-500">Invocations</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-3">
              <p className="text-lg font-semibold text-white">{evidence.usage.actual.retries}</p>
              <p className="text-slate-500">Retries</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Budget: {evidence.usage.budget.maxTotalTokens ?? "unlimited"} tokens · {evidence.usage.budget.maxSubtasks} nodes · {evidence.usage.budget.maxRetriesPerNode} retries/node
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Remaining tokens: {evidence.usage.remainingTokens ?? "unlimited"}
          </p>
        </section>
      </div>

      <AlertDialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <AlertDialogContent className="max-w-lg border border-slate-800 bg-slate-900 text-slate-100">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-white">Confirm final acceptance</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-sm leading-relaxed">
              Acceptance akan membuat decision durable dan menandai objective sebagai DONE. Pastikan node outcomes, diff, preview, verification, blocker, dan usage sudah ditinjau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-slate-800 bg-slate-900/50 mt-2">
            <AlertDialogCancel
              disabled={acceptPending}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={acceptPending}
              onClick={(event) => {
                event.preventDefault()
                void handleAccept()
              }}
              className="bg-emerald-600 text-white hover:bg-emerald-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
            >
              {acceptPending ? "Menyimpan…" : "Accept objective"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
