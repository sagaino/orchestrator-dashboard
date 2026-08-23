import axios from "@/lib/axios"

export interface DaemonStatus {
  service: string
  running: boolean
  healthy: boolean
  pid: number | null
  startedAt: string | null
  heartbeatAt: string | null
  heartbeatAgeMs: number | null
  restartReconciliation?: {
    status: "PENDING" | "COMPLETE" | "FAILED" | string
    startedAt: string | null
    completedAt: string | null
    runs: number
    jobs: number
    error: string | null
  } | null
  counters: {
    readyEvents: number
    manifestsCreated: number
    deduplicated: number
    jobsStarted: number
    jobsCompleted: number
    jobsFailed: number
    errors: number
  }
  parallel: {
    strategy: string
    maxWorkers: number
    activeWorkers: number
    availableWorkerSlots: number
    activeProjects: string[]
    reservedProjects: string[]
    eligibleQueuedJobCount: number
    blockedQueuedJobCount: number
    blockedQueuedJobs: Array<{ jobId: string; project: string; reason: string }>
  }
  durability?: {
    strategy: string
    sourceOfTruth: string
    activeLeaseCount: number
    invocationCount: number
    invocationCounts: Record<string, number>
    guarantees: {
      atomicJobAdmission: boolean
      projectExclusiveClaim: boolean
      manifestRevisionGuard: boolean
      stableInvocationIdentity: boolean
      uncertainInvocationNeverAutoReplayed: boolean
    }
  }
  notifications: {
    total: number
    unreadCount: number
    latest: Array<{
      id: string
      type: string
      title: string
      taskId: string | null
      createdAt: string
      readAt: string | null
      delivery: string
    }>
  }
  queue: {
    queuedJobCount: number
    runningJobCount: number
    reviewJobCount: number
    latestJobs: Array<{
      jobId: string
      taskId: string
      project: string
      state: string
      runId: string | null
    }>
  }
}

export interface OperationsCheck {
  id: string
  status: "PASS" | "WARN" | "FAIL"
  severity: "INFO" | "WARNING" | "CRITICAL"
  message: string
  action: string
  runbook: string
  metrics?: Record<string, unknown>
}

export interface OperationsReadiness {
  schemaVersion: number
  checkedAt: string
  status: "READY" | "DEGRADED" | "BLOCKED"
  admission: { allowed: boolean; blockers: Array<{ id: string; message: string; action: string }> }
  checks: OperationsCheck[]
  alerts: Array<OperationsAlert>
  signals: Record<string, unknown>
}

export interface OperationsAlert {
  alertId: string
  severity: string
  dedupeKey: string
  acknowledgement: string
  runbook: string
  runbookSteps?: string[]
  message: string
  owner?: string | null
  ownerRole?: string | null
  acknowledgementState?: "ACKNOWLEDGED" | "SNOOZED" | "UNACKNOWLEDGED" | string
  snoozeUntil?: string | null
  resolution?: { resolvedBy?: string; resolvedAt?: string; evidence?: Record<string, unknown>; note?: string } | null
  resolutionEvidenceRequired?: boolean
}

export interface ReleaseOperations {
  schemaVersion: number
  checkedAt: string
  current: { runtimeVersion: string }
  candidate: {
    configured: boolean
    available: boolean
    status: string
    releaseId: string | null
    runtimeVersion: string | null
    sourceCommit: string | null
    builtAt: string | null
    fileCount?: number
    compatibility: { compatible: boolean; outcome: string; errors: string[] }
  }
  queueDrain: {
    drained: boolean
    blockers: Array<{ code: string; reason: string; [key: string]: unknown }>
    counts: { jobs: number; runs: number; invocations: number }
    pending?: { jobs: number; runs: number; invocations: number; total: number }
    activation?: { state: string; daemonStopRequired: boolean; daemonStopOnly: boolean }
    daemon: { running: boolean; pid: number | null }
  }
  compatibility: { compatible: boolean; outcome: string; errors: string[]; contractVersion: string | null }
  backup: { required: boolean; status: string; backupId: string | null; verifiedAt: string | null; backedUpAt: string | null; filesCount: number | null }
  health: { status: string; daemon: { running: boolean; healthy: boolean; heartbeatAt: string | null; heartbeatAgeMs: number | null }; checks: Array<{ id: string; status: string; message: string }> }
  rollback: { required: boolean; protocolVersion: number; evidenceStatus: string; backupId: string | null; message: string }
  activation: { eligible: boolean; state: string; requiresHumanConfirmation: boolean; authority: string; selfAcceptAllowed: boolean; inProcessActivationAllowed: boolean; confirmation: { confirmed: boolean; approvedBy: string | null; approvedAt: string | null } }
}

export interface RetentionPlan {
  planId: string
  status: string
  createdAt: string
  expiresAt?: string
  summary: { candidateCount: number; bytes: number; fileCount: number }
  candidates: Array<{ category: string; name: string; modifiedAt: string; bytes: number; fileCount: number }>
  moved?: Array<{ category: string; name: string; bytes: number }>
}

export interface BackupSchedulePreview {
  action: string
  generatedAt: string
  label: string
  intervalHours: number
  backupRoot: string
  independentTarget: boolean
  launchd: { plist: string; installCommand: string; activated: boolean }
  operations: string[]
  forbiddenAutomaticActions: string[]
}

export interface BackupRotationPreview {
  action: string
  generatedAt: string
  backupRoot: string
  olderThanDays: number
  keepLatest: number
  backups: Array<{ backupId: string; backupPath: string; status: string; createdAt: string | null; modifiedAt: string; verified: boolean }>
  candidates: Array<{ backupId: string; backupPath: string; status: string; createdAt: string | null; modifiedAt: string; verified: boolean }>
  summary: { backupCount: number; candidateCount: number }
  guardrail: string
}

export interface BackupRecoveryStatus {
  schemaVersion: number
  action: string
  generatedAt: string
  target: { configuredTarget: string | null; exists: boolean; independentTarget: boolean | null; registeredBackup: Record<string, unknown> | null; guardrail: string }
  schedule: (BackupSchedulePreview & { action: string; installedAt?: string; launchctlActivated?: boolean }) | null
  drill: { status: "MISSING" | "FAILED" | "OVERDUE" | "CURRENT"; lastDrill: { performedBy: string; performedAt: string; result: string; evidence: unknown } | null; dueAt: string | null; overdueByMs: number | null; intervalDays: number }
  registeredBackup: Record<string, unknown> | null
  guardrails: { automaticRestore: boolean; automaticPromotion: boolean; permanentDelete: boolean }
}

export interface ProjectInfo {
  id: string
  projectPage: string
  repository: string
  agent: string
  graphify: boolean
  graphifyOutput: string
  repositoryExists: boolean
  projectPageExists: boolean
  verificationDefaults: string[]
  graphOutputExists: boolean
  valid: boolean
  projectPagePath: string
}

export interface TaskReadinessSummary {
  verdict: string
  ready: boolean
  summary: {
    passed: number
    blockers: number
    warnings: number
  }
  checks: Array<{
    id: string
    status: string
    message: string
    details?: unknown
  }>
  nextActions: string[]
}

export interface TaskConfirmation {
  schemaVersion: number
  status: string
  approvalMode: string
  allowedPaths: string[]
  verification: string[]
  acceptanceCriteria: string[]
  risk: string
  requiresChanges: boolean
  readiness: TaskReadinessSummary | null
}

export interface TaskRequestResult {
  schemaVersion: number
  action: string
  project: string
  task: {
    id: string
    title: string
    path: string
    status: string
    risk: string
  }
  job: unknown | null
  readiness: TaskReadinessSummary | null
  confirmation: TaskConfirmation
  nextAction: string
}

export interface ConfirmTaskQueueResult {
  schemaVersion: number
  action: "TASK_CONFIRMED_AND_QUEUED" | "TASK_ALREADY_QUEUED"
  approvedBy: string
  readiness: TaskReadinessSummary
  job: {
    jobId: string
    taskId: string
    project: string
    state: string
    runId?: string | null
  }
  nextAction: string
}

export interface ArchivedProject {
  projectId: string
  title: string
  repository: string | null
  removedAt: string | null
  removedBy: string | null
  versionCount: number
  versions: string[]
}

export interface OnboardExistingProjectPayload {
  repositoryPath: string
  projectId?: string
}

export interface OnboardNewProjectPayload {
  projectId: string
  targetDirectory: string
  blueprint?: string
}

export interface VerificationResultItem {
  script: string
  passed: boolean
  exitCode: number
  stdoutTail?: string
  stderrTail?: string
}

export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN"

export interface RunEvidenceVerificationResult {
  command: string
  exitCode: number | null
  status: EvidenceStatus
  stdoutTail: string | null
  stderrTail: string | null
}

export interface RunEvidence {
  schemaVersion: number
  mode: "run-evidence"
  runId: string
  state: string
  project: { id: string | null; repository: string | null }
  task: { id: string | null; title: string | null; status: string | null; path: string | null }
  policy: { allowedPaths: string[]; verificationCommands: string[] }
  approval: { approvedAt?: string; approvedBy?: string; scope?: string } | null
  scope: {
    status: EvidenceStatus
    changedPaths: string[]
    allowedPaths: string[]
    automaticAllowedPaths: string[]
    outOfScopePaths: string[]
    deniedPaths: string[]
  }
  verification: {
    status: EvidenceStatus
    results: RunEvidenceVerificationResult[]
  }
  finalization: {
    status: "APPLIED" | "FAILED" | "NOT_APPLIED"
    acceptedAt: string | null
    acceptedBy: string | null
    humanApproved: boolean
    appliedAt: string | null
    appliedPaths: string[]
    postApplyVerification: {
      status: EvidenceStatus
      results: RunEvidenceVerificationResult[]
    }
    graphify: { skipped?: boolean; exitCode?: number; reason?: string } | null
    git: {
      status: "COMMITTED" | "NO_COMMIT" | "LEGACY_UNKNOWN" | "NOT_APPLICABLE"
      commitHash: string | null
      parentCommit: string | null
      commitMessage: string | null
      reason: string | null
      paths: string[]
    }
    artifactPath: string | null
    workspaceState: string | null
  }
  knowledge: {
    proposal: Record<string, unknown> | null
    approval: Record<string, unknown> | null
    sync: Record<string, unknown> | null
  }
  telemetry: Record<string, unknown> | null
  restart: {
    status: "RECONCILED" | "MANUAL_RECOVERY_REQUIRED"
    action: string
    previousState: string | null
    reconciledAt: string | null
    taskSyncError: string | null
  } | null
  history: RunHistoryEntry[]
  nextAction: string
  integrity: { status: "OK" | "WARNING"; warnings: string[] }
  audit: { runId: string; createdAt: string | null; updatedAt: string | null }
}

export type VisualEvidenceStatus = "PASS" | "FAIL" | "UNKNOWN"

export interface VisualComparisonDiagnostics {
  reason?: string
  issues?: string[]
  pixelThreshold?: number
  maxMismatchRatio?: number
  mismatchRatio?: number
  dimensions?: { actual: { width: number; height: number }; reference: { width: number; height: number } }
  layout?: { horizontalOverflow?: boolean; scrollWidth?: number; clientWidth?: number; clippedElements?: Array<Record<string, unknown>> } | null
  route?: { status?: string; httpStatus?: number | null; title?: string | null } | null
  viewport?: { width?: number; height?: number } | null
  artifacts?: { sideBySidePath?: string; overlayPath?: string } | null
}

export interface VisualEvidence {
  schemaVersion: number
  mode: "visual-evidence"
  evidenceId: string
  runId: string
  route: string
  viewport: { name: string; width: number; height: number; deviceScaleFactor?: number }
  reference: { kind: string; path: string | null; checksum: string | null }
  actual: { status: "CAPTURED" | "UNAVAILABLE"; path: string | null; capturedAt: string | null; diagnostics?: Record<string, unknown> | null }
  comparison: { status: VisualEvidenceStatus; method: string; score: number | null; mismatchPixels: number | null; notes: string[]; diagnostics?: VisualComparisonDiagnostics | null }
  accessibility: { schemaVersion?: number | null; status: VisualEvidenceStatus; findings: Array<{ id?: string; severity?: string; message: string; selector?: string | null }>; checks?: { controls?: number; images?: number; headings?: number; contrastEvaluated?: number; keyboardEvaluated?: boolean; bounded?: boolean; unavailable?: boolean } | null }
  revision: { number: number; requestedBy: string | null; reason: string | null; createdAt: string }
  artifact: { path: string | null; exists: boolean; sha256: string | null; bytes: number | null; contentType: string }
  createdAt: string
}

export interface VisualRevisionRecord {
  schemaVersion: number
  mode: "visual-revision"
  revisionId: string
  runId: string
  iteration: number
  status: "AWAITING_AFTER_EVIDENCE" | "COMPLETED" | string
  requestedAt: string
  requestedBy: string
  reason: string
  inlineComments: Array<{ file: string; line: number | null; comment: string }>
  visualAnnotations: Array<{ id: string; x: number; y: number; width: number | null; height: number | null; comment: string; createdAt: string }>
  beforeEvidenceIds: string[]
  afterEvidenceIds: string[]
  updatedAt: string
}

export interface VisualQACertification {
  schemaVersion: number
  mode: "visual-qa-certification"
  certificationId: string
  runId: string
  createdAt: string
  status: "CERTIFIED" | "HUMAN_GATE_REQUIRED" | "BLOCKED" | string
  blockers: string[]
  humanGate: { required: boolean; confirmed: boolean; confirmedBy: string | null; confirmedAt: string | null }
  scope: { projectId: string | null; taskId: string | null }
  captureIds: { baseline: string; postChange: string }
  revisionIteration: number
  checks: Record<string, { status: string; [key: string]: unknown }>
}

export interface RunHistoryEntry {
  event: string
  state: string
  at: string
  message?: string
}

export interface KnowledgeCandidateProposal {
  title?: string
  type?: string
  targetPath?: string
  summary?: string
}

export interface RunRetrospectiveData {
  analysis?: string
  summary?: string
  knowledgeDecision?: "PROJECT_ONLY" | "CANDIDATE" | "WIKI" | "IGNORE" | "UPDATE" | "NEW" | string
  confidence?: number
  suggestedRouting?: string
  notes?: string
  candidateProposal?: KnowledgeCandidateProposal
}

export interface RunManifest {
  schemaVersion: number
  runId: string
  state: "PENDING_APPROVAL" | "APPROVED" | "CLAIMING" | "CLAIMED" | "RUNNING" | "EXECUTING" | "SCOPE_AUDIT" | "VERIFYING" | "GRAPHIFY" | "REVIEW" | "RETROSPECTIVE" | "DONE" | "FAILED" | "BLOCKED"
  project: {
    id: string
    repository: string
  }
  task: {
    id: string
    title?: string
    path: string
    status: string
    verification?: string[]
    allowedPaths?: string[]
    requiresChanges?: boolean
    sources?: string[]
  }
  execution?: {
    claimedAt?: string
    completedAt?: string
    exitCode?: number
    frozenVerificationScripts?: Record<string, string>
    scopeAudit?: {
      passed: boolean
      modifiedFiles: string[]
      outOfScopeFiles: string[]
      deniedFilesBlocked: string[]
    }
    verification?: {
      allPassed: boolean
      results: VerificationResultItem[]
    }
    graphify?: {
      skipped: boolean
      exitCode?: number
    }
  }
  telemetry?: {
    model?: string
    effort?: string
    durationMs?: number
    tokens?: {
      inputTokens?: number
      outputTokens?: number
      cacheReadTokens?: number
      totalTokens?: number
    }
  }
  retrospective?: RunRetrospectiveData
  knowledge?: {
    proposal?: {
      classification?: string
      confidence?: number
      title?: string
      type?: string
      targetPath?: string | null
      summary?: string
      rationale?: string
      considerations?: string[]
      relatedKnowledge?: string[]
    }
    proposedAt?: string
    approval?: {
      approvedAt?: string
      approvedBy?: string
      classification?: string
      destination?: string
      targetPath?: string | null
    }
    sync?: {
      syncedAt?: string
      destination?: string
      sourcePath?: string
      targetPath?: string | null
    }
  }
  history?: RunHistoryEntry[]
}

export interface KnowledgeCandidate {
  candidateId: string
  title: string
  type: string
  confidence: number
  provenance: string
  candidatePath: string
  summary: string
  createdAt: string
}

export interface IngestKnowledgePayload {
  content: string
  title?: string
  domain: string
  type: string
  destination?: "WIKI" | "CANDIDATE"
}

export interface HarvestKnowledgePayload {
  repositoryPath: string
  domain?: string
  mode?: "normal" | "pro"
  async?: boolean
}

export interface HarvestedKnowledgeArticle {
  title: string
  type: string
  targetPath?: string
  destination?: "WIKI" | "CANDIDATE" | string
  confidence?: number
  summary?: string
}

export interface HarvestRunPattern {
  title: string
  summary: string
  confidence: number
  destination: "WIKI" | "CANDIDATE"
  tags: string[]
  keyPoints?: string[]
  codeStructure?: string
  codeSnippets?: Array<{
    language?: string
    description?: string
    code: string
  }>
}

export interface HarvestRun {
  harvestId: string
  repositoryPath: string
  packageName?: string
  domain: string
  capturedAt: string | null
  count: number
  patterns: HarvestRunPattern[]
  scanSummary?: {
    packageName?: string
    detectedPatterns?: Record<string, any>
  }
  sourcePath: string
}

export interface HarvestKnowledgeResponse {
  success?: boolean
  message?: string
  repositoryPath?: string
  domain?: string
  articles?: HarvestedKnowledgeArticle[]
  items?: HarvestedKnowledgeArticle[]
  count?: number
  [key: string]: any
}

export interface VaultHealth {
  schemaVersion: number
  timestamp: string
  healthy: boolean
  errors: Array<{ code: string; message: string; file?: string }>
  warnings: Array<{ code: string; message: string; file?: string }>
  findings?: Array<{ check?: string; code?: string; severity?: string; message: string; path?: string; file?: string }>
  summary?: {
    pagesScanned?: number
    errors?: number
    warnings?: number
    info?: number
    safeFixesAvailable?: number
  }
  unindexedCount: number
  brokenLinksCount: number
  orphanCandidatesCount: number
}

export interface KnowledgeDuplicateCandidate {
  candidateId: string
  kind: "EXACT_TITLE" | "NEAR_DUPLICATE" | string
  left: { path: string; title: string; scope: string }
  right: { path: string; title: string; scope: string }
  score: number
  titleScore: number
  contentScore: number
  contradictionCandidate: boolean
}

export interface KnowledgeStaleItem {
  queueId: string
  status: "STALE" | "DUE_SOON" | "LEGACY_REVIEW" | string
  path: string
  title: string
  scope: string
  reviewBy: string | null
  updated: string | null
  owner: string | null
  supersession: string | null
  reason: string
}

export interface KnowledgeMaintenance {
  schemaVersion: number
  action: string
  generatedAt: string
  duplicates: KnowledgeDuplicateCandidate[]
  stale: KnowledgeStaleItem[]
  summary: { duplicateCandidates: number; staleReviewItems: number; exactTitleDuplicates: number; contradictionCandidates: number }
}

export interface KnowledgeMergePreview {
  action: "KNOWLEDGE_MERGE_PREVIEW"
  source: { path: string; title: string; checksum: string; bytes: number }
  target: { path: string; title: string; checksum: string; bytes: number }
  similarity: KnowledgeDuplicateCandidate | null
  proposedChanges: { targetAppend: string; sourceMetadata: Record<string, string>; sourceRetained: boolean; indexUpdate: string }
  confirmation: { required: boolean; phrase: string; expectedSourceChecksum: string; expectedTargetChecksum: string }
}

export interface KnowledgeProvenanceMigrationPreview {
  schemaVersion: number
  action: string
  status: "PREVIEW" | string
  planId: string
  createdAt: string
  scope: string
  reviewDays: number
  summary: { candidateCount: number; changedFieldCount: number; inferredFieldCount: number }
  files: Array<{ path: string; title: string; beforeChecksum: string; afterChecksum: string; changedFields: string[]; inferredFields: string[] }>
  auditPath: string
  confirmation: { required: boolean; phrase: string; expectedStatus: string }
  guardrail: string
}

export interface KnowledgeProvenanceMigrationResult {
  schemaVersion: number
  action: string
  status: "APPLIED" | "ROLLED_BACK" | string
  planId: string
  appliedAt?: string
  rolledBackAt?: string
  approvedBy?: string
  revertedBy?: string
  summary: { candidateCount: number; changedFieldCount: number; inferredFieldCount: number }
  auditPath: string
  rollback?: { available: boolean; command: string }
}

export interface TelemetryReport {
  schemaVersion: number
  mode: string
  generatedAt: string
  projectId: string | null
  runCount: number
  telemetry?: {
    records: Array<{
      recordId: string
      stage: string
      model?: string
      durationSeconds: number
      usage?: {
        inputTokens: number
        outputTokens: number
        thinkingTokens: number
        cacheReadTokens: number
        totalTokens: number
        contextTokens: number
      }
      source?: "explicit" | "inferred"
      metadata?: {
        runId?: string
        taskId?: string
        projectId?: string
      }
    }>
    summary?: {
      calls: number
      measuredCalls: number
      durationSeconds: number
      usage: {
        inputTokens: number
        outputTokens: number
        thinkingTokens: number
        cacheReadTokens: number
        totalTokens: number
        contextTokens: number
      }
      byStage?: Record<string, { calls: number; durationSeconds: number; usage: { totalTokens: number } }>
    }
  }
  summary?: {
    explicitRecords: number
    inferredRecords: number
    inferredSkippedByExplicit: number
  }
  latestRuns?: Array<{
    runId: string
    taskId: string | null
    projectId: string | null
    state: string
    calls: number
    totalTokens: number
    durationSeconds: number
    warning: boolean
  }>
}

export interface DiffFile {
  file: string
  status: "modified" | "added" | "deleted"
  additions: number
  deletions: number
  patch: string
}

export interface InlineDiffComment {
  file: string
  line: number
  comment: string
}

export interface RunDiffData {
  runId: string
  workspaceExists: boolean
  archived?: boolean
  workspacePath?: string
  rawDiff: string
  filesCount?: number
  files: DiffFile[]
  message?: string
  error?: string
}

export interface DevServerStatus {
  runId: string
  running: boolean
  port: number | null
  url: string | null
  status: "STARTING" | "RUNNING" | "STOPPED"
  startedAt?: string
  logTail: string[]
}

export interface RtkAnalytics {
  available: boolean
  service: string
  summary: {
    totalCommands: number
    totalInputTokens: number
    totalOutputTokens: number
    totalSavedTokens: number
    savingsPercentage: number
    totalTimeMs: number
    avgTimeMs: number
  }
  generatedAt: string
}

export interface AttachedAsset {
  type: "MOCKUP" | "PROJECT_ASSET"
  fileName: string
  relativeVaultPath?: string
  relativeProjectPath?: string
  absolutePath: string
  url?: string
  importPath?: string
  sizeBytes: number
}

export type ObjectiveMode = "FRESH_PROJECT" | "EXISTING_PROJECT" | "CROSS_PROJECT_INCIDENT"

export interface ObjectiveBudget {
  maxSubtasks: number
  maxParallelAgents: number
  maxRetriesPerNode: number
  maxTotalTokens: number | null
  deadlineAt: string | null
}

export interface ObjectiveRecord {
  objectiveId: string
  mode: ObjectiveMode
  state: string
  request: string
  requestedBy?: string
  projectIds: string[]
  freshProject: {
    proposalId: string
    action: string
    projectId: string
    targetDirectory: string
    blueprint: string
    request: string
  } | null
  activePlanId: string | null
  activeOrchestrationId: string | null
  budget: ObjectiveBudget
  createdAt: string
  updatedAt: string
}

export interface PlanNodeReview {
  nodeId: string
  title: string
  purpose: string
  projectId: string
  role: string
  type: string
  dependsOn: string[]
  acceptanceCriteria: string[]
  allowedPaths: string[]
  verification: string[]
  risk: string
  complexity: string
  requiresChanges: boolean
  canRunInParallel: boolean
  writeConflictGroup?: string | null
  contextFrom?: string[]
  skills?: string[]
}

export interface ObjectivePlanReview {
  schemaVersion: number
  revision: number
  planId: string
  objectiveId: string
  state: "PENDING_APPROVAL" | "APPROVED" | "SUPERSEDED" | "CANCELLED" | string
  summary: string
  architectureDecisions: string[]
  assumptions: string[]
  clarificationNeeded: boolean
  clarificationQuestion: string | null
  projects: string[]
  nodes: PlanNodeReview[]
  integration: {
    required: boolean
    projectVerification: string[]
    crossProjectVerification: string[]
    previewRequired: boolean
  }
  risk: string
  complexity: string
  estimatedTokens?: number
  approvedBy: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt?: string
  planFingerprint?: string
}

export interface ObjectiveDecision {
  decisionId: string
  objectiveId: string
  nodeId: string | null
  runId: string | null
  type: string
  state: string
  evidence: Record<string, unknown> | unknown[]
  requestedAction: string
  allowedChoices: string[]
  creator: "SYSTEM" | string
  createdAt: string
  resolution: {
    action: string
    resolvedBy: string
    resolvedAt: string
  } | null
}

export interface ObjectiveIntakeResult {
  objective: ObjectiveRecord
  summary: Record<string, unknown>
  planning: {
    started: boolean
    readOnly: boolean
    tasksCreated: number
    jobsCreated: number
    runsCreated: number
    planRevision?: number
  }
  plan?: ObjectivePlanReview | null
  decisions?: ObjectiveDecision[]
}

export interface ObjectiveLifecycleDetail extends ObjectiveRecord {
  plan: ObjectivePlanReview | null
  orchestration: Record<string, unknown> | null
  decisions: ObjectiveDecision[]
  decisionSummary: { open: ObjectiveDecision[]; recent: ObjectiveDecision[] }
}

export const OrchestratorApi = {
  // Operations Center & resource governance
  async getOperationsReadiness() {
    const res = await axios.get<{ success: boolean; data: OperationsReadiness }>("/api/operations/readiness")
    return res.data.data
  },

  async getBackupRecoveryStatus() {
    const res = await axios.get<{ success: boolean; data: BackupRecoveryStatus }>("/api/operations/backups/status")
    return res.data.data
  },

  async previewBackupSchedule(backupRoot: string, intervalHours = 24) {
    const res = await axios.post<{ success: boolean; data: BackupSchedulePreview }>("/api/operations/backups/schedule/preview", { backupRoot, intervalHours })
    return res.data.data
  },

  async previewBackupRotation(backupRoot: string, olderThanDays = 30, keepLatest = 2) {
    const res = await axios.post<{ success: boolean; data: BackupRotationPreview }>("/api/operations/backups/rotation/preview", { backupRoot, olderThanDays, keepLatest })
    return res.data.data
  },

  async verifyRegisteredBackup() {
    const res = await axios.post<{ success: boolean; data: { action: string; status: Record<string, unknown> } }>("/api/operations/backups/verify", {})
    return res.data.data
  },

  async recordRecoveryDrill(evidence: string, result: "PASS" | "FAIL" = "PASS") {
    const res = await axios.post<{ success: boolean; data: Record<string, unknown> }>("/api/operations/recovery-drill/record", { evidence, result })
    return res.data.data
  },

  async acknowledgeOperationsAlert(alertId: string, owner: string, note?: string, snoozeMinutes?: number) {
    const res = await axios.post<{ success: boolean; data: any }>("/api/operations/alerts/acknowledge", { alertId, acknowledgedBy: owner, owner, note, snoozeMinutes })
    return res.data.data
  },

  async resolveOperationsAlert(alertId: string, resolvedBy: string, evidence: string, note?: string) {
    const res = await axios.post<{ success: boolean; data: any }>("/api/operations/alerts/resolve", { alertId, resolvedBy, evidence: { summary: evidence }, note })
    return res.data.data
  },

  async getReleaseOperations() {
    const res = await axios.get<{ success: boolean; data: ReleaseOperations }>("/api/operations/release")
    return res.data.data
  },

  async previewRetention(olderThanDays = 30) {
    const res = await axios.post<{ success: boolean; data: RetentionPlan }>("/api/operations/retention/preview", { olderThanDays })
    return res.data.data
  },

  async purgeRetention(planId: string) {
    const res = await axios.post<{ success: boolean; data: RetentionPlan }>("/api/operations/retention/purge", { planId, confirm: true })
    return res.data.data
  },

  async getRetentionTrash() {
    const res = await axios.get<{ success: boolean; data: RetentionPlan[] }>("/api/operations/retention/trash")
    return res.data.data
  },

  async restoreRetention(trashId: string) {
    const res = await axios.post<{ success: boolean; data: RetentionPlan }>("/api/operations/retention/restore", { trashId, confirm: true })
    return res.data.data
  },
  // RTK & Telemetry
  async getRtkTelemetry() {
    const res = await axios.get<{ success: boolean; data: RtkAnalytics }>("/api/telemetry/rtk")
    return res.data.data
  },
  // Diff & Dev Server
  async getRunDiff(runId: string) {
    const res = await axios.get<{ success: boolean; data: RunDiffData }>(`/api/runs/${runId}/diff`)
    return res.data.data
  },

  async getRunLogs(runId: string) {
    const res = await axios.get<{ success: boolean; data: { lines: any[]; exists: boolean } }>(`/api/runs/${runId}/logs`)
    return res.data.data
  },

  async startDevServer(runId: string) {
    const res = await axios.post<{ success: boolean; data: DevServerStatus }>(`/api/runs/${runId}/dev-server/start`)
    return res.data.data
  },

  async stopDevServer(runId: string) {
    const res = await axios.post<{ success: boolean; data: any }>(`/api/runs/${runId}/dev-server/stop`)
    return res.data.data
  },

  async getDevServerStatus(runId: string) {
    const res = await axios.get<{ success: boolean; data: DevServerStatus }>(`/api/runs/${runId}/dev-server/status`)
    return res.data.data
  },
  // System & Health
  async getHealth() {
    const res = await axios.get<{ success: boolean; data: { status: string; service: string; version: string } }>("/api/health")
    return res.data.data
  },

  async getDaemonStatus() {
    const res = await axios.get<{ success: boolean; data: DaemonStatus }>("/api/daemon/status")
    return res.data.data
  },

  // Projects
  async getProjects() {
    const res = await axios.get<{ success: boolean; data: { projects: ProjectInfo[] } }>("/api/projects")
    return res.data.data.projects
  },

  async getProjectDetail(id: string) {
    const res = await axios.get<{ success: boolean; data: ProjectInfo }>(`/api/projects/${id}`)
    return res.data.data
  },

  async onboardExistingProject(payload: { repositoryPath: string; projectId?: string }) {
    const res = await axios.post<{ success: boolean; data: any }>("/api/projects/onboard/existing", payload)
    return res.data.data
  },

  async onboardNewProject(payload: { projectId: string; targetDirectory: string; blueprint?: string }) {
    const res = await axios.post<{ success: boolean; data: any }>("/api/projects/onboard/new", payload)
    return res.data.data
  },

  async removeProject(projectId: string, purge = false) {
    const res = await axios.delete<{ success: boolean; data: any }>(`/api/projects/${projectId}`, {
      data: { purge },
    })
    return res.data.data
  },

  async getArchivedProjects() {
    const res = await axios.get<{ success: boolean; data: { archivedProjects: ArchivedProject[] } }>("/api/projects-archive")
    return res.data.data.archivedProjects || []
  },

  async purgeArchivedProject(projectId: string) {
    const res = await axios.delete<{ success: boolean; data: any }>(`/api/projects-archive/${projectId}`)
    return res.data.data
  },

  async restoreArchivedProject(projectId: string) {
    const res = await axios.post<{ success: boolean; data: any }>(`/api/projects-archive/${projectId}/restore`)
    return res.data.data
  },

  // Assets (UI Mockups & Project Assets)
  async uploadAsset(payload: {
    fileName: string
    base64Data: string
    type?: "MOCKUP" | "PROJECT_ASSET"
    projectId?: string
    targetSubDir?: string
  }) {
    const res = await axios.post<{ success: boolean; data: AttachedAsset }>("/api/assets/upload", payload)
    return res.data.data
  },

  async deleteAsset(payload: {
    type?: "MOCKUP" | "PROJECT_ASSET"
    relativeVaultPath?: string
    relativeProjectPath?: string
    projectId?: string
  }) {
    const res = await axios.post<{ success: boolean; data: { deleted: boolean; path: string } }>("/api/assets/delete", payload)
    return res.data.data
  },

  async createObjective(payload: {
    mode: ObjectiveMode
    request: string
    projectIds?: string[]
    freshProject?: {
      projectId: string
      targetDirectory: string
      blueprint: string
    }
  }) {
    const randomPart = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const res = await axios.post<{ success: boolean; data: ObjectiveIntakeResult }>("/api/objectives", payload, {
      headers: { "Idempotency-Key": `dashboard-objective-${randomPart}` },
    })
    return res.data.data
  },

  async getObjective(objectiveId: string) {
    const res = await axios.get<{ success: boolean; data: ObjectiveLifecycleDetail }>(`/api/objectives/${encodeURIComponent(objectiveId)}`)
    return res.data.data
  },

  async approveObjectivePlan(objectiveId: string, planFingerprint?: string | null) {
    const randomPart = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const res = await axios.post<{ success: boolean; data: { objective: ObjectiveRecord; plan: ObjectivePlanReview; decision: ObjectiveDecision; alreadyApproved: boolean; planFingerprint: string } }>(
      `/api/objectives/${encodeURIComponent(objectiveId)}/approve-plan`,
      planFingerprint ? { planFingerprint } : {},
      { headers: { "Idempotency-Key": `dashboard-plan-approval-${randomPart}` } },
    )
    return res.data.data
  },

  async requestObjectivePlanChanges(objectiveId: string, reason: string) {
    const randomPart = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const res = await axios.post<{ success: boolean; data: { objective: ObjectiveRecord; plan: ObjectivePlanReview; previousPlan: ObjectivePlanReview | null } }>(
      `/api/objectives/${encodeURIComponent(objectiveId)}/request-plan-changes`,
      { reason },
      { headers: { "Idempotency-Key": `dashboard-plan-changes-${randomPart}` } },
    )
    return res.data.data
  },

  async cancelObjective(objectiveId: string) {
    const randomPart = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const res = await axios.post<{ success: boolean; data: { objective: ObjectiveRecord; plan: ObjectivePlanReview | null; alreadyCancelled: boolean } }>(
      `/api/objectives/${encodeURIComponent(objectiveId)}/cancel`,
      {},
      { headers: { "Idempotency-Key": `dashboard-objective-cancel-${randomPart}` } },
    )
    return res.data.data
  },

  // Tasks & Intake
  async requestTask(payload: {
    project: string
    request: string
    autoStart?: boolean
    requestedBy?: string
    attachedAssets?: AttachedAsset[]
  }) {
    const res = await axios.post<{ success: boolean; data: TaskRequestResult }>("/api/tasks/request", payload)
    return res.data.data
  },

  async confirmTaskQueue(projectId: string, taskInput: string, approvedBy = "user") {
    const res = await axios.post<{ success: boolean; data: ConfirmTaskQueueResult }>(
      `/api/tasks/${projectId}/${taskInput}/queue`,
      { approvedBy },
    )
    return res.data.data
  },

  async getTaskContext(projectId: string, taskInput: string) {
    const res = await axios.get<{ success: boolean; data: any }>(`/api/tasks/${projectId}/${taskInput}/context`)
    return res.data.data
  },

  async getTaskPlan(projectId: string, taskInput: string) {
    const res = await axios.get<{ success: boolean; data: any }>(`/api/tasks/${projectId}/${taskInput}/plan`)
    return res.data.data
  },

  // Runs & Review Lifecycle
  async getRuns() {
    const res = await axios.get<{ success: boolean; data: RunManifest[] }>("/api/runs")
    return res.data.data
  },

  async getRunDetail(runId: string) {
    const res = await axios.get<{ success: boolean; data: RunManifest }>(`/api/runs/${runId}`)
    return res.data.data
  },

  async getRunEvidence(runId: string) {
    const res = await axios.get<{ success: boolean; data: RunEvidence }>(`/api/runs/${runId}/evidence`)
    return res.data.data
  },

  async getRunVisualEvidence(runId: string) {
    const res = await axios.get<{ success: boolean; data: VisualEvidence[] }>(`/api/runs/${runId}/visual-evidence`)
    return res.data.data
  },

  async getRunVisualRevisions(runId: string) {
    const res = await axios.get<{ success: boolean; data: VisualRevisionRecord[] }>(`/api/runs/${runId}/visual-revisions`)
    return res.data.data
  },

  async getRunVisualCertification(runId: string) {
    const res = await axios.get<{ success: boolean; data: VisualQACertification | null }>(`/api/runs/${runId}/visual-certification`)
    return res.data.data
  },

  async getJobs() {
    const res = await axios.get<{ success: boolean; data: any[] }>("/api/jobs")
    return res.data.data
  },

  async previewRun(runId: string) {
    const res = await axios.post<{ success: boolean; data: { workspacePath: string; opened: boolean } }>(`/api/runs/${runId}/preview`)
    return res.data.data
  },

  async requestChanges(runId: string, reason: string, inlineComments: InlineDiffComment[] = [], requestedBy = "user", visualAnnotations: Array<{ id?: string; x: number; y: number; width?: number; height?: number; comment: string; createdAt?: string }> = []) {
    const res = await axios.post<{ success: boolean; data: RunManifest }>(`/api/runs/${runId}/request-changes`, {
      reason,
      inlineComments,
      requestedBy,
      visualAnnotations,
    })
    return res.data.data
  },

  async startRun(runId: string, approvedBy = "user") {
    const res = await axios.post<{ success: boolean; data: RunManifest }>(`/api/runs/${runId}/start`, {
      approvedBy,
    })
    return res.data.data
  },

  async acceptRun(
    runId: string,
    payload: {
      approvedBy?: string
      decision?: string
      destination?: string
      targetPath?: string
      autoCommit?: boolean
      commitMessage?: string
    } = {}
  ) {
    const res = await axios.post<{ success: boolean; data: RunManifest }>(`/api/runs/${runId}/accept`, {
      approvedBy: payload.approvedBy || "user",
      ...payload,
    })
    return res.data.data
  },

  async rejectRun(runId: string, reason = "Rejected via dashboard", rejectedBy = "user") {
    const res = await axios.post<{ success: boolean; data: RunManifest }>(`/api/runs/${runId}/reject`, {
      reason,
      rejectedBy,
    })
    return res.data.data
  },

  async recoverRun(runId: string, force = false, recoveredBy = "user") {
    const res = await axios.post<{ success: boolean; data: RunManifest }>(`/api/runs/${runId}/recover`, {
      force,
      recoveredBy,
    })
    return res.data.data
  },

  async retryRun(runId: string, force = false, requestedBy = "user") {
    const res = await axios.post<{ success: boolean; data: any }>(`/api/runs/${runId}/retry`, {
      force,
      requestedBy,
    })
    return res.data.data
  },

  // Knowledge
  async getKnowledgeCandidates() {
    const res = await axios.get<{ success: boolean; data: any }>("/api/knowledge/candidates")
    const candidates = res.data?.data?.candidates ?? res.data?.data ?? []
    if (!Array.isArray(candidates)) return []
    return candidates.map((item: any) => ({
      ...item,
      candidateId: item.candidateId || item.id || item.title || "",
      candidatePath: item.candidatePath || item.path || "",
    }))
  },

  async ingestKnowledge(payload: IngestKnowledgePayload) {
    const res = await axios.post<{ success: boolean; data: any }>("/api/knowledge/ingest", payload)
    return res.data.data
  },

  async harvestKnowledge(payload: HarvestKnowledgePayload) {
    const res = await axios.post<{ success: boolean; data: HarvestKnowledgeResponse }>("/api/knowledge/harvest", payload)
    return res.data.data
  },

  async promoteKnowledge(selector: string, targetPath?: string, approvedBy = "user") {
    const res = await axios.post<{ success: boolean; data: any }>("/api/knowledge/promote", {
      selector,
      targetPath,
      approvedBy,
    })
    return res.data.data
  },

  async rejectKnowledge(selector: string, reason = "Rejected via dashboard", rejectedBy = "user") {
    const res = await axios.post<{ success: boolean; data: any }>("/api/knowledge/reject", {
      selector,
      reason,
      rejectedBy,
    })
    return res.data.data
  },

  async getHarvestRuns() {
    const res = await axios.get<{ success: boolean; data: HarvestRun[] }>("/api/knowledge/harvests")
    const list = res.data?.data ?? []
    return Array.isArray(list) ? list : []
  },

  async getKnowledgeHealth() {
    const res = await axios.get<{ success: boolean; data: VaultHealth }>("/api/knowledge/health")
    return res.data.data
  },

  async getKnowledgeMaintenance() {
    const res = await axios.get<{ success: boolean; data: KnowledgeMaintenance }>("/api/knowledge/maintenance")
    return res.data.data
  },

  async previewKnowledgeProvenanceMigration(reviewDays = 180) {
    const res = await axios.post<{ success: boolean; data: KnowledgeProvenanceMigrationPreview }>("/api/knowledge/provenance/migration/preview", { reviewDays })
    return res.data.data
  },

  async applyKnowledgeProvenanceMigration(planId: string, approvedBy = "user") {
    const res = await axios.post<{ success: boolean; data: KnowledgeProvenanceMigrationResult }>("/api/knowledge/provenance/migration/apply", { planId, approvedBy, confirmed: true })
    return res.data.data
  },

  async rollbackKnowledgeProvenanceMigration(planId: string, revertedBy = "user") {
    const res = await axios.post<{ success: boolean; data: KnowledgeProvenanceMigrationResult }>("/api/knowledge/provenance/migration/rollback", { planId, revertedBy, confirmed: true })
    return res.data.data
  },

  async previewKnowledgeMerge(sourcePath: string, targetPath: string) {
    const res = await axios.get<{ success: boolean; data: KnowledgeMergePreview }>("/api/knowledge/merge/preview", { params: { source: sourcePath, target: targetPath } })
    return res.data.data
  },

  async applyKnowledgeMerge(sourcePath: string, targetPath: string, preview: KnowledgeMergePreview, approvedBy = "user") {
    const res = await axios.post<{ success: boolean; data: any }>("/api/knowledge/merge/apply", {
      sourcePath,
      targetPath,
      approvedBy,
      confirmed: true,
      expectedSourceChecksum: preview.confirmation.expectedSourceChecksum,
      expectedTargetChecksum: preview.confirmation.expectedTargetChecksum,
    })
    return res.data.data
  },

  async revertKnowledgeMerge(planId: string, revertedBy = "user") {
    const res = await axios.post<{ success: boolean; data: any }>("/api/knowledge/merge/revert", { planId, revertedBy, confirmed: true })
    return res.data.data
  },

  async fixSafeKnowledgeHealth() {
    const res = await axios.post<{ success: boolean; data: any }>("/api/knowledge/health/fix-safe")
    return res.data.data
  },

  // Notifications & Telemetry
  async getNotifications() {
    const res = await axios.get<{ success: boolean; data: any[] }>("/api/notifications")
    return res.data.data
  },

  async markNotificationsRead(selector?: string, readBy = "user") {
    const res = await axios.post<{ success: boolean; data: any }>("/api/notifications/read", {
      selector,
      readBy,
    })
    return res.data.data
  },

  async emitTestNotification() {
    const res = await axios.post<{ success: boolean; data: any }>("/api/notifications/test")
    return res.data.data
  },

  async getTelemetry(projectId?: string) {
    const params = projectId ? `?projectId=${projectId}` : ""
    const res = await axios.get<{ success: boolean; data: TelemetryReport }>(`/api/telemetry${params}`)
    return res.data.data
  },
}
