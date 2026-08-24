import React from "react"
import { AlertTriangle, Clock3, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { DecisionCardProps } from "../types"
import type { DecisionInboxItem } from "@/services/orchestrator"

export const riskClass = (risk: string) => {
  if (risk === "HIGH") return "border-rose-500/40 bg-rose-950/20 text-rose-200"
  if (risk === "MEDIUM") return "border-amber-500/40 bg-amber-950/20 text-amber-200"
  return "border-slate-700 bg-slate-900/60 text-slate-300"
}

export const formatAge = (ageMs: number | null) => {
  if (ageMs === null) return "usia tidak tersedia"
  const minutes = Math.floor(ageMs / 60_000)
  if (minutes < 60) return `${Math.max(1, minutes)} menit menunggu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam menunggu`
  return `${Math.floor(hours / 24)} hari menunggu`
}

export const evidenceSummary = (decision: DecisionInboxItem) => {
  if (!decision.evidence || Array.isArray(decision.evidence)) return null
  const values = [decision.evidence.reason, decision.evidence.message, decision.evidence.classification]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
  return values[0] ?? null
}

export const actionButtonClass = (action: string) => {
  if (action === "CANCEL") return "bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500"
  if (action === "RETRY") return "bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500"
  return "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500"
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ decision, onSelectAction }) => {
  const summaryText = evidenceSummary(decision)

  return (
    <article data-testid="decision-card" className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg border p-2 ${riskClass(decision.risk)}`} aria-label={`Risk ${decision.risk}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-white">{decision.type}</h3>
              <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${riskClass(decision.risk)}`}>
                Risk {decision.risk}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs text-slate-500">{decision.decisionId}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock3 className="h-3.5 w-3.5" />
          {formatAge(decision.ageMs)}
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-300">{decision.requestedAction}</p>
      {summaryText && <p className="mt-2 rounded-lg bg-slate-900/80 px-3 py-2 text-xs text-slate-400">Evidence: {summaryText}</p>}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
        <span>
          Objective: <Link className="text-indigo-300 hover:text-indigo-200" to={`/objectives/${decision.objectiveId}`}>{decision.objectiveId}</Link>
        </span>
        {decision.nodeId && <span>Node: {decision.nodeId}</span>}
        {decision.runId && <span>Run: {decision.runId}</span>}
        <span>Created: {new Date(decision.createdAt).toLocaleString("id-ID")}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
        <span className="mr-1 text-xs font-medium text-slate-400">Allowed actions:</span>
        {decision.allowedChoices.map((action) => (
          <Button
            key={action}
            size="sm"
            className={actionButtonClass(action)}
            aria-label={`Resolve ${action} for ${decision.decisionId}`}
            onClick={() => onSelectAction(decision, action)}
          >
            {action}
          </Button>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" />
        Resolution akan dicatat dengan identity operator lokal dan dapat diulang secara idempotent.
      </p>
    </article>
  )
}
