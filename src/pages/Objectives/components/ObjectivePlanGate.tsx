import React from "react"
import { AlertTriangle, CheckCircle2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "./StatusBadge"
import { useObjectivePlanGate } from "../hooks/useObjectivePlanGate"
import type { ObjectivePlanGateProps } from "../types"

export const ObjectivePlanGate: React.FC<ObjectivePlanGateProps> = ({ lifecycle }) => {
  const {
    open,
    setOpen,
    message,
    plan,
    actionLabel,
    busy,
    run,
  } = useObjectivePlanGate(lifecycle)

  if (!plan || !["PENDING_APPROVAL", "APPROVED"].includes(plan.state) || lifecycle.activeOrchestrationId) {
    return null
  }

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
        >
          <Play className="h-4 w-4" />Review / Approve Plan
        </Button>
        {message && <p className="max-w-md text-right text-xs text-emerald-200">{message}</p>}
      </div>
      <Dialog open={open} onOpenChange={(next) => !busy && setOpen(next)}>
        <DialogContent
          aria-describedby="objective-plan-review-description"
          className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-0 text-slate-100 shadow-2xl [&_[data-slot=dialog-close]]:right-5 [&_[data-slot=dialog-close]]:top-5"
        >
          <DialogHeader className="shrink-0 space-y-3 border-b border-slate-800/80 bg-slate-900/90 p-6 pb-4">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-600/20 text-indigo-400">
                  <Play className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold leading-snug text-white">Plan Review</DialogTitle>
                  <DialogDescription id="objective-plan-review-description" className="mt-1 text-xs text-slate-400">
                    Periksa revision aktif sebelum task dibuat dan orchestration dijalankan.
                  </DialogDescription>
                </div>
              </div>
              <StatusBadge state={plan.state} />
            </div>
          </DialogHeader>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
            <section className="rounded-xl border border-indigo-500/20 bg-slate-950/50 p-4">
              <p className="font-mono text-xs text-indigo-300">{plan.planId}</p>
              <h3 className="mt-2 text-sm font-semibold text-white">{plan.summary}</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded border border-slate-700 px-2 py-1">Risk {plan.risk}</span>
                <span className="rounded border border-slate-700 px-2 py-1">Complexity {plan.complexity}</span>
                <span className="rounded border border-slate-700 px-2 py-1">{plan.projects.length} projects</span>
                <span className="rounded border border-slate-700 px-2 py-1">{plan.nodes.length} nodes</span>
              </div>
            </section>
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Planned nodes</h3>
              {plan.nodes.map((node) => (
                <article key={node.nodeId} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-[11px] text-indigo-300">{node.nodeId} · {node.projectId}</p>
                      <p className="mt-1 text-xs font-semibold text-white">{node.title}</p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        node.requiresChanges
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      }`}
                    >
                      {node.requiresChanges ? "Writes required" : "Read-only"}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-2 text-[11px] text-slate-400 sm:grid-cols-2">
                    <p>
                      Allowed paths: <span className="text-slate-200">{node.allowedPaths.join(", ") || "None"}</span>
                    </p>
                    <p>
                      Verification: <span className="font-mono text-slate-200">{node.verification.join(", ") || "None"}</span>
                    </p>
                  </div>
                </article>
              ))}
            </section>
            <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-xs">
              <h3 className="font-semibold text-slate-200">Integration verification</h3>
              <p className="mt-2 text-slate-400">
                Project: <span className="font-mono text-slate-200">{plan.integration.projectVerification.join(", ") || "None"}</span>
              </p>
              <p className="mt-2 text-slate-400">
                Cross-project: <span className="font-mono text-slate-200">{plan.integration.crossProjectVerification.join(", ") || "None"}</span>
              </p>
            </section>
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Approval ini adalah human gate. Setelah dikonfirmasi, task akan dimaterialisasi dan orchestration langsung dimulai.</p>
            </div>
            {message && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">{message}</p>
            )}
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0 flex-row items-center justify-end gap-3 rounded-none rounded-b-2xl border-t border-slate-800 bg-slate-900/90 px-6 py-4 sm:justify-end">
            <Button
              type="button"
              disabled={busy}
              onClick={() => setOpen(false)}
              className="h-auto rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              Tutup
            </Button>
            <Button
              type="button"
              disabled={busy || plan.clarificationNeeded}
              onClick={() => void run()}
              className="h-auto gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-500"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {busy ? "Memulai…" : actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
