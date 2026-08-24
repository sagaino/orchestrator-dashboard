import React from "react"
import { Search } from "lucide-react"
import type { SkillFiltersProps, SkillStatusFilter } from "../types"

export const SkillFilters: React.FC<SkillFiltersProps> = ({
  query,
  onQueryChange,
  status,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3 sm:flex-row">
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
        <input
          aria-label="Search skills"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search skill, version, purpose, or role…"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-9 py-2 text-sm text-slate-200 outline-none focus:border-indigo-400"
        />
      </label>
      <select
        aria-label="Skill status filter"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as SkillStatusFilter)}
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-400"
      >
        <option value="ALL">All statuses</option>
        <option value="ENABLED">Enabled</option>
        <option value="DISABLED">Disabled</option>
      </select>
    </div>
  )
}
