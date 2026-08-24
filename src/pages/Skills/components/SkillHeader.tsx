import React from "react"
import { ShieldCheck } from "lucide-react"
import type { SkillHeaderProps } from "../types"

export const SkillHeader: React.FC<SkillHeaderProps> = ({ registryState }) => {
  const isAvailable = registryState === "AVAILABLE"

  return (
    <header className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-end">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
          <ShieldCheck className="h-4 w-4" /> Skill registry
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Skill Management</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
          Inspect installed skill versions, compatibility, provenance, checksum integrity, and usage. Enable/disable requires an authenticated human operator.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span
          className={`h-2 w-2 rounded-full ${isAvailable ? "bg-emerald-400" : "bg-amber-400"}`}
        />
        Registry {registryState ?? "LOADING"}
      </div>
    </header>
  )
}
