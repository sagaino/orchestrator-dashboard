import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { OrchestratorApi } from "@/services/orchestrator"
import type {
  DaemonStatus,
  ProjectInfo,
  RunManifest,
  RunEvidence,
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
  KnowledgeMaintenance,
  KnowledgeMergePreview,
  KnowledgeProvenanceMigrationPreview,
  KnowledgeProvenanceMigrationResult,
  BackupRecoveryStatus,
  BackupSchedulePreview,
  BackupRotationPreview,
  ObjectiveMode,
  ObjectiveLifecycleDetail,
  ObjectiveEvidence,
  DeliveryCertificationHistory,
  SkillCatalog,
  ObjectiveGraph,
  ObjectiveSummary,
  AggregatePreview,
  DecisionInboxItem,
  ProjectRelationship,
  ProjectRelationshipsResult,
} from "@/services/orchestrator"

// --- Query Keys ---
export const queryKeys = {
  daemon: ["daemon"] as const,
  projects: ["projects"] as const,
  projectRelationships: (id: string) => ["projects", id, "relationships"] as const,
  archivedProjects: ["projects", "archived"] as const,
  runs: ["runs"] as const,
  runDetail: (id: string) => ["runs", id] as const,
  runEvidence: (id: string) => ["runs", id, "evidence"] as const,
  runVisualEvidence: (id: string) => ["runs", id, "visual-evidence"] as const,
  runVisualRevisions: (id: string) => ["runs", id, "visual-revisions"] as const,
  runVisualCertification: (id: string) => ["runs", id, "visual-certification"] as const,
  runDiff: (id: string) => ["runs", id, "diff"] as const,
  runLogs: (id: string) => ["runs", id, "logs"] as const,
  devServer: (id: string) => ["runs", id, "devServer"] as const,
  jobs: ["jobs"] as const,
  knowledgeCandidates: ["knowledge", "candidates"] as const,
  knowledgeHarvests: ["knowledge", "harvests"] as const,
  knowledgeHealth: ["knowledge", "health"] as const,
  knowledgeMaintenance: ["knowledge", "maintenance"] as const,
  notifications: ["notifications"] as const,
  telemetry: (projectId?: string) => ["telemetry", projectId ?? "all"] as const,
  rtk: ["telemetry", "rtk"] as const,
  operations: ["operations", "readiness"] as const,
  releaseOperations: ["operations", "release"] as const,
  retentionTrash: ["operations", "retention", "trash"] as const,
  backupRecovery: ["operations", "backups", "status"] as const,
  objective: (id: string) => ["objectives", id] as const,
  objectiveEvidence: (id: string) => ["objectives", id, "evidence"] as const,
  deliveryCertification: (id: string) => ["objectives", id, "delivery-certification"] as const,
  objectiveGraph: (id: string) => ["objectives", id, "graph"] as const,
  objectives: ["objectives"] as const,
  skills: ["skills"] as const,
  decisionInbox: ["decisions", "inbox"] as const,
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

export function useProjectRelationships(projectId: string | null, enabled = true) {
  return useQuery<ProjectRelationshipsResult>({
    queryKey: queryKeys.projectRelationships(projectId ?? ""),
    queryFn: () => OrchestratorApi.getProjectRelationships(projectId!),
    enabled: Boolean(projectId) && enabled,
    staleTime: 30_000,
  })
}

export function useReplaceProjectRelationships() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, relationships }: { projectId: string; relationships: ProjectRelationship[] }) =>
      OrchestratorApi.replaceProjectRelationships(projectId, relationships),
    onSuccess: (result, variables) => {
      queryClient.setQueryData(queryKeys.projectRelationships(variables.projectId), result)
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })
}

export function useObjective(objectiveId: string | null) {
  return useQuery<ObjectiveLifecycleDetail>({
    queryKey: queryKeys.objective(objectiveId ?? ""),
    queryFn: () => OrchestratorApi.getObjective(objectiveId!),
    enabled: Boolean(objectiveId),
    staleTime: 3_000,
  })
}

export function useSkillCatalog() {
  return useQuery<SkillCatalog>({
    queryKey: queryKeys.skills,
    queryFn: () => OrchestratorApi.getSkillCatalog(),
    staleTime: 30_000,
  })
}

export function useUpdateSkillEnabled() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ skillId, version, enabled }: { skillId: string; version: string; enabled: boolean }) =>
      OrchestratorApi.updateSkillEnabled(skillId, version, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills })
    },
  })
}

export function useObjectiveEvidence(objectiveId: string | null) {
  return useQuery<ObjectiveEvidence>({
    queryKey: queryKeys.objectiveEvidence(objectiveId ?? ""),
    queryFn: () => OrchestratorApi.getObjectiveEvidence(objectiveId!),
    enabled: Boolean(objectiveId),
    refetchInterval: objectiveId ? 3_000 : false,
    staleTime: 1_000,
  })
}

export function useDeliveryCertification(objectiveId: string | null) {
  return useQuery<DeliveryCertificationHistory>({
    queryKey: queryKeys.deliveryCertification(objectiveId ?? ""),
    queryFn: () => OrchestratorApi.getDeliveryCertification(objectiveId!),
    enabled: Boolean(objectiveId),
    staleTime: 3_000,
  })
}

export function useObjectiveGraph(objectiveId: string | null, page = 1, pageSize = 50) {
  return useQuery<ObjectiveGraph>({
    queryKey: [...queryKeys.objectiveGraph(objectiveId ?? ""), page, pageSize],
    queryFn: () => OrchestratorApi.getObjectiveGraph(objectiveId!, page, pageSize),
    enabled: Boolean(objectiveId),
    refetchInterval: objectiveId ? 5_000 : false,
    staleTime: 1_000,
  })
}

export function useObjectives() {
  return useQuery<ObjectiveSummary[]>({
    queryKey: queryKeys.objectives,
    queryFn: () => OrchestratorApi.getObjectives(),
    staleTime: 3_000,
  })
}

export function useDecisionInbox() {
  return useQuery<DecisionInboxItem[]>({
    queryKey: queryKeys.decisionInbox,
    queryFn: () => OrchestratorApi.getDecisionInbox(),
    staleTime: 3_000,
  })
}

export function useResolveDecision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ decisionId, action }: { decisionId: string; action: string }) => OrchestratorApi.resolveDecision(decisionId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decisionInbox })
      queryClient.invalidateQueries({ queryKey: queryKeys.objectives })
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })
}

export function useArchivedProjects() {
  return useQuery<import("@/services/orchestrator").ArchivedProject[]>({
    queryKey: queryKeys.archivedProjects,
    queryFn: () => OrchestratorApi.getArchivedProjects(),
    staleTime: 10_000,
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

export function useRunEvidence(runId: string | null) {
  return useQuery<RunEvidence>({
    queryKey: queryKeys.runEvidence(runId!),
    queryFn: () => OrchestratorApi.getRunEvidence(runId!),
    enabled: !!runId,
    refetchInterval: runId ? 3_000 : false,
    staleTime: 1_000,
  })
}

export function useRunVisualEvidence(runId: string | null) {
  return useQuery<import("@/services/orchestrator").VisualEvidence[]>({
    queryKey: queryKeys.runVisualEvidence(runId!),
    queryFn: () => OrchestratorApi.getRunVisualEvidence(runId!),
    enabled: !!runId,
    staleTime: 5_000,
  })
}

export function useRunVisualRevisions(runId: string | null) {
  return useQuery<import("@/services/orchestrator").VisualRevisionRecord[]>({
    queryKey: queryKeys.runVisualRevisions(runId!),
    queryFn: () => OrchestratorApi.getRunVisualRevisions(runId!),
    enabled: !!runId,
    refetchInterval: runId ? 3_000 : false,
    staleTime: 1_000,
  })
}

export function useRunVisualCertification(runId: string | null) {
  return useQuery<import("@/services/orchestrator").VisualQACertification | null>({
    queryKey: queryKeys.runVisualCertification(runId!),
    queryFn: () => OrchestratorApi.getRunVisualCertification(runId!),
    enabled: !!runId,
    staleTime: 5_000,
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

export function useRunLogs(runId: string | null, isRunning = false) {
  return useQuery<{ lines: any[]; exists: boolean }>({
    queryKey: queryKeys.runLogs(runId!),
    queryFn: () => OrchestratorApi.getRunLogs(runId!),
    enabled: !!runId,
    refetchInterval: isRunning ? 2_000 : false,
    staleTime: 1_000,
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

export function useHarvestRuns() {
  return useQuery({
    queryKey: queryKeys.knowledgeHarvests,
    queryFn: () => OrchestratorApi.getHarvestRuns(),
    staleTime: 5_000,
  })
}

export function useKnowledgeHealth() {
  return useQuery<VaultHealth>({
    queryKey: queryKeys.knowledgeHealth,
    queryFn: () => OrchestratorApi.getKnowledgeHealth(),
    staleTime: 30_000,
  })
}

export function useKnowledgeMaintenance() {
  return useQuery<KnowledgeMaintenance>({
    queryKey: queryKeys.knowledgeMaintenance,
    queryFn: () => OrchestratorApi.getKnowledgeMaintenance(),
    staleTime: 30_000,
  })
}

export function usePreviewKnowledgeProvenanceMigration() {
  return useMutation<KnowledgeProvenanceMigrationPreview, Error, { reviewDays?: number }>({
    mutationFn: ({ reviewDays } = {}) => OrchestratorApi.previewKnowledgeProvenanceMigration(reviewDays),
  })
}

export function useApplyKnowledgeProvenanceMigration() {
  const queryClient = useQueryClient()
  return useMutation<KnowledgeProvenanceMigrationResult, Error, { planId: string; approvedBy?: string }>({
    mutationFn: ({ planId, approvedBy }) => OrchestratorApi.applyKnowledgeProvenanceMigration(planId, approvedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHealth })
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeMaintenance })
    },
  })
}

export function useRollbackKnowledgeProvenanceMigration() {
  const queryClient = useQueryClient()
  return useMutation<KnowledgeProvenanceMigrationResult, Error, { planId: string; revertedBy?: string }>({
    mutationFn: ({ planId, revertedBy }) => OrchestratorApi.rollbackKnowledgeProvenanceMigration(planId, revertedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHealth })
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeMaintenance })
    },
  })
}

export function usePreviewKnowledgeMerge() {
  return useMutation<KnowledgeMergePreview, Error, { sourcePath: string; targetPath: string }>({
    mutationFn: ({ sourcePath, targetPath }) => OrchestratorApi.previewKnowledgeMerge(sourcePath, targetPath),
  })
}

export function useApplyKnowledgeMerge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sourcePath, targetPath, preview, approvedBy }: { sourcePath: string; targetPath: string; preview: KnowledgeMergePreview; approvedBy?: string }) =>
      OrchestratorApi.applyKnowledgeMerge(sourcePath, targetPath, preview, approvedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeMaintenance })
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHealth })
    },
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

export function useOperationsReadiness() {
  return useQuery<import("@/services/orchestrator").OperationsReadiness>({
    queryKey: queryKeys.operations,
    queryFn: () => OrchestratorApi.getOperationsReadiness(),
    refetchInterval: 15_000,
    staleTime: 5_000,
  })
}

export function useBackupRecoveryStatus() {
  return useQuery<BackupRecoveryStatus>({
    queryKey: queryKeys.backupRecovery,
    queryFn: () => OrchestratorApi.getBackupRecoveryStatus(),
    refetchInterval: 15_000,
    staleTime: 5_000,
  })
}

export function usePreviewBackupSchedule() {
  const client = useQueryClient()
  return useMutation<BackupSchedulePreview, Error, { backupRoot: string; intervalHours: number }>({
    mutationFn: ({ backupRoot, intervalHours }) => OrchestratorApi.previewBackupSchedule(backupRoot, intervalHours),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.backupRecovery }),
  })
}

export function usePreviewBackupRotation() {
  return useMutation<BackupRotationPreview, Error, { backupRoot: string; olderThanDays: number; keepLatest: number }>({
    mutationFn: ({ backupRoot, olderThanDays, keepLatest }) => OrchestratorApi.previewBackupRotation(backupRoot, olderThanDays, keepLatest),
  })
}

export function useVerifyRegisteredBackup() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => OrchestratorApi.verifyRegisteredBackup(),
    onSuccess: () => { client.invalidateQueries({ queryKey: queryKeys.backupRecovery }); client.invalidateQueries({ queryKey: queryKeys.operations }) },
  })
}

export function useRecordRecoveryDrill() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ evidence, result }: { evidence: string; result: "PASS" | "FAIL" }) => OrchestratorApi.recordRecoveryDrill(evidence, result),
    onSuccess: () => { client.invalidateQueries({ queryKey: queryKeys.backupRecovery }); client.invalidateQueries({ queryKey: queryKeys.operations }) },
  })
}

export function useAcknowledgeOperationsAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ alertId, owner, note, snoozeMinutes }: { alertId: string; owner: string; note?: string; snoozeMinutes?: number }) =>
      OrchestratorApi.acknowledgeOperationsAlert(alertId, owner, note, snoozeMinutes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.operations }),
  })
}

export function useResolveOperationsAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ alertId, resolvedBy, evidence, note }: { alertId: string; resolvedBy: string; evidence: string; note?: string }) =>
      OrchestratorApi.resolveOperationsAlert(alertId, resolvedBy, evidence, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.operations }),
  })
}

export function useReleaseOperations() {
  return useQuery<import("@/services/orchestrator").ReleaseOperations>({
    queryKey: queryKeys.releaseOperations,
    queryFn: () => OrchestratorApi.getReleaseOperations(),
    refetchInterval: 15_000,
    staleTime: 5_000,
  })
}

export function useRetentionTrash() {
  return useQuery<import("@/services/orchestrator").RetentionPlan[]>({
    queryKey: queryKeys.retentionTrash,
    queryFn: () => OrchestratorApi.getRetentionTrash(),
    staleTime: 5_000,
  })
}

export function usePreviewRetention() {
  const client = useQueryClient()
  return useMutation({ mutationFn: (days: number) => OrchestratorApi.previewRetention(days), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.operations }) })
}

export function usePurgeRetention() {
  const client = useQueryClient()
  return useMutation({ mutationFn: (planId: string) => OrchestratorApi.purgeRetention(planId), onSuccess: () => { client.invalidateQueries({ queryKey: queryKeys.operations }); client.invalidateQueries({ queryKey: queryKeys.retentionTrash }) } })
}

export function useRestoreRetention() {
  const client = useQueryClient()
  return useMutation({ mutationFn: (trashId: string) => OrchestratorApi.restoreRetention(trashId), onSuccess: () => { client.invalidateQueries({ queryKey: queryKeys.operations }); client.invalidateQueries({ queryKey: queryKeys.retentionTrash }) } })
}

// --- Mutation Hooks ---

export function useUploadAsset() {
  return useMutation({
    mutationFn: (payload: {
      fileName: string
      base64Data: string
      type?: "MOCKUP" | "PROJECT_ASSET"
      projectId?: string
      targetSubDir?: string
    }) => OrchestratorApi.uploadAsset(payload),
  })
}

export function useDeleteAsset() {
  return useMutation({
    mutationFn: (payload: {
      type?: "MOCKUP" | "PROJECT_ASSET"
      relativeVaultPath?: string
      relativeProjectPath?: string
      projectId?: string
    }) => OrchestratorApi.deleteAsset(payload),
  })
}

export function useRequestTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      project: string
      request: string
      autoStart?: boolean
      requestedBy?: string
      attachedAssets?: import("@/services/orchestrator").AttachedAsset[]
    }) => OrchestratorApi.requestTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
    },
  })
}

export function useCreateObjective() {
  return useMutation({
    mutationFn: (payload: {
      mode: ObjectiveMode
      request: string
      projectIds?: string[]
      freshProject?: { projectId: string; targetDirectory: string; blueprint: string }
      attachments?: import("@/services/orchestrator").AttachedAsset[]
    }) => OrchestratorApi.createObjective(payload),
  })
}

export function useGenerateObjectivePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ objectiveId, clarification }: { objectiveId: string; clarification?: string | null }) => OrchestratorApi.generateObjectivePlan(objectiveId, clarification),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.objective(variables.objectiveId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.objectives })
    },
  })
}

export function useApproveObjectivePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ objectiveId, planFingerprint }: { objectiveId: string; planFingerprint?: string | null }) => OrchestratorApi.approveObjectivePlan(objectiveId, planFingerprint),
    onSuccess: (result, variables) => {
      queryClient.setQueryData(queryKeys.objective(variables.objectiveId), (current: ObjectiveLifecycleDetail | undefined) => current ? { ...current, ...result.objective, plan: result.plan } : current)
      queryClient.invalidateQueries({ queryKey: queryKeys.objective(variables.objectiveId) })
    },
  })
}

export function useMaterializeObjectivePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ objectiveId, planId, planFingerprint }: { objectiveId: string; planId: string; planFingerprint: string }) => OrchestratorApi.materializeObjectivePlan(objectiveId, planId, planFingerprint),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.objective(variables.objectiveId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.objectives })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
    },
  })
}

export function useAssignObjectivePlanSkills() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ objectiveId, assignments }: { objectiveId: string; assignments: Array<{ nodeId: string; skillId: string; version: string; checksum?: string }> }) => OrchestratorApi.assignObjectivePlanSkills(objectiveId, assignments),
    onSuccess: (result, variables) => {
      queryClient.setQueryData(queryKeys.objective(variables.objectiveId), (current: ObjectiveLifecycleDetail | undefined) => current ? { ...current, ...result.objective, plan: result.plan } : current)
      queryClient.invalidateQueries({ queryKey: queryKeys.objective(variables.objectiveId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.decisionInbox })
    },
  })
}

export function useRequestObjectivePlanChanges() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ objectiveId, reason }: { objectiveId: string; reason: string }) => OrchestratorApi.requestObjectivePlanChanges(objectiveId, reason),
    onSuccess: (result, variables) => {
      queryClient.setQueryData(queryKeys.objective(variables.objectiveId), (current: ObjectiveLifecycleDetail | undefined) => current ? { ...current, ...result.objective, plan: result.plan } : current)
      queryClient.invalidateQueries({ queryKey: queryKeys.objective(variables.objectiveId) })
    },
  })
}

export function useCancelObjective() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (objectiveId: string) => OrchestratorApi.cancelObjective(objectiveId),
    onSuccess: (result, objectiveId) => {
      queryClient.setQueryData(queryKeys.objective(objectiveId), (current: ObjectiveLifecycleDetail | undefined) => current ? { ...current, ...result.objective, plan: result.plan } : current)
      queryClient.invalidateQueries({ queryKey: queryKeys.objective(objectiveId) })
    },
  })
}

export function useAcceptObjective() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (objectiveId: string) => OrchestratorApi.acceptObjective(objectiveId),
    onSuccess: (result, objectiveId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.objective(objectiveId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.objectiveEvidence(objectiveId) })
    },
  })
}

export function useCreateDeliveryCertification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (objectiveId: string) => OrchestratorApi.createDeliveryCertification(objectiveId),
    onSuccess: (result, objectiveId) => {
      queryClient.setQueryData(queryKeys.deliveryCertification(objectiveId), { latest: result, history: [result] })
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryCertification(objectiveId) })
    },
  })
}

export function useAcceptDeliveryCertification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ objectiveId, certificationId }: { objectiveId: string; certificationId?: string }) => OrchestratorApi.acceptDeliveryCertification(objectiveId, certificationId),
    onSuccess: (result, variables) => {
      queryClient.setQueryData(queryKeys.deliveryCertification(variables.objectiveId), (current: DeliveryCertificationHistory | undefined) => {
        const history = current?.history ?? []
        return { latest: result, history: [result, ...history.filter((item) => item.certificationId !== result.certificationId)] }
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryCertification(variables.objectiveId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.objective(variables.objectiveId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.objectiveEvidence(variables.objectiveId) })
    },
  })
}

export function useRequestObjectiveVisualChanges() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ objectiveId, ...payload }: { objectiveId: string; nodeId: string; reason: string; requestedBy?: string }) =>
      OrchestratorApi.requestObjectiveVisualChanges(objectiveId, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.objective(variables.objectiveId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.objectiveEvidence(variables.objectiveId) })
    },
  })
}

export function useConfirmTaskQueue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      taskInput,
      approvedBy = "user",
    }: {
      projectId: string
      taskInput: string
      approvedBy?: string
    }) => OrchestratorApi.confirmTaskQueue(projectId, taskInput, approvedBy),
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
    mutationFn: ({
      runId,
      ...payload
    }: {
      runId: string
      approvedBy?: string
      decision?: string
      destination?: string
      targetPath?: string
      autoCommit?: boolean
      commitMessage?: string
    }) => OrchestratorApi.acceptRun(runId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeCandidates })
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHarvests })
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHealth })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
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
      visualAnnotations,
      requestedBy,
    }: {
      runId: string
      reason: string
      inlineComments?: InlineDiffComment[]
      visualAnnotations?: Array<{ id?: string; x: number; y: number; width?: number; height?: number; comment: string; createdAt?: string }>
      requestedBy?: string
    }) =>
      OrchestratorApi.requestChanges(runId, reason, inlineComments, requestedBy, visualAnnotations),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.runVisualRevisions(variables.runId) })
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
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHarvests })
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
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHarvests })
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

export function useAggregatePreview() {
  return useMutation<AggregatePreview, Error, { objectiveId: string; options?: { maxProjects?: number; maxServers?: number; maxDurationMs?: number } }>({
    mutationFn: ({ objectiveId, options }) => OrchestratorApi.startAggregatePreview(objectiveId, options),
  })
}

export function useStopAggregatePreview() {
  return useMutation<AggregatePreview, Error, { objectiveId: string; sessionId: string }>({
    mutationFn: ({ objectiveId, sessionId }) => OrchestratorApi.stopAggregatePreview(objectiveId, sessionId),
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

export function useRemoveProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, purge = false }: { projectId: string; purge?: boolean }) =>
      OrchestratorApi.removeProject(projectId, purge),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.archivedProjects })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.runs })
    },
  })
}

export function usePurgeArchivedProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => OrchestratorApi.purgeArchivedProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.archivedProjects })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })
}

export function useRestoreArchivedProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => OrchestratorApi.restoreArchivedProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.archivedProjects })
      queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
    },
  })
}
