import React, { useState } from "react"
import { AlertTriangle, CheckCircle2, RefreshCw, RotateCcw, ShieldAlert, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOperationsReadiness, usePreviewRetention, usePurgeRetention, useRestoreRetention, useRetentionTrash } from "@/hooks/use-orchestrator"

const formatBytes = (value: number) => new Intl.NumberFormat("id-ID", { style: "unit", unit: "megabyte", maximumFractionDigits: 1 }).format(value / 1024 / 1024)

export const OperationsPage: React.FC = () => {
  const { data: readiness, isLoading, refetch, isFetching } = useOperationsReadiness()
  const { data: trash = [] } = useRetentionTrash()
  const preview = usePreviewRetention()
  const purge = usePurgeRetention()
  const restore = useRestoreRetention()
  const [days, setDays] = useState(30)
  const [planId, setPlanId] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const activePlan = preview.data
  const statusClass = readiness?.status === "READY" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : readiness?.status === "DEGRADED" ? "bg-amber-500/15 text-amber-200 border-amber-500/30" : "bg-rose-500/15 text-rose-200 border-rose-500/30"

  return <div className="w-full space-y-6 pb-12">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-sm text-slate-400">Operations Center</p><h2 className="text-2xl font-semibold text-white">Kesiapan dan tata kelola sumber daya</h2><p className="mt-1 text-sm text-slate-400">Eksekusi baru berhenti otomatis ketika backup, disk, atau integrity evidence tidak aman.</p></div>
      <Button variant="outline" onClick={() => refetch()} disabled={isFetching}><RefreshCw className="mr-2 h-4 w-4" />{isFetching ? "Memeriksa…" : "Periksa ulang"}</Button>
    </div>
    {isLoading ? <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-slate-400">Memuat readiness…</div> : readiness && <>
      <div className={`rounded-xl border p-5 ${statusClass}`}><div className="flex items-center gap-3">{readiness.status === "READY" ? <CheckCircle2 /> : <ShieldAlert />}<div><p className="font-semibold">{readiness.status}</p><p className="text-sm opacity-90">{readiness.admission.allowed ? "Admission aktif untuk pekerjaan baru." : `${readiness.admission.blockers.length} blocker harus diselesaikan sebelum admission dibuka.`}</p></div></div></div>
      {readiness.alerts.length > 0 && <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4"><div className="mb-2 flex items-center gap-2 font-medium text-amber-200"><AlertTriangle className="h-4 w-4" />Alert aktif</div>{readiness.alerts.map((alert) => <p key={alert.alertId} className="py-1 text-sm text-amber-100/80">{alert.message} <span className="text-amber-200">— {alert.acknowledgement}</span></p>)}</div>}
      <div className="grid gap-3 lg:grid-cols-2">{readiness.checks.map((item) => <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"><div className="flex items-center justify-between gap-3"><p className="font-medium text-slate-100">{item.id}</p><span className={`rounded border px-2 py-0.5 text-xs ${item.status === "PASS" ? "border-emerald-500/30 text-emerald-300" : item.status === "WARN" ? "border-amber-500/30 text-amber-200" : "border-rose-500/30 text-rose-200"}`}>{item.status}</span></div><p className="mt-2 text-sm text-slate-300">{item.message}</p><p className="mt-2 text-xs text-slate-500">Tindakan: {item.action}</p></div>)}</div>
    </>}
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-5"><h3 className="text-lg font-semibold text-white">Retention aman</h3><p className="mt-1 text-sm text-slate-400">Preview hanya memilih artefak lama. Purge memindahkan data ke trash yang dapat dipulihkan—tidak ada penghapusan otomatis.</p><div className="mt-4 flex flex-wrap items-center gap-3"><label className="text-sm text-slate-300">Usia minimum <input className="ml-2 w-20 rounded border border-slate-700 bg-slate-900 px-2 py-1" type="number" min="1" value={days} onChange={(event) => setDays(Number(event.target.value))} /> hari</label><Button onClick={() => preview.mutate(days)} disabled={preview.isPending}>{preview.isPending ? "Membuat preview…" : "Buat preview"}</Button></div>
      {activePlan && <div className="mt-4 rounded-lg border border-slate-700 p-4"><p className="font-medium text-slate-100">{activePlan.summary.candidateCount} kandidat · {formatBytes(activePlan.summary.bytes)}</p><p className="mt-1 text-xs text-slate-500">Plan {activePlan.planId} kedaluwarsa {new Date(activePlan.expiresAt || "").toLocaleString("id-ID")}</p><label className="mt-3 flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={confirmed && planId === activePlan.planId} onChange={(event) => { setConfirmed(event.target.checked); setPlanId(activePlan.planId) }} /> Saya memahami data dipindahkan ke trash yang dapat dipulihkan.</label><Button className="mt-3" variant="destructive" disabled={!confirmed || planId !== activePlan.planId || purge.isPending} onClick={() => purge.mutate(activePlan.planId)}><Trash2 className="mr-2 h-4 w-4" />Pindahkan ke trash</Button></div>}
      {trash.length > 0 && <div className="mt-5 border-t border-slate-800 pt-4"><p className="font-medium text-slate-200">Trash yang dapat dipulihkan</p>{trash.map((item) => <div key={item.planId} className="mt-2 flex items-center justify-between rounded border border-slate-800 px-3 py-2 text-sm"><span>{item.moved?.length ?? 0} item · {item.planId}</span><Button size="sm" variant="outline" disabled={restore.isPending} onClick={() => restore.mutate(item.planId)}><RotateCcw className="mr-2 h-3.5 w-3.5" />Pulihkan</Button></div>)}</div>}
    </section>
  </div>
}

export default OperationsPage
