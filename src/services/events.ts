export interface OrchestratorEvent {
  event: string
  data: any
}

export function subscribeToEvents(
  onEvent: (event: OrchestratorEvent) => void,
  onError?: (err: any) => void
) {
  const eventSource = new EventSource("/api/events")

  const eventTypes = [
    "connected",
    "TASK_REQUESTED",
    "RUN_STARTED",
    "RUN_PROGRESS",
    "RUN_FAILED",
    "RUN_ACCEPTED",
    "RUN_REJECTED",
    "RUN_CHANGES_REQUESTED",
    "RUN_RECOVERED",
    "RUN_RETRIED",
    "JOB_STARTED",
    "JOB_REVIEW_READY",
    "JOB_FAILED",
    "KNOWLEDGE_PROMOTED",
    "KNOWLEDGE_REJECTED",
    "KNOWLEDGE_HARVEST_STARTED",
    "KNOWLEDGE_HARVEST_PROGRESS",
    "KNOWLEDGE_HARVESTED",
    "KNOWLEDGE_HARVEST_FAILED",
    "PREVIEW_OPENED",
    "OBJECTIVE_CREATED",
    "PLAN_APPROVED",
    "PLAN_REVISION_CREATED",
    "PLAN_CHANGES_REQUESTED",
    "PLAN_CLARIFIED",
    "TASKS_MATERIALIZED",
    "INTEGRATION_IN_PROGRESS",
    "INTEGRATION_BLOCKED",
    "INTEGRATION_COMPLETED",
    "INTEGRATION_REPAIR_PROPOSED",
    "OBJECTIVE_ACCEPTED",
    "OBJECTIVE_ACCEPTANCE_IDEMPOTENT",
    "OBJECTIVE_CANCELLED",
    "NODE_RETRY_DECISION_REQUESTED",
    "DECISION_RESOLVED",
  ]

  for (const eventType of eventTypes) {
    eventSource.addEventListener(eventType, (msg) => {
      try {
        const parsed = JSON.parse(msg.data)
        onEvent({ event: eventType, data: parsed })
      } catch {
        onEvent({ event: eventType, data: msg.data })
      }
    })
  }

  eventSource.onerror = (err) => {
    if (onError) onError(err)
  }

  return () => {
    eventSource.close()
  }
}
