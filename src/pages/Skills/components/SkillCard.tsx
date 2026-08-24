import React from "react"
import type { SkillCardProps } from "../types"

export const SkillCard: React.FC<SkillCardProps> = ({ skill, isSelected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(skill)}
      className={`w-full rounded-xl border p-4 text-left transition-colors ${
        isSelected
          ? "border-indigo-500/50 bg-indigo-500/10"
          : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${skill.enabled ? "bg-emerald-400" : "bg-slate-600"}`}
            />
            <span className="font-mono text-sm font-semibold text-white">{skill.skillId}</span>
            <span className="font-mono text-xs text-indigo-300">v{skill.version}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
            {skill.purpose}
          </p>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] ${
            skill.enabled
              ? "border-emerald-500/20 text-emerald-300"
              : "border-slate-700 text-slate-500"
          }`}
        >
          {skill.enabled ? "ON" : "OFF"}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-slate-500">
        <span>{skill.supportedRoles.join(", ")}</span>
        <span>·</span>
        <span>{skill.usage.planAssignments + skill.usage.runAssignments} uses</span>
      </div>
    </button>
  )
}
