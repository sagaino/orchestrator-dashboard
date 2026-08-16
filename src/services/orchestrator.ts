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

export interface RunManifest {
  schemaVersion: number
  runId: string
  state: "PREPARING" | "CLAIMED" | "EXECUTING" | "SCOPE_AUDIT" | "VERIFYING" | "GRAPHIFY" | "REVIEW" | "DONE" | "FAILED" | "BLOCKED"
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
      results: Array<{ script: string; passed: boolean; exitCode: number; stdoutTail?: string; stderrTail?: string }>
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
  history?: Array<{
    event: string
    state: string
    at: string
    message?: string
  }>
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
  summary: {
    totalRuns: number
    totalTokens: number
    inputTokens: number
    outputTokens: number
    cacheReadTokens: number
    explicitRecords: number
    inferredRecords: number
    inferredSkippedByExplicit: number
    models: Record<string, number>
    projects: Record<string, { runs: number; tokens: number }>
  }
  runs: Array<{
    runId: string
    projectId: string
    taskId: string
    stage: string
    model: string
    totalTokens: number
    durationMs: number
    source: "explicit" | "inferred"
  }>
}

export const OrchestratorApi = {
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

  async requestChanges(runId: string, reason: string, requestedBy = "user") {
    const res = await axios.post<{ success: boolean; data: RunManifest }>(`/api/runs/${runId}/request-changes`, {
      reason,
      requestedBy,
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
    const res = await axios.get<{ success: boolean; data: KnowledgeCandidate[] }>("/api/knowledge/candidates")
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

  async getKnowledgeHealth() {
    const res = await axios.get<{ success: boolean; data: VaultHealth }>("/api/knowledge/health")
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
