import React from "react"
import { ToggleLeft } from "lucide-react"
import type { SkillOperatorNoticeProps } from "../types"

export const SkillOperatorNotice: React.FC<SkillOperatorNoticeProps> = ({ className = "" }) => {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-xs text-slate-500 ${className}`.trim()}
    >
      <ToggleLeft className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
      <p>
        Installation dan update skill tetap berada di workflow human-confirmed terpisah. Dashboard ini hanya membaca registry dan mengubah enabled/disabled melalui audit trail.
      </p>
    </div>
  )
}
