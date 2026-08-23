import React, { useMemo, useState } from "react"
import { CheckCircle2, CircleOff, Fingerprint, Gauge, Search, ShieldCheck, ToggleLeft, Wrench } from "lucide-react"
import { useSkillCatalog, useUpdateSkillEnabled } from "@/hooks/use-orchestrator"
import type { SkillCatalogEntry } from "@/services/orchestrator"

const riskTone = (risk: string) => {
  if (risk === "LOW") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
  if (risk === "MEDIUM") return "border-amber-500/30 bg-amber-500/10 text-amber-300"
  return "border-rose-500/30 bg-rose-500/10 text-rose-300"
}

const formatDate = (value: string | null) => value ? new Date(value).toLocaleString("id-ID") : "Belum digunakan"
const EMPTY_SKILLS: SkillCatalogEntry[] = []

const SkillDetail: React.FC<{ skill: SkillCatalogEntry | null; onToggle: (skill: SkillCatalogEntry) => void; busy: boolean }> = ({ skill, onToggle, busy }) => {
  if (!skill) return <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center text-sm text-slate-500">Pilih skill untuk melihat detail kompatibilitas, provenance, checksum, dan usage.</div>
  return (
    <aside className="rounded-2xl border border-indigo-500/20 bg-slate-900/70 p-5 shadow-xl shadow-indigo-950/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${skill.enabled ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-slate-700 bg-slate-800 text-slate-400"}`}>{skill.enabled ? "ENABLED" : "DISABLED"}</span><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskTone(skill.riskLevel)}`}>{skill.riskLevel} RISK</span></div>
          <h2 className="mt-3 text-lg font-semibold text-white">{skill.skillId}</h2>
          <p className="font-mono text-xs text-indigo-300">v{skill.version}</p>
        </div>
        <button type="button" disabled={busy} onClick={() => onToggle(skill)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${skill.enabled ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"}`}>
          {skill.enabled ? "Disable skill" : "Enable skill"}
        </button>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-300">{skill.purpose}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Compatible roles</p><p className="mt-2 text-xs text-slate-200">{skill.supportedRoles.join(", ") || "None"}</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Task types</p><p className="mt-2 text-xs text-slate-200">{skill.supportedTaskTypes.join(", ") || "None"}</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:col-span-2"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Project signals</p><p className="mt-2 text-xs text-slate-200">{skill.compatibleProjectSignals.length ? skill.compatibleProjectSignals.join(", ") : "All registered projects"}</p></div>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4"><h3 className="flex items-center gap-2 text-xs font-semibold text-slate-200"><Wrench className="h-4 w-4 text-violet-300" />Capabilities & verification</h3><div className="mt-3 flex flex-wrap gap-1.5">{skill.requiredCapabilities.map((item) => <span key={item} className="rounded border border-violet-500/20 bg-violet-500/10 px-2 py-1 font-mono text-[10px] text-violet-200">{item}</span>)}{skill.verificationRequirements.map((item) => <span key={item} className="rounded border border-sky-500/20 bg-sky-500/10 px-2 py-1 font-mono text-[10px] text-sky-200">verify:{item}</span>)}</div></div>

      <div className="mt-5 border-t border-slate-800 pt-4"><h3 className="flex items-center gap-2 text-xs font-semibold text-slate-200"><Fingerprint className="h-4 w-4 text-cyan-300" />Integrity & provenance</h3><dl className="mt-3 space-y-2 text-[11px]"><div className="flex justify-between gap-3"><dt className="text-slate-500">Instruction SHA-256</dt><dd className="max-w-[230px] break-all text-right font-mono text-slate-300">{skill.instructionChecksum}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Source</dt><dd className="text-right text-slate-300">{skill.provenance.source}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Human installer</dt><dd className="text-right text-slate-300">{skill.provenance.humanInstaller}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Installed</dt><dd className="text-right text-slate-300">{formatDate(skill.provenance.installedAt)}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Source ref</dt><dd className="max-w-[230px] break-all text-right font-mono text-slate-300">{skill.provenance.sourceRef}</dd></div></dl></div>

      <div className="mt-5 border-t border-slate-800 pt-4"><h3 className="flex items-center gap-2 text-xs font-semibold text-slate-200"><Gauge className="h-4 w-4 text-amber-300" />Usage</h3><div className="mt-3 grid grid-cols-2 gap-2 text-center"><div className="rounded-lg bg-slate-950/70 p-3"><p className="text-lg font-semibold text-white">{skill.usage.planAssignments}</p><p className="text-[10px] text-slate-500">Plan assignments</p></div><div className="rounded-lg bg-slate-950/70 p-3"><p className="text-lg font-semibold text-white">{skill.usage.runAssignments}</p><p className="text-[10px] text-slate-500">Run assignments</p></div></div><p className="mt-3 text-[11px] text-slate-500">Last seen: {formatDate(skill.usage.lastSeenAt)}</p></div>
    </aside>
  )
}

export const SkillsPage: React.FC = () => {
  const { data: catalog, isLoading, isError, refetch } = useSkillCatalog()
  const updateSkill = useUpdateSkillEnabled()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"ALL" | "ENABLED" | "DISABLED">("ALL")
  const [confirm, setConfirm] = useState<SkillCatalogEntry | null>(null)
  const skills = catalog?.skills ?? EMPTY_SKILLS
  const filtered = useMemo(() => skills.filter((skill) => {
    const text = `${skill.skillId} ${skill.version} ${skill.purpose} ${skill.supportedRoles.join(" ")}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (status === "ALL" || (status === "ENABLED" ? skill.enabled : !skill.enabled))
  }), [query, skills, status])
  const selected = skills.find((skill) => `${skill.skillId}@${skill.version}` === selectedId) ?? filtered[0] ?? null
  const totalAssignments = skills.reduce((sum, skill) => sum + skill.usage.planAssignments + skill.usage.runAssignments, 0)

  const toggleSkill = async () => {
    if (!confirm) return
    try {
      await updateSkill.mutateAsync({ skillId: confirm.skillId, version: confirm.version, enabled: !confirm.enabled })
      setConfirm(null)
    } catch {
      // Mutation error is rendered below; keep confirmation open for retry.
    }
  }

  return (
    <div className="min-h-full bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-end"><div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300"><ShieldCheck className="h-4 w-4" /> Skill registry</div><h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Skill Management</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">Inspect installed skill versions, compatibility, provenance, checksum integrity, and usage. Enable/disable requires an authenticated human operator.</p></div><div className="flex items-center gap-2 text-xs text-slate-500"><span className={`h-2 w-2 rounded-full ${catalog?.registryState === "AVAILABLE" ? "bg-emerald-400" : "bg-amber-400"}`} />Registry {catalog?.registryState ?? "LOADING"}</div></header>

        <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Installed versions</p><p className="mt-2 text-2xl font-semibold text-white">{skills.length}</p></div><div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Enabled</p><p className="mt-2 text-2xl font-semibold text-emerald-300">{skills.filter((skill) => skill.enabled).length}</p></div><div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Observed usage</p><p className="mt-2 text-2xl font-semibold text-indigo-300">{totalAssignments}</p></div></div>

        {isLoading && <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">Loading skill registry…</div>}
        {isError && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5 text-sm text-rose-200">Skill registry tidak dapat dimuat. <button type="button" onClick={() => refetch()} className="ml-2 underline">Coba lagi</button></div>}
        {!isLoading && !isError && <>
          <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3 sm:flex-row"><label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-600" /><input aria-label="Search skills" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search skill, version, purpose, or role…" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-9 py-2 text-sm text-slate-200 outline-none focus:border-indigo-400" /></label><select aria-label="Skill status filter" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-400"><option value="ALL">All statuses</option><option value="ENABLED">Enabled</option><option value="DISABLED">Disabled</option></select></div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"><section className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-200">Installed skill versions</h2><span className="text-xs text-slate-500">{filtered.length} shown</span></div>{filtered.length === 0 ? <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">Tidak ada skill yang cocok dengan filter.</div> : filtered.map((skill) => { const identity = `${skill.skillId}@${skill.version}`; const active = selected && identity === `${selected.skillId}@${selected.version}`; return <button type="button" key={identity} onClick={() => setSelectedId(identity)} className={`w-full rounded-xl border p-4 text-left transition-colors ${active ? "border-indigo-500/50 bg-indigo-500/10" : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900"}`}><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${skill.enabled ? "bg-emerald-400" : "bg-slate-600"}`} /><span className="font-mono text-sm font-semibold text-white">{skill.skillId}</span><span className="font-mono text-xs text-indigo-300">v{skill.version}</span></div><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">{skill.purpose}</p></div><span className={`rounded-full border px-2 py-0.5 text-[10px] ${skill.enabled ? "border-emerald-500/20 text-emerald-300" : "border-slate-700 text-slate-500"}`}>{skill.enabled ? "ON" : "OFF"}</span></div><div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-slate-500"><span>{skill.supportedRoles.join(", ")}</span><span>·</span><span>{skill.usage.planAssignments + skill.usage.runAssignments} uses</span></div></button> })}</section><SkillDetail skill={selected} onToggle={setConfirm} busy={updateSkill.isPending} /></div>
          <div className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-xs text-slate-500"><ToggleLeft className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" /><p>Installation dan update skill tetap berada di workflow human-confirmed terpisah. Dashboard ini hanya membaca registry dan mengubah enabled/disabled melalui audit trail.</p></div>
        </>}
      </div>

      {confirm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"><div role="dialog" aria-modal="true" aria-labelledby="skill-toggle-title" className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"><div className="flex items-start gap-3"><div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300">{confirm.enabled ? <CircleOff className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}</div><div><h2 id="skill-toggle-title" className="text-base font-semibold text-white">{confirm.enabled ? "Disable" : "Enable"} skill?</h2><p className="mt-2 text-sm leading-relaxed text-slate-400"><span className="font-mono text-slate-200">{confirm.skillId}@{confirm.version}</span> akan {confirm.enabled ? "dikeluarkan dari kandidat routing dan assignment baru" : "tersedia kembali untuk routing dan assignment baru"}. Plan/run yang sudah tercatat tidak diubah.</p></div></div>{updateSkill.isError && <div role="alert" className="mt-4 rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-200">{updateSkill.error instanceof Error ? updateSkill.error.message : "Perubahan status skill gagal."}</div>}<div className="mt-5 flex justify-end gap-2"><button type="button" disabled={updateSkill.isPending} onClick={() => setConfirm(null)} className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">Batal</button><button type="button" disabled={updateSkill.isPending} onClick={() => void toggleSkill()} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{updateSkill.isPending ? "Menyimpan…" : "Konfirmasi"}</button></div></div></div>}
    </div>
  )
}

export default SkillsPage
