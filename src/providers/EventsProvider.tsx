import React, { useEffect, useRef, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { subscribeToEvents, type OrchestratorEvent } from "@/services/events"
import { queryKeys } from "@/hooks/use-orchestrator"
import { EventsContext } from "./EventsContext"

/**
 * Single SSE connection provider that invalidates TanStack Query caches
 * selectively based on event type. Replaces per-page subscribeToEvents() calls.
 */
export function EventsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const lastEventRef = useRef<OrchestratorEvent | null>(null)
  const [lastEvent, setLastEvent] = React.useState<OrchestratorEvent | null>(null)

  const handleEvent = useCallback(
    (evt: OrchestratorEvent) => {
      lastEventRef.current = evt
      setLastEvent(evt)

      switch (evt.event) {
      case "connected":
          // Initial connection — refresh everything
          queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
          queryClient.invalidateQueries({ queryKey: queryKeys.objectives })
          queryClient.invalidateQueries({ queryKey: queryKeys.runs })
          queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
          break

        case "TASK_REQUESTED":
          queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
          queryClient.invalidateQueries({ queryKey: queryKeys.runs })
          queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
          break

        case "RUN_PROGRESS":
          queryClient.invalidateQueries({ queryKey: queryKeys.runs })
          queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
          queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
          break

        case "RUN_ACCEPTED":
          queryClient.invalidateQueries({ queryKey: queryKeys.runs })
          queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
          queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
          queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeCandidates })
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
          break

        case "RUN_REJECTED":
        case "RUN_RETRIED":
        case "RUN_RECOVERED":
          queryClient.invalidateQueries({ queryKey: queryKeys.runs })
          queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
          queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
          break

        case "RUN_CHANGES_REQUESTED":
          queryClient.invalidateQueries({ queryKey: queryKeys.runs })
          queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
          break

        case "OBJECTIVE_CREATED":
        case "PLAN_APPROVED":
        case "PLAN_REVISION_CREATED":
        case "PLAN_CHANGES_REQUESTED":
        case "PLAN_CLARIFIED":
        case "TASKS_MATERIALIZED":
        case "INTEGRATION_IN_PROGRESS":
        case "INTEGRATION_BLOCKED":
        case "INTEGRATION_COMPLETED":
        case "INTEGRATION_REPAIR_PROPOSED":
        case "OBJECTIVE_ACCEPTED":
        case "OBJECTIVE_ACCEPTANCE_IDEMPOTENT":
        case "OBJECTIVE_CANCELLED":
        case "NODE_RETRY_DECISION_REQUESTED":
        case "DECISION_RESOLVED":
          queryClient.invalidateQueries({ queryKey: ["objectives"] })
          queryClient.invalidateQueries({ queryKey: queryKeys.runs })
          queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
          if (evt.data?.objectiveId) {
            queryClient.invalidateQueries({ queryKey: queryKeys.objective(evt.data.objectiveId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.objectiveEvidence(evt.data.objectiveId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.objectiveGraph(evt.data.objectiveId) })
          }
          break

        case "KNOWLEDGE_PROMOTED":
        case "KNOWLEDGE_REJECTED":
          queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeCandidates })
          queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHarvests })
          queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHealth })
          break

        case "KNOWLEDGE_HARVESTED":
        case "KNOWLEDGE_INGESTED":
          queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHarvests })
          queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeCandidates })
          queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeHealth })
          break

        case "PREVIEW_OPENED":
          // No cache invalidation needed
          break

        default:
          // Unknown event — refresh core queries as safety net
          queryClient.invalidateQueries({ queryKey: queryKeys.daemon })
          queryClient.invalidateQueries({ queryKey: queryKeys.runs })
          break
      }
    },
    [queryClient]
  )

  useEffect(() => {
    const unsubscribe = subscribeToEvents(handleEvent)
    return () => unsubscribe()
  }, [handleEvent])

  return (
    <EventsContext.Provider value={{ lastEvent }}>
      {children}
    </EventsContext.Provider>
  )
}
