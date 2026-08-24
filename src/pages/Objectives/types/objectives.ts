import type {
  AggregatePreview,
  DeliveryCertification,
  IntegrationEvidence,
  ObjectiveEvidence,
  ObjectiveEvidenceNode,
  ObjectiveGraphNode,
  ObjectiveLifecycleDetail,
  ObjectiveSummary,
  ObjectiveVisualEvidence,
} from "@/services/orchestrator"

export type {
  AggregatePreview,
  DeliveryCertification,
  IntegrationEvidence,
  ObjectiveEvidence,
  ObjectiveEvidenceNode,
  ObjectiveGraphNode,
  ObjectiveLifecycleDetail,
  ObjectiveSummary,
  ObjectiveVisualEvidence,
}

export interface StatusBadgeProps {
  state: string
}

export interface ObjectiveRequestHeadingProps {
  request: string
}

export interface SummaryListProps {
  items: ObjectiveSummary[]
}

export interface ObjectivePlanGateProps {
  lifecycle: ObjectiveLifecycleDetail
}

export interface PlanOnlyViewProps {
  lifecycle: ObjectiveLifecycleDetail
}

export interface NodeCardProps {
  node: ObjectiveEvidenceNode
  onPreview: (runId: string) => void
  previewing: boolean
}

export interface AggregatePreviewPanelProps {
  preview: AggregatePreview | null
  onStop: () => void
  stopping: boolean
}

export interface ObjectiveVisualEvidencePanelProps {
  report?: ObjectiveVisualEvidence
  onRepair: (nodeId: string, reason: string) => Promise<void>
  repairing: boolean
}

export interface DeliveryCertificationPanelProps {
  certification: DeliveryCertification | null
  canRun: boolean
  onRun: () => Promise<void>
  onAccept: () => Promise<void>
  running: boolean
  accepting: boolean
}

export interface EvidenceViewProps {
  evidence: ObjectiveEvidence
  lifecycle: ObjectiveLifecycleDetail
}

export interface CrossProjectIntegrationEvidenceProps {
  integration: IntegrationEvidence
  objectiveProjectIds: string[]
  nodes: ObjectiveEvidenceNode[]
  blockers: Array<{ id: string; kind: string; state?: string; message: string }>
  canAccept: boolean
}

export interface ObjectiveGraphProps {
  objectiveId: string
}

export interface UseObjectivesPageReturn {
  objectiveId?: string
  summaries: {
    data?: ObjectiveSummary[]
    isLoading: boolean
    error: Error | null
    refetch: () => void
  }
  objective: {
    data?: ObjectiveLifecycleDetail
    isLoading: boolean
    error: Error | null
    refetch: () => void
  }
  evidence: {
    data?: ObjectiveEvidence
    isLoading: boolean
    error: Error | null
    refetch: () => void
  }
  hasPendingPlan: boolean
}

export interface UseEvidenceViewReturn {
  acceptOpen: boolean
  setAcceptOpen: (open: boolean) => void
  previewMessage: string | null
  aggregatePreview: AggregatePreview | null
  delivery: DeliveryCertification | null
  previewPending: boolean
  acceptPending: boolean
  aggregatePending: boolean
  stopAggregatePending: boolean
  visualRepairPending: boolean
  createDeliveryPending: boolean
  acceptDeliveryPending: boolean
  integrationPending: boolean
  handlePreview: (runId: string) => Promise<void>
  handleAccept: () => Promise<void>
  handleAggregatePreview: () => Promise<void>
  handleStopAggregatePreview: () => Promise<void>
  handleVisualRepair: (nodeId: string, reason: string) => Promise<void>
  handleDeliveryRun: () => Promise<void>
  handleDeliveryAccept: () => Promise<void>
  handleIntegration: () => Promise<void>
}

export interface UseObjectivePlanGateReturn {
  open: boolean
  setOpen: (open: boolean) => void
  message: string | null
  plan: ObjectiveLifecycleDetail["plan"] | null
  canApprove: boolean
  actionLabel: string
  busy: boolean
  run: () => Promise<void>
}
