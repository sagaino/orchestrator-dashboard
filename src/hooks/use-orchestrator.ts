import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { OrchestratorApi } from "@/services/orchestrator"
import type {
  DaemonStatus,
  ProjectInfo,
  RunManifest,
  KnowledgeCandidate,
  VaultHealth,
  TelemetryReport,
  RunDiffData,
  DevServerStatus,
  RtkAnalytics,
  OnboardExistingProjectPayload,
  OnboardNewProjectPayload,
  IngestKnowledgePayload,
  HarvestKnowledgePayload,
  InlineDiffComment,
} from "@/services/orchestrator"

// --- Query Keys ---
export const queryKeys = {
  daemon: ["daemon"] as const,
  projects: ["projects"] as const,
  runs: ["runs"] as const,
  runDetail: (id: string) => ["runs", id] as const,
  runDiff: (id: string) => ["runs", id, "diff"] as const,
  devServer: (id: string) => ["runs", id, "devServer"] as const,
  jobs: ["jobs"] as const,
  knowledgeCandidates: ["knowledge", "candidates"] as const,
  knowledgeHealth: ["knowledge", "health"] as const,
  notifications: ["notifications"] as const,
  telemetry: (projectId?: string) => ["telemetry", projectId ?? "all"] as const,
  rtk: ["telemetry", "rtk"] as const,
}

// --- Query Hooks ---

export function useDaemonStatus() {
  return useQuery<DaemonStatus>({
    queryKey: queryKeys.daemon,
    queryFn: () => OrchestratorApi.getDaemonStatus(),
    refetchInterval: 15_000,
    staleTime: 5_000,
  })
}

export function useProjects() {
  return useQuery<ProjectInfo[]>({
    queryKey: queryKeys.projects,
    queryFn: () => OrchestratorApi.getProjects(),
    staleTime: 60_000,
  })
}

export function useRuns() {
  return useQuery<RunManifest[]>({
    queryKey: queryKeys.runs,
    queryFn: () => OrchestratorApi.getRuns(),
    refetchInterval: 3_000,
    staleTime: 1_000,
  })
}

export function useRunDetail(runId: string | null) {
  return useQuery<RunManifest>({
    queryKey: queryKeys.runDetail(runId!),
    queryFn: () => OrchestratorApi.getRunDetail(runId!),
    enabled: !!runId,
    staleTime: 2_000,
  })
}

export function useRunDiff(runId: string | null) {
  return useQuery<RunDiffData>({
    queryKey: queryKeys.runDiff(runId!),
    queryFn: () => OrchestratorApi.getRunDiff(runId!),
    enabled: !!runId,
    staleTime: 10_000,
  })
}

export function useDevServerStatus(runId: string | null) {
  return useQuery<DevServerStatus>({
    queryKey: queryKeys.devServer(runId!),
    queryFn: () => OrchestratorApi.getDevServerStatus(runId!),
    enabled: !!runId,
    refetchInterval: 5_000,
    staleTime: 2_000,
  })
}

export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs,
    queryFn: () => OrchestratorApi.getJobs(),
    staleTime: 3_000,
  })
}

export function useKnowledgeCandidates() {
  return useQuery<KnowledgeCandidate[]>({
    queryKey: queryKeys.knowledgeCandidates,
    queryFn: () => OrchestratorApi.getKnowledgeCandidates(),
    staleTime: 10_000,
  })
}

export function useKnowledgeHealth() {
  return useQuery<VaultHealth>({
    queryKey: queryKeys.knowledgeHealth,
    queryFn: () => OrchestratorApi.getKnowledgeHealth(),
    staleTime: 30_000,
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => OrchestratorApi.getNotifications(),
    staleTime: 5_000,
  })
}

export function useTelemetry(projectId?: string) {
  return useQuery<TelemetryReport>({
    queryKey: queryKeys.telemetry(projectId),
    queryFn: () => OrchestratorApi.getTelemetry(projectId),
    staleTime: 15_000,
  })
}

export function useRtkAnalytics() {
  return useQuery<RtkAnalytics>({
    queryKey: queryKeys.rtk,
    queryFn: () => OrchestratorApi.getRtkTelemetry(),
    staleTime: 30_000,
  })
}

// --- Mutation Hooks ---

export function useRequestTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { project: string; request: string; autoStart?: boolean; requestedBy?: string }) =>
      OrchestratorApi.requestTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
    },
  })
}

export function useAcceptRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ runId, ...payload }: { runId: string; approvedBy?: string; decision?: string; destination?: string; targetPath?: string }) =>
      OrchestratorApi.acceptRun(runId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeCandidates })
    },
  })
}

export function useRejectRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ runId, reason, rejectedBy }: { runId: string; reason?: string; rejectedBy?: string }) =>
      OrchestratorApi.rejectRun(runId, reason, rejectedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
    },
  })
}

export function useRequestChanges() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      runId,
      reason,
      inlineComments,
      requestedBy,
    }: {
      runId: string
      reason: string
      inlineComments?: InlineDiffComment[]
      requestedBy?: string
    }) =>
      OrchestratorApi.requestChanges(runId, reason, inlineComments, requestedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
    },
  })
}

export function useStartRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ runId, approvedBy }: { runId: string; approvedBy?: string }) =>
      OrchestratorApi.startRun(runId, approvedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
    },
  })
}

export function useIngestKnowledge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: IngestKnowledgePayload) =>
      OrchestratorApi.ingestKnowledge(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeCandidates })
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHealth })
    },
  })
}

export function useHarvestKnowledge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: HarvestKnowledgePayload) =>
      OrchestratorApi.harvestKnowledge(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeCandidates })
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHealth })
    },
  })
}

export function usePromoteKnowledge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ selector, targetPath, approvedBy }: { selector: string; targetPath?: string; approvedBy?: string }) =>
      OrchestratorApi.promoteKnowledge(selector, targetPath, approvedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeCandidates })
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHealth })
    },
  })
}

export function useRejectKnowledge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ selector, reason, rejectedBy }: { selector: string; reason?: string; rejectedBy?: string }) =>
      OrchestratorApi.rejectKnowledge(selector, reason, rejectedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeCandidates })
    },
  })
}

export function useFixSafeKnowledgeHealth() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => OrchestratorApi.fixSafeKnowledgeHealth(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHealth })
    },
  })
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ selector, readBy }: { selector?: string; readBy?: string } = {}) =>
      OrchestratorApi.markNotificationsRead(selector, readBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
    },
  })
}

export function usePreviewRun() {
  return useMutation({
    mutationFn: (runId: string) => OrchestratorApi.previewRun(runId),
  })
}

export function useRecoverRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (runId: string) => OrchestratorApi.recoverRun(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
    },
  })
}

export function useRetryRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (runId: string) => OrchestratorApi.retryRun(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
    },
  })
}

export function useOnboardExistingProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: OnboardExistingProjectPayload) =>
      OrchestratorApi.onboardExistingProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
    },
  })
}

export function useOnboardNewProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: OnboardNewProjectPayload) =>
      OrchestratorApi.onboardNewProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
    },
  })
}
