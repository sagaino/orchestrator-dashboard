import { useState } from "react"
import {
  useAcceptObjective,
  usePreviewRun,
  useAggregatePreview,
  useStopAggregatePreview,
  useRequestObjectiveVisualChanges,
  useDeliveryCertification,
  useCreateDeliveryCertification,
  useAcceptDeliveryCertification,
} from "@/hooks/use-orchestrator"
import type { AggregatePreview, ObjectiveEvidence, UseEvidenceViewReturn } from "../types"

export const useEvidenceView = (evidence: ObjectiveEvidence): UseEvidenceViewReturn => {
  const objective = evidence.objective
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [previewMessage, setPreviewMessage] = useState<string | null>(null)
  const [aggregatePreview, setAggregatePreview] = useState<AggregatePreview | null>(null)

  const accept = useAcceptObjective()
  const preview = usePreviewRun()
  const aggregate = useAggregatePreview()
  const stopAggregate = useStopAggregatePreview()
  const visualRepair = useRequestObjectiveVisualChanges()
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
      const res = await aggregate.mutateAsync({ objectiveId: objective.objectiveId })
      setAggregatePreview(res)
    } catch (error) {
      setPreviewMessage(error instanceof Error ? error.message : "Aggregate preview tidak tersedia.")
    }
  }

  const handleStopAggregatePreview = async () => {
    if (!aggregatePreview) return
    const res = await stopAggregate.mutateAsync({ objectiveId: objective.objectiveId, sessionId: aggregatePreview.sessionId })
    setAggregatePreview(res)
  }

  const handleVisualRepair = async (nodeId: string, reason: string) => {
    await visualRepair.mutateAsync({ objectiveId: objective.objectiveId, nodeId, reason })
    setPreviewMessage(`Visual repair untuk ${nodeId} disetujui.`)
  }

  const handleDeliveryRun = async () => {
    await createDelivery.mutateAsync(objective.objectiveId)
  }

  const handleDeliveryAccept = async () => {
    await acceptDelivery.mutateAsync({
      objectiveId: objective.objectiveId,
      certificationId: delivery.data?.latest?.certificationId,
    })
  }

  return {
    acceptOpen,
    setAcceptOpen,
    previewMessage,
    aggregatePreview,
    delivery: delivery.data?.latest ?? null,
    previewPending: preview.isPending,
    acceptPending: accept.isPending,
    aggregatePending: aggregate.isPending,
    stopAggregatePending: stopAggregate.isPending,
    visualRepairPending: visualRepair.isPending,
    createDeliveryPending: createDelivery.isPending,
    acceptDeliveryPending: acceptDelivery.isPending,
    handlePreview,
    handleAccept,
    handleAggregatePreview,
    handleStopAggregatePreview,
    handleVisualRepair,
    handleDeliveryRun,
    handleDeliveryAccept,
  }
}
