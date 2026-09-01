import { AlertTriangle, CheckCircle2 } from "lucide-react"
import type { ObjectivePlanReview } from "@/services/orchestrator"
import { evaluatePlanAdmission } from "@/lib/plan-admission"

export function PlanGovernanceEvidence({ plan }: { plan: ObjectivePlanReview }) {
  const admission = evaluatePlanAdmission(plan)
  const intent = plan.verificationIntent
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-xs" data-testid="plan-governance-evidence">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-200">Governance Admission Evidence</h3>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${admission.allowed ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}>
          {admission.allowed ? "READY" : "BLOCKED"}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {Object.entries(plan.blueprints ?? {}).map(([projectId, blueprint]) => (
          <div key={projectId} className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">
            <p className="font-medium text-white">{projectId} · {blueprint.id}</p>
            <p className="mt-1 text-[11px] text-slate-400">{blueprint.source} · policy v{blueprint.policyVersion} · <span className="font-mono">{blueprint.policyFingerprint?.slice(0, 12) ?? "fingerprint missing"}</span></p>
          </div>
        ))}
        {intent && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">
            <p className="font-medium text-white">Intent contract v{intent.contractVersion} · {intent.status}</p>
            <ul className="mt-2 space-y-1">
              {intent.resolved.map((item, index) => <li key={`resolved-${index}`} className="flex gap-1.5 text-emerald-300"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />{item.projectId}: {item.capability} → <span className="font-mono">{item.script ?? item.runner}</span></li>)}
              {(intent.waived ?? []).map((item, index) => <li key={`waived-${index}`} className="flex gap-1.5 text-amber-300"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />Waived {item.projectId}: {item.capability} — {item.reason} ({item.waivedBy})</li>)}
              {intent.missing.map((item, index) => <li key={`missing-${index}`} className="flex gap-1.5 text-rose-300"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />Missing {item.projectId}: {item.capability}</li>)}
            </ul>
          </div>
        )}
        {!admission.allowed && <ul className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-rose-200">{admission.blockers.map((blocker, index) => <li key={`${blocker.code}-${index}`} className="flex gap-1.5"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /><span><strong>{blocker.code}</strong>: {blocker.message}</span></li>)}</ul>}
      </div>
    </section>
  )
}
