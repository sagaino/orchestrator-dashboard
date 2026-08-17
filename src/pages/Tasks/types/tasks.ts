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
  statusMessage: TaskStatusMessage | null
  submitting: boolean
  onSubmit: (e: FormEvent) => Promise<void>
}

export interface LiveJobQueueProps {
  jobs: OrchestratorJob[]
  onRefresh?: () => void
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
  statusMessage: TaskStatusMessage | null
  setStatusMessage: Dispatch<SetStateAction<TaskStatusMessage | null>>
  submitting: boolean
  handleSubmit: (e: FormEvent) => Promise<void>
  refetchDaemon?: () => void
}
