import React from "react"
import { useObjectivesPage } from "./hooks"
import { EvidenceView, PlanOnlyView, SummaryList } from "./components"

export const ObjectivePage: React.FC = () => {
  const {
    objectiveId,
    summaries,
    objective,
    evidence,
    hasPendingPlan,
  } = useObjectivesPage()

  if (!objectiveId) {
    return summaries.isLoading ? (
      <div className="p-6 text-slate-400">Memuat objectives…</div>
    ) : (
      <SummaryList items={summaries.data ?? []} />
    )
  }

  if (objective.isLoading) {
    return <div className="p-6 text-slate-400">Memuat objective…</div>
  }

  if (objective.error || !objective.data) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-200">
        Objective tidak dapat dimuat. {objective.error?.message ?? "Periksa objective ID."}
      </div>
    )
  }

  if (hasPendingPlan && (evidence.isLoading || evidence.error || !evidence.data)) {
    return <PlanOnlyView lifecycle={objective.data} />
  }

  if (evidence.isLoading) {
    return <div className="p-6 text-slate-400">Memuat objective evidence…</div>
  }

  if (evidence.error || !evidence.data) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-200">
        Objective evidence tidak dapat dimuat. {evidence.error?.message ?? "Periksa objective ID."}
      </div>
    )
  }

  return <EvidenceView evidence={evidence.data} lifecycle={objective.data} />
}

export default ObjectivePage
