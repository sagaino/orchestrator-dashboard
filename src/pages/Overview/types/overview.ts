import type { DaemonStatus, ProjectInfo, RunManifest } from "@/services/orchestrator"

export interface OverviewMetricsData {
  activeWorkers: number
  maxWorkers: number
  reviewCount: number
  projectCount: number
  completedCount: number
}

export interface WelcomeBannerProps {
  onLaunchTask: () => void
}

export interface MetricsCardsProps {
  daemon: DaemonStatus | null
  reviewCount: number
  projectCount: number
  completedCount: number
}

export interface RegisteredProjectsProps {
  projects: ProjectInfo[]
  onCreateTask: (projectId: string) => void
  onRemoveProject?: (projectId: string, repository?: string) => void
  onManageRelationships?: (projectId: string) => void
}

export interface QuickTaskIntakeProps {
  projects: ProjectInfo[]
  selectedProject: string
  onSelectProject: (projectId: string) => void
  prompt: string
  onPromptChange: (prompt: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export interface UseOverviewReturn {
  daemon: DaemonStatus | null
  projects: ProjectInfo[]
  runs: RunManifest[]
  loading: boolean
  quickPrompt: string
  setQuickPrompt: React.Dispatch<React.SetStateAction<string>>
  selectedProject: string
  setSelectedProject: React.Dispatch<React.SetStateAction<string>>
  reviewRuns: RunManifest[]
  activeRuns: RunManifest[]
  completedRuns: RunManifest[]
  handleQuickSubmit: (e: React.FormEvent) => void
  loadData: () => Promise<void>
}
