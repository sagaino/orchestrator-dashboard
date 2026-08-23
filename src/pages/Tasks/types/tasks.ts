import type { FormEvent, Dispatch, SetStateAction } from "react"
import type { ProjectInfo, ProjectRelationship, DaemonStatus, ObjectiveDecision, ObjectiveIntakeResult, ObjectiveMode, ObjectivePlanReview, ObjectiveRecord, TaskRequestResult } from "@/services/orchestrator"

export interface OrchestratorJob {
  jobId: string
  taskId: string
  project: string
  state: string
  runId?: string | null
}

export interface TaskStatusMessage {
  type: "success" | "error"
  text: string
}

export interface TaskIntakeFormProps {
  targetMode: ObjectiveMode
  onTargetModeChange: (mode: ObjectiveMode) => void
  crossProjectEnabled: boolean
  projects: ProjectInfo[]
  selectedProject: string
  onSelectProject: (projectId: string) => void
  projectRelationships: ProjectRelationship[]
  linkedProjectIds: string[]
  onLinkedProjectIdsChange: (projectIds: string[]) => void
  relationshipsLoading?: boolean
  freshProjectId: string
  onFreshProjectIdChange: (projectId: string) => void
  freshTargetDirectory: string
  onFreshTargetDirectoryChange: (targetDirectory: string) => void
  freshBlueprint: string
  onFreshBlueprintChange: (blueprint: string) => void
  prompt: string
  onPromptChange: (prompt: string) => void
  queueAfterConfirmation: boolean
  onQueueAfterConfirmationChange: (enabled: boolean) => void
  attachedAssets: import("@/services/orchestrator").AttachedAsset[]
  onAddAsset: (asset: import("@/services/orchestrator").AttachedAsset) => void
  onRemoveAsset: (index: number) => void
  isUploadingAsset: boolean
  onUploadFile: (file: File, type: "MOCKUP" | "PROJECT_ASSET") => Promise<void>
  statusMessage: TaskStatusMessage | null
  submitting: boolean
  onSubmit: (e: FormEvent) => Promise<void>
}

export interface LiveJobQueueProps {
  jobs: OrchestratorJob[]
  onRefresh?: () => void
}

export interface ClarificationModalProps {
  isOpen: boolean
  question: string
  answer: string
  onAnswerChange: (answer: string) => void
  submitting?: boolean
  onClose: () => void
  onSubmit: (e: FormEvent) => Promise<void> | void
  originalPrompt?: string
}

export interface TaskConfirmationModalProps {
  isOpen: boolean
  result: TaskRequestResult | null
  queueAfterConfirmation: boolean
  confirming: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export interface PlanReviewPanelProps {
  isOpen: boolean
  objective: ObjectiveRecord | null
  plan: ObjectivePlanReview | null
  decisions?: ObjectiveDecision[]
  actionLoading?: boolean
  onClose: () => void
  onApprove: () => Promise<void>
  onRequestChanges: (reason: string) => Promise<void>
  onCancel: () => Promise<void>
}

export interface UseTasksReturn {
  targetMode: ObjectiveMode
  setTargetMode: Dispatch<SetStateAction<ObjectiveMode>>
  crossProjectEnabled: boolean
  projects: ProjectInfo[]
  daemon: DaemonStatus | null
  jobs: OrchestratorJob[]
  queueJobs: OrchestratorJob[]
  selectedProject: string
  setSelectedProject: Dispatch<SetStateAction<string>>
  projectRelationships: ProjectRelationship[]
  linkedProjectIds: string[]
  setLinkedProjectIds: Dispatch<SetStateAction<string[]>>
  relationshipsLoading: boolean
  freshProjectId: string
  setFreshProjectId: Dispatch<SetStateAction<string>>
  freshTargetDirectory: string
  setFreshTargetDirectory: Dispatch<SetStateAction<string>>
  freshBlueprint: string
  setFreshBlueprint: Dispatch<SetStateAction<string>>
  prompt: string
  setPrompt: Dispatch<SetStateAction<string>>
  queueAfterConfirmation: boolean
  setQueueAfterConfirmation: Dispatch<SetStateAction<boolean>>
  attachedAssets: import("@/services/orchestrator").AttachedAsset[]
  handleAddAsset: (asset: import("@/services/orchestrator").AttachedAsset) => void
  handleRemoveAsset: (index: number) => void
  isUploadingAsset: boolean
  handleUploadFile: (file: File, type: "MOCKUP" | "PROJECT_ASSET") => Promise<void>
  statusMessage: TaskStatusMessage | null
  setStatusMessage: Dispatch<SetStateAction<TaskStatusMessage | null>>
  submitting: boolean
  handleSubmit: (e: FormEvent) => Promise<void>
  refetchDaemon?: () => void
  clarificationOpen: boolean
  setClarificationOpen: Dispatch<SetStateAction<boolean>>
  clarificationQuestion: string
  setClarificationQuestion: Dispatch<SetStateAction<string>>
  clarificationAnswer: string
  setClarificationAnswer: Dispatch<SetStateAction<string>>
  handleCloseClarification: () => void
  handleSubmitClarification: (e: FormEvent) => Promise<void>
  pendingPrompt?: string
  confirmationOpen: boolean
  confirmationResult: TaskRequestResult | null
  objectiveResult: ObjectiveIntakeResult | null
  confirming: boolean
  handleCloseConfirmation: () => void
  handleConfirmQueue: () => Promise<void>
  planReviewOpen: boolean
  planReviewObjective: ObjectiveRecord | null
  planReview: ObjectivePlanReview | null
  planReviewDecisions: ObjectiveDecision[]
  planReviewActionLoading: boolean
  handleClosePlanReview: () => void
  handleApprovePlan: () => Promise<void>
  handleRequestPlanChanges: (reason: string) => Promise<void>
  handleCancelObjective: () => Promise<void>
}
