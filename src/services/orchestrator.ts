import axios from "@/lib/axios"

export interface DaemonStatus {
  service: string
  running: boolean
  healthy: boolean
  pid: number | null
  startedAt: string | null
  heartbeatAt: string | null
  heartbeatAgeMs: number | null
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
    path: string
    status: string
    verification?: string[]
    allowedPaths?: string[]
    requiresChanges?: boolean
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
  unindexedCount: number
  brokenLinksCount: number
  orphanCandidatesCount: number
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

export const OrchestratorApi = {
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

  // Tasks & Intake
  async requestTask(payload: { project: string; request: string; autoStart?: boolean; requestedBy?: string }) {
    const res = await axios.post<{ success: boolean; data: any }>("/api/tasks/request", payload)
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

  async getJobs() {
    const res = await axios.get<{ success: boolean; data: any[] }>("/api/jobs")
    return res.data.data
  },

  async previewRun(runId: string) {
    const res = await axios.post<{ success: boolean; data: { workspacePath: string; opened: boolean } }>(`/api/runs/${runId}/preview`)
    return res.data.data
  },

  async requestChanges(runId: string, reason: string, inlineComments: InlineDiffComment[] = [], requestedBy = "user") {
    const res = await axios.post<{ success: boolean; data: RunManifest }>(`/api/runs/${runId}/request-changes`, {
      reason,
      inlineComments,
      requestedBy,
    })
    return res.data.data
  },

  async startRun(runId: string, approvedBy = "user") {
    const res = await axios.post<{ success: boolean; data: RunManifest }>(`/api/runs/${runId}/start`, {
      approvedBy,
    })
    return res.data.data
  },

  async acceptRun(runId: string, payload: { approvedBy?: string; decision?: string; destination?: string; targetPath?: string } = {}) {
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
