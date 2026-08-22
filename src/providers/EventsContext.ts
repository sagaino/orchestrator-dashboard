import { createContext, useContext } from "react"
import type { OrchestratorEvent } from "@/services/events"

export interface EventsContextValue {
  lastEvent: OrchestratorEvent | null
}

export const EventsContext = createContext<EventsContextValue>({ lastEvent: null })
export const useSSEEvents = () => useContext(EventsContext)
