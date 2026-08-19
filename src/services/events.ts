import { DEFAULT_API_TOKEN } from "@/lib/constant/auth"

export interface OrchestratorEvent {
  event: string
  data: any
}

export function subscribeToEvents(
  onEvent: (event: OrchestratorEvent) => void,
  onError?: (err: any) => void
) {
  const token = localStorage.getItem("orchestrator_token") || DEFAULT_API_TOKEN
  const eventSource = new EventSource(`/api/events?token=${token}`)

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
