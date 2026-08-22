import type { Page, Route } from "@playwright/test"

const now = "2026-08-22T08:00:00.000Z"

const run = (taskId: string, state: string) => ({
  schemaVersion: 1,
  runId: `${taskId.toLowerCase()}-fixture-run`,
  state,
  createdAt: now,
  updatedAt: now,
  project: { id: "e2e-project", repository: "/tmp/e2e-project" },
  task: {
    id: taskId,
    title: `${taskId} deterministic lifecycle fixture`,
    path: `02-Projects/e2e-project/tasks/${taskId.toLowerCase()}.md`,
    status: state === "FAILED" ? "FAILED" : "REVIEW",
    allowedPaths: ["src/fixture.ts"],
    verification: ["typecheck", "build"],
  },
  execution: {
    completedAt: now,
    scopeAudit: { passed: true, modifiedFiles: ["src/fixture.ts"], outOfScopeFiles: [], deniedFilesBlocked: [] },
    verification: { allPassed: state !== "FAILED", results: [] },
  },
  telemetry: { model: "fixture-model", durationMs: 1000, tokens: { totalTokens: 100 } },
  history: [{ event: "RUN_REVIEW", state, at: now, message: "Deterministic browser fixture." }],
})

const evidence = (item: ReturnType<typeof run>) => {
  const verificationFailed = item.task.id === "E2E-VERIFY-FAIL"
  const restartFailed = item.task.id === "E2E-RESTART"
  const done = item.state === "DONE"
  return {
    schemaVersion: 1,
    mode: "run-evidence",
    runId: item.runId,
    state: item.state,
    project: item.project,
    task: item.task,
    policy: { allowedPaths: ["src/fixture.ts"], verificationCommands: ["npm run typecheck", "npm run build"] },
    approval: { approvedAt: now, approvedBy: "fixture-human", scope: "EXECUTE_TASK" },
    scope: {
      status: "PASS",
      changedPaths: ["src/fixture.ts"],
      allowedPaths: ["src/fixture.ts"],
      automaticAllowedPaths: [],
      outOfScopePaths: [],
      deniedPaths: [],
    },
    verification: {
      status: verificationFailed ? "FAIL" : "PASS",
      results: [
        { command: "npm run typecheck", exitCode: 0, status: "PASS", stdoutTail: "types ok", stderrTail: null },
        {
          command: "npm run build",
          exitCode: verificationFailed ? 1 : 0,
          status: verificationFailed ? "FAIL" : "PASS",
          stdoutTail: null,
          stderrTail: verificationFailed ? "deterministic build failure" : null,
        },
      ],
    },
    finalization: {
      status: done ? "APPLIED" : "NOT_APPLIED",
      acceptedAt: done ? now : null,
      acceptedBy: done ? "fixture-human" : null,
      humanApproved: done,
      appliedAt: done ? now : null,
      appliedPaths: done ? ["src/fixture.ts"] : [],
      postApplyVerification: { status: done ? "PASS" : "UNKNOWN", results: [] },
      graphify: null,
      git: { status: done ? "COMMITTED" : "NOT_APPLICABLE", commitHash: done ? "fixture123" : null, parentCommit: null, commitMessage: null, reason: null, paths: [] },
      artifactPath: done ? "workspace-artifacts/e2e-accept" : null,
      workspaceState: done ? "CLEANED" : "ACTIVE",
    },
    knowledge: { proposal: null, approval: null, sync: null },
    telemetry: null,
    restart: restartFailed
      ? { status: "MANUAL_RECOVERY_REQUIRED", action: "MANUAL_RECOVERY_REQUIRED", previousState: "RUNNING", reconciledAt: now, taskSyncError: null }
      : null,
    history: restartFailed
      ? [{ event: "RESTART_INTERRUPTION_FAILED_SAFE", state: "FAILED", at: now, message: "Invocation outcome uncertain." }]
      : item.history,
    nextAction: restartFailed
      ? "Restart reconciliation menghentikan invocation yang hasilnya tidak pasti; periksa evidence lalu gunakan recover atau retry secara eksplisit."
      : verificationFailed
        ? "Gunakan recover setelah memperbaiki verification failure."
        : done
          ? "Task selesai."
          : "Review perubahan dan proposal knowledge, lalu gunakan accept atau reject.",
    integrity: { status: "OK", warnings: [] },
    audit: { runId: item.runId, createdAt: now, updatedAt: now },
  }
}

const json = (route: Route, data: unknown, status = 200) => route.fulfill({
  status,
  contentType: "application/json",
  body: JSON.stringify({ success: true, data }),
})

export async function installLifecycleFixtures(page: Page) {
  const runs = [
    run("E2E-ACCEPT", "RETROSPECTIVE"),
    run("E2E-CHANGES", "REVIEW"),
    run("E2E-REJECT", "RETROSPECTIVE"),
    run("E2E-VERIFY-FAIL", "FAILED"),
    run("E2E-RESTART", "FAILED"),
  ]
  const jobs: Array<Record<string, unknown>> = []
  let provenancePlanId: string | null = null

  await page.route("**/api/**", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const pathname = url.pathname
    const method = request.method()

    if (pathname === "/api/auth/session") {
      return json(route, { sessionId: "e2e-operator-session", actor: "local:e2e-operator", actionNonce: "e2e-action-nonce", expiresAt: "2099-01-01T00:00:00.000Z" })
    }
    if (pathname === "/api/events") {
      return route.fulfill({ status: 200, contentType: "text/event-stream", body: "event: READY\ndata: {}\n\n" })
    }
    if (pathname === "/api/projects") {
      return json(route, { projects: [{ id: "e2e-project", repository: "/tmp/e2e-project", projectPage: "fixture.md", agent: "fixture", graphify: false, graphifyOutput: "", repositoryExists: true, projectPageExists: true, verificationDefaults: ["typecheck", "build"], graphOutputExists: false, valid: true, projectPagePath: "fixture.md" }] })
    }
    if (pathname === "/api/daemon/status") {
      return json(route, { service: "fixture", running: true, healthy: true, pid: 1, startedAt: now, heartbeatAt: now, heartbeatAgeMs: 0, restartReconciliation: { status: "COMPLETE", startedAt: now, completedAt: now, runs: 0, jobs: 0, error: null }, counters: { readyEvents: 0, manifestsCreated: 0, deduplicated: 0, jobsStarted: 0, jobsCompleted: 0, jobsFailed: 0, errors: 0 }, parallel: { strategy: "fixture", maxWorkers: 2, activeWorkers: 0, availableWorkerSlots: 2, activeProjects: [], reservedProjects: [], eligibleQueuedJobCount: jobs.length, blockedQueuedJobCount: 0, blockedQueuedJobs: [] }, durability: { strategy: "fixture", sourceOfTruth: "fixture", activeLeaseCount: 0, invocationCount: 0, invocationCounts: {}, guarantees: { atomicJobAdmission: true, projectExclusiveClaim: true, manifestRevisionGuard: true, stableInvocationIdentity: true, uncertainInvocationNeverAutoReplayed: true } }, notifications: { total: 0, unreadCount: 0, latest: [] }, queue: { queuedJobCount: jobs.length, runningJobCount: 0, reviewJobCount: 0, latestJobs: jobs } })
    }
    if (pathname === "/api/notifications") return json(route, [])
    if (pathname === "/api/projects-archive") return json(route, { archivedProjects: [] })
    if (pathname === "/api/jobs") return json(route, jobs)
    if (pathname === "/api/operations/readiness") return json(route, {
      schemaVersion: 1,
      checkedAt: now,
      status: "DEGRADED",
      admission: { allowed: true, blockers: [] },
      checks: [{ id: "backup", status: "PASS", severity: "INFO", message: "Backup verified.", action: "Tidak ada tindakan.", runbook: "fixture" }, { id: "backup-schedule", status: "WARN", severity: "WARNING", message: "Backup schedule belum dipasang; freshness masih bergantung pada backup manual.", action: "Review schedule artifact.", runbook: "fixture" }],
      alerts: [{ alertId: "OPS_BACKUP_SCHEDULE", severity: "WARNING", dedupeKey: "backup-schedule:WARN", acknowledgement: "fixture", runbook: "fixture", runbookSteps: ["Review schedule artifact."], message: "Backup schedule belum dipasang; freshness masih bergantung pada backup manual.", ownerRole: "recovery-operator", acknowledgementState: "UNACKNOWLEDGED", resolutionEvidenceRequired: true }],
      signals: { backupSchedule: { configured: false, launchctlActivated: false, intervalHours: null } },
    })
    if (pathname === "/api/operations/retention/trash") return json(route, [])
    if (pathname === "/api/operations/backups/status") return json(route, {
      schemaVersion: 1,
      action: "BACKUP_RECOVERY_STATUS",
      generatedAt: now,
      target: { configuredTarget: "/tmp/fixture-backups", exists: true, independentTarget: true, registeredBackup: { backupId: "backup-fixture" }, guardrail: "read-only" },
      schedule: null,
      drill: { status: "CURRENT", lastDrill: { performedBy: "fixture", performedAt: now, result: "PASS", evidence: { summary: "fixture" } }, dueAt: "2026-09-21T08:00:00.000Z", overdueByMs: 0, intervalDays: 30 },
      registeredBackup: { backupId: "backup-fixture", independentTarget: true },
      guardrails: { automaticRestore: false, automaticPromotion: false, permanentDelete: false },
    })
    if (pathname === "/api/knowledge/health") return json(route, {
      schemaVersion: 1, timestamp: now, healthy: true, errors: [], warnings: [], findings: [], summary: { pagesScanned: 3, errors: 0, warnings: 0, info: 0, safeFixesAvailable: 0 }, unindexedCount: 0, brokenLinksCount: 0, orphanCandidatesCount: 0,
    })
    if (pathname === "/api/knowledge/maintenance") return json(route, {
      schemaVersion: 1, action: "KNOWLEDGE_MAINTENANCE_STATUS", generatedAt: now, duplicates: [], stale: [], summary: { duplicateCandidates: 0, staleReviewItems: 0, exactTitleDuplicates: 0, contradictionCandidates: 0 },
    })
    if (pathname === "/api/knowledge/candidates") return json(route, [])
    if (pathname === "/api/knowledge/harvests") return json(route, [])
    if (pathname === "/api/knowledge/provenance/migration/preview" && method === "POST") {
      provenancePlanId = "provenance-fixture-plan"
      return json(route, { schemaVersion: 1, action: "KNOWLEDGE_PROVENANCE_MIGRATION_PREVIEW", status: "PREVIEW", planId: provenancePlanId, createdAt: now, scope: "legacy pages", reviewDays: 180, summary: { candidateCount: 1, changedFieldCount: 2, inferredFieldCount: 1 }, files: [{ path: "01-Knowledge/fixture.md", title: "Fixture knowledge", beforeChecksum: "before", afterChecksum: "after", changedFields: ["source", "review"], inferredFields: ["owner"] }], auditPath: "runtime/knowledge/provenance-fixture-plan.json", confirmation: { required: true, phrase: "MIGRATE PROVENANCE", expectedStatus: "PREVIEW" }, guardrail: "Fixture preview only." })
    }
    if (pathname === "/api/knowledge/provenance/migration/apply" && method === "POST") {
      return json(route, { schemaVersion: 1, action: "KNOWLEDGE_PROVENANCE_MIGRATION_APPLIED", status: "APPLIED", planId: provenancePlanId, appliedAt: now, approvedBy: "dashboard-user", summary: { candidateCount: 1, changedFieldCount: 2, inferredFieldCount: 1 }, auditPath: "runtime/knowledge/provenance-fixture-plan.json", rollback: { available: true, command: "rollback" } })
    }
    if (pathname === "/api/knowledge/provenance/migration/rollback" && method === "POST") {
      return json(route, { schemaVersion: 1, action: "KNOWLEDGE_PROVENANCE_MIGRATION_ROLLED_BACK", status: "ROLLED_BACK", planId: provenancePlanId, rolledBackAt: now, revertedBy: "dashboard-user", summary: { candidateCount: 1, changedFieldCount: 2, inferredFieldCount: 1 }, auditPath: "runtime/knowledge/provenance-fixture-plan.json" })
    }
    if (pathname === "/api/operations/release") return json(route, {
      schemaVersion: 1,
      checkedAt: now,
      current: { runtimeVersion: "0.1.0" },
      candidate: { configured: true, available: true, status: "VERIFIED", releaseId: "candidate-p64-fixture", runtimeVersion: "0.1.1", sourceCommit: "fixture123", builtAt: now, fileCount: 12, compatibility: { compatible: true, outcome: "ACTIVATION_ELIGIBLE", errors: [] } },
      queueDrain: { drained: true, blockers: [], counts: { jobs: 0, runs: 0, invocations: 0 }, daemon: { running: false, pid: null } },
      compatibility: { compatible: true, outcome: "ACTIVATION_ELIGIBLE", errors: [], contractVersion: "p6.0-2026-08-22" },
      backup: { required: true, status: "AVAILABLE", backupId: "backup-fixture", verifiedAt: now, backedUpAt: now, filesCount: 42 },
      health: { status: "PASS", daemon: { running: false, healthy: true, heartbeatAt: now, heartbeatAgeMs: 0 }, checks: [{ id: "daemon", status: "PASS", message: "Daemon healthy." }] },
      rollback: { required: true, protocolVersion: 1, evidenceStatus: "READY", backupId: "backup-fixture", message: "Backup tersedia untuk rollback eksternal." },
      activation: { eligible: true, state: "HUMAN_GATE_REQUIRED", requiresHumanConfirmation: true, authority: "EXTERNAL_SUPERVISOR", selfAcceptAllowed: false, inProcessActivationAllowed: false, confirmation: { confirmed: false, approvedBy: null, approvedAt: null } },
    })
    if (pathname === "/api/runs" && method === "GET") return json(route, runs)

    if (pathname === "/api/tasks/request" && method === "POST") {
      return json(route, { schemaVersion: 1, action: "TASK_CREATED", project: "e2e-project", task: { id: "E2E-INTAKE", title: "Deterministic intake fixture", path: "02-Projects/e2e-project/tasks/e2e-intake.md", status: "BACKLOG", risk: "low" }, job: null, readiness: { verdict: "PASS", ready: true, summary: { passed: 11, blockers: 0, warnings: 0 }, checks: [{ id: "scope", status: "PASS", message: "Allowed paths are explicit." }], nextActions: [] }, confirmation: { schemaVersion: 1, status: "AWAITING_HUMAN_CONFIRMATION", approvalMode: "EXPLICIT_HUMAN", allowedPaths: ["src/fixture.ts"], verification: ["typecheck", "build"], acceptanceCriteria: ["Fixture change is scoped.", "Verification passes."], risk: "low", requiresChanges: true, readiness: { verdict: "PASS", ready: true, summary: { passed: 11, blockers: 0, warnings: 0 }, checks: [{ id: "scope", status: "PASS", message: "Allowed paths are explicit." }], nextActions: [] } }, nextAction: "Review canonical plan, lalu berikan human approval." }, 201)
    }
    if (pathname === "/api/tasks/e2e-project/E2E-INTAKE/queue" && method === "POST") {
      if (!jobs.length) jobs.push({ jobId: "e2e-intake-job", taskId: "E2E-INTAKE", project: "e2e-project", state: "QUEUED", runId: null })
      return json(route, { schemaVersion: 1, action: "TASK_CONFIRMED_AND_QUEUED", approvedBy: "user", readiness: { verdict: "PASS", ready: true, summary: { passed: 11, blockers: 0, warnings: 0 }, checks: [], nextActions: [] }, job: jobs[0], nextAction: "Task sudah diantrekan." }, 201)
    }

    const evidenceMatch = pathname.match(/^\/api\/runs\/([^/]+)\/evidence$/)
    if (evidenceMatch) {
      const item = runs.find((candidate) => candidate.runId === evidenceMatch[1])
      return item ? json(route, evidence(item)) : route.fulfill({ status: 404 })
    }
    const visualEvidenceMatch = pathname.match(/^\/api\/runs\/([^/]+)\/visual-evidence$/)
    if (visualEvidenceMatch) return json(route, [])
    const visualRevisionsMatch = pathname.match(/^\/api\/runs\/([^/]+)\/visual-revisions$/)
    if (visualRevisionsMatch) return json(route, [])
    const visualCertificationMatch = pathname.match(/^\/api\/runs\/([^/]+)\/visual-certification$/)
    if (visualCertificationMatch) return json(route, null)
    const actionMatch = pathname.match(/^\/api\/runs\/([^/]+)\/(request-changes|reject|accept)$/)
    if (actionMatch && method === "POST") {
      const item = runs.find((candidate) => candidate.runId === actionMatch[1])
      if (!item) return route.fulfill({ status: 404 })
      if (actionMatch[2] === "request-changes") item.state = "CHANGES_REQUESTED"
      if (actionMatch[2] === "reject") item.state = "FAILED"
      if (actionMatch[2] === "accept") {
        item.state = "DONE"
        item.task.status = "DONE"
      }
      item.updatedAt = new Date().toISOString()
      return json(route, item)
    }

    return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ success: false, error: { message: `Unhandled fixture route ${method} ${pathname}` } }) })
  })
}
