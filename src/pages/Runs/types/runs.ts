import type { FormEvent, Dispatch, SetStateAction } from "react"
import type {
  RunManifest,
  RunDiffData,
  RunHistoryEntry,
  RunRetrospectiveData,
  VerificationResultItem,
  InlineDiffComment,
} from "@/services/orchestrator"

export type RunFilterState = "ALL" | "REVIEW" | "ACTIVE" | "DONE" | "FAILED"
export type RunTabType = "OVERVIEW" | "DIFF" | "LOGS" | "QA" | "RETROSPECTIVE"

export interface InlineComment extends InlineDiffComment {
  id?: string
  createdAt?: string
}

export interface RunsHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  runsLoading: boolean
  onRefresh?: () => void
}

export interface FilterTabsProps {
  filterState: RunFilterState
  onFilterChange: (filter: RunFilterState) => void
}

export interface RunCardProps {
  run: RunManifest
  isSelected: boolean
  onSelect: (run: RunManifest) => void
}

export interface RunsListProps {
  runs: RunManifest[]
  selectedRun: RunManifest | null
  onSelectRun: (run: RunManifest) => void
}

export interface RunActionToolbarProps {
  selectedRun: RunManifest
  actionLoading: boolean
  onPreview: (runId: string) => Promise<void>
  onStart: (runId: string) => Promise<void>
  onRequestChanges: () => void
  onAccept: (runId: string) => void | Promise<void>
  onReject: (runId: string) => void | Promise<void>
  onRecover: (runId: string) => Promise<void>
  onRetry: (runId: string) => Promise<void>
}

export interface RunOverviewTabProps {
  selectedRun: RunManifest
}

export interface RunExecutionTimelineProps {
  history?: RunHistoryEntry[]
  currentState?: string
}

export interface RunRetrospectiveTabProps {
  selectedRun: RunManifest
}

export interface RunInspectorProps {
  selectedRun: RunManifest | null
  activeTab: RunTabType
  onTabChange: (tab: RunTabType) => void
  actionLoading: boolean
  diffData?: RunDiffData | null
  diffLoading: boolean
  inlineComments?: InlineComment[]
  onAddInlineComment?: (comment: { file: string; line: number; comment: string }) => void
  onRemoveInlineComment?: (index: number) => void
  onPreview: (runId: string) => Promise<void>
  onStart: (runId: string) => Promise<void>
  onRequestChanges: () => void
  onAccept: (runId: string) => void | Promise<void>
  onReject: (runId: string) => void | Promise<void>
  onRecover: (runId: string) => Promise<void>
  onRetry: (runId: string) => Promise<void>
}

export interface RequestChangesModalProps {
  isOpen: boolean
  reason: string
  onReasonChange: (reason: string) => void
  actionLoading: boolean
  onClose: () => void
  onSubmit: (e: FormEvent) => Promise<void>
  inlineComments?: InlineComment[]
  onRemoveComment?: (index: number) => void
}

export interface AcceptRunModalProps {
  isOpen: boolean
  run: RunManifest | null
  actionLoading: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export interface RejectRunModalProps {
  isOpen: boolean
  run: RunManifest | null
  reason: string
  onReasonChange: (reason: string) => void
  actionLoading: boolean
  onClose: () => void
  onConfirm: (e: FormEvent) => Promise<void>
}

export interface UseRunsPageReturn {
  runs: RunManifest[]
  runsLoading: boolean
  refetchRuns?: () => void
  filterState: RunFilterState
  setFilterState: (state: RunFilterState) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedRun: RunManifest | null
  setSelectedRun: (run: RunManifest | null) => void
  activeTab: RunTabType
  setActiveTab: (tab: RunTabType) => void
  revisionModalOpen: boolean
  setRevisionModalOpen: (open: boolean) => void
  revisionReason: string
  setRevisionReason: (reason: string) => void
  inlineComments: InlineComment[]
  setInlineComments: Dispatch<SetStateAction<InlineComment[]>>
  handleAddInlineComment: (comment: { file: string; line: number; comment: string }) => void
  handleRemoveInlineComment: (index: number) => void
  acceptModalOpen: boolean
  setAcceptModalOpen: (open: boolean) => void
  rejectModalOpen: boolean
  setRejectModalOpen: (open: boolean) => void
  rejectReason: string
  setRejectReason: (reason: string) => void
  diffData?: RunDiffData | null
  diffLoading: boolean
  actionLoading: boolean
  filteredRuns: RunManifest[]
  handleStart: (runId: string) => Promise<void>
  handlePreview: (runId: string) => Promise<void>
  handleAccept: (runId: string) => void
  handleReject: (runId: string) => void
  handleOpenAcceptModal: () => void
  handleOpenRejectModal: () => void
  handleOpenRevisionModal: () => void
  handleConfirmAccept: () => Promise<void>
  handleConfirmReject: (e: FormEvent) => Promise<void>
  handleRequestChangesSubmit: (e: FormEvent) => Promise<void>
  handleRecover: (runId: string) => Promise<void>
  handleRetry: (runId: string) => Promise<void>
}

