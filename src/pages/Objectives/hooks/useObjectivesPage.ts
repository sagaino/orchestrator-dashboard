import { useParams } from "react-router-dom"
import { useObjective, useObjectiveEvidence, useObjectives } from "@/hooks/use-orchestrator"
import type { UseObjectivesPageReturn } from "../types"

export const useObjectivesPage = (): UseObjectivesPageReturn => {
  const { objectiveId } = useParams<{ objectiveId: string }>()
  const summaries = useObjectives()
  const objective = useObjective(objectiveId ?? null)
  const evidence = useObjectiveEvidence(objectiveId ?? null)

  const hasPendingPlan = Boolean(
    objective.data?.plan &&
      ["PENDING_APPROVAL", "APPROVED"].includes(objective.data.plan.state) &&
      !objective.data.activeOrchestrationId
  )

  return {
    objectiveId,
    summaries: {
      data: summaries.data,
      isLoading: summaries.isLoading,
      error: summaries.error,
      refetch: () => {
        void summaries.refetch()
      },
    },
    objective: {
      data: objective.data,
      isLoading: objective.isLoading,
      error: objective.error,
      refetch: () => {
        void objective.refetch()
      },
    },
    evidence: {
      data: evidence.data,
      isLoading: evidence.isLoading,
      error: evidence.error,
      refetch: () => {
        void evidence.refetch()
      },
    },
    hasPendingPlan,
  }
}
