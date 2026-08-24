import type { DecisionInboxItem } from "@/services/orchestrator"

export interface DecisionSummary {
  high: number
  total: number
}

export interface PendingDecision {
  decision: DecisionInboxItem
  action: string
}

export interface DecisionHeaderProps {
  isFetching: boolean
  onRefresh: () => void
}

export interface DecisionSummaryCardsProps {
  summary: DecisionSummary
}

export interface DecisionCardProps {
  decision: DecisionInboxItem
  onSelectAction: (decision: DecisionInboxItem, action: string) => void
}

export interface DecisionListProps {
  decisions: DecisionInboxItem[]
  isLoading: boolean
  isError: boolean
  notice: string | null
  onSelectAction: (decision: DecisionInboxItem, action: string) => void
}

export interface ConfirmResolutionDialogProps {
  pending: PendingDecision | null
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export interface UseDecisionsReturn {
  decisions: DecisionInboxItem[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  isResolving: boolean
  notice: string | null
  pending: PendingDecision | null
  summary: DecisionSummary
  refetch: () => Promise<unknown>
  handleSelectAction: (decision: DecisionInboxItem, action: string) => void
  handleCloseDialog: () => void
  handleConfirmResolution: () => Promise<void>
}
