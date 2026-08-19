import type { FormEvent, Dispatch, SetStateAction } from "react"
import type { ProjectInfo, DaemonStatus } from "@/services/orchestrator"

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
  projects: ProjectInfo[]
  selectedProject: string
  onSelectProject: (projectId: string) => void
  prompt: string
  onPromptChange: (prompt: string) => void
  autoStart: boolean
  onAutoStartChange: (autoStart: boolean) => void
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

export interface UseTasksReturn {
  projects: ProjectInfo[]
  daemon: DaemonStatus | null
  jobs: OrchestratorJob[]
  queueJobs: OrchestratorJob[]
  selectedProject: string
  setSelectedProject: Dispatch<SetStateAction<string>>
  prompt: string
  setPrompt: Dispatch<SetStateAction<string>>
  autoStart: boolean
  setAutoStart: Dispatch<SetStateAction<boolean>>
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
}
