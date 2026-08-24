import React from "react"
import type { StatusBadgeProps } from "../types"

export const stateTone = (state: string): string => {
  if (["DONE", "ACCEPTED", "CERTIFIED", "PASS", "PASSED"].includes(state)) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
  }
  if (["FAILED", "BLOCKED", "FAIL"].includes(state)) {
    return "border-rose-500/30 bg-rose-500/10 text-rose-300"
  }
  return "border-amber-500/30 bg-amber-500/10 text-amber-300"
}

export const humanize = (value: string): string => value.replaceAll("_", " ")

export const StatusBadge: React.FC<StatusBadgeProps> = ({ state }) => {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider ${stateTone(state)}`}>
      {humanize(state)}
    </span>
  )
}
