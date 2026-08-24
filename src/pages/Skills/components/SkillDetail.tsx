import React from "react"
import { Fingerprint, Gauge, Wrench } from "lucide-react"
import type { SkillDetailProps } from "../types"

export const riskTone = (risk: string) => {
  if (risk === "LOW") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
  if (risk === "MEDIUM") return "border-amber-500/30 bg-amber-500/10 text-amber-300"
  return "border-rose-500/30 bg-rose-500/10 text-rose-300"
}

export const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString("id-ID") : "Belum digunakan"

export const SkillDetail: React.FC<SkillDetailProps> = ({ skill, onToggle, busy }) => {
  if (!skill) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center text-sm text-slate-500">
        Pilih skill untuk melihat detail kompatibilitas, provenance, checksum, dan usage.
      </div>
    )
  }

  return (
    <aside className="rounded-2xl border border-indigo-500/20 bg-slate-900/70 p-5 shadow-xl shadow-indigo-950/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                skill.enabled
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-slate-700 bg-slate-800 text-slate-400"
              }`}
            >
              {skill.enabled ? "ENABLED" : "DISABLED"}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskTone(skill.riskLevel)}`}>
              {skill.riskLevel} RISK
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-white">{skill.skillId}</h2>
          <p className="font-mono text-xs text-indigo-300">v{skill.version}</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => onToggle(skill)}
          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
            skill.enabled
              ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
          }`}
        >
          {skill.enabled ? "Disable skill" : "Enable skill"}
        </button>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-300">{skill.purpose}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Compatible roles</p>
          <p className="mt-2 text-xs text-slate-200">{skill.supportedRoles.join(", ") || "None"}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Task types</p>
          <p className="mt-2 text-xs text-slate-200">{skill.supportedTaskTypes.join(", ") || "None"}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Project signals</p>
          <p className="mt-2 text-xs text-slate-200">
            {skill.compatibleProjectSignals.length
              ? skill.compatibleProjectSignals.join(", ")
              : "All registered projects"}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Wrench className="h-4 w-4 text-violet-300" />Capabilities & verification
        </h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skill.requiredCapabilities.map((item) => (
            <span
              key={item}
              className="rounded border border-violet-500/20 bg-violet-500/10 px-2 py-1 font-mono text-[10px] text-violet-200"
            >
              {item}
            </span>
          ))}
          {skill.verificationRequirements.map((item) => (
            <span
              key={item}
              className="rounded border border-sky-500/20 bg-sky-500/10 px-2 py-1 font-mono text-[10px] text-sky-200"
            >
              verify:{item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Fingerprint className="h-4 w-4 text-cyan-300" />Integrity & provenance
        </h3>
        <dl className="mt-3 space-y-2 text-[11px]">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Instruction SHA-256</dt>
            <dd className="max-w-[230px] break-all text-right font-mono text-slate-300">
              {skill.instructionChecksum}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Source</dt>
            <dd className="text-right text-slate-300">{skill.provenance.source}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Human installer</dt>
            <dd className="text-right text-slate-300">{skill.provenance.humanInstaller}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Installed</dt>
            <dd className="text-right text-slate-300">{formatDate(skill.provenance.installedAt)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Source ref</dt>
            <dd className="max-w-[230px] break-all text-right font-mono text-slate-300">
              {skill.provenance.sourceRef}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Gauge className="h-4 w-4 text-amber-300" />Usage
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-slate-950/70 p-3">
            <p className="text-lg font-semibold text-white">{skill.usage.planAssignments}</p>
            <p className="text-[10px] text-slate-500">Plan assignments</p>
          </div>
          <div className="rounded-lg bg-slate-950/70 p-3">
            <p className="text-lg font-semibold text-white">{skill.usage.runAssignments}</p>
            <p className="text-[10px] text-slate-500">Run assignments</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-slate-500">Last seen: {formatDate(skill.usage.lastSeenAt)}</p>
      </div>
    </aside>
  )
}
