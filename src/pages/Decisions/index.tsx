import React, { useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDecisionInbox, useResolveDecision } from "@/hooks/use-orchestrator"
import type { DecisionInboxItem } from "@/services/orchestrator"

const riskClass = (risk: string) => {
  if (risk === "HIGH") return "border-rose-500/40 bg-rose-950/20 text-rose-200"
  if (risk === "MEDIUM") return "border-amber-500/40 bg-amber-950/20 text-amber-200"
  return "border-slate-700 bg-slate-900/60 text-slate-300"
}

const formatAge = (ageMs: number | null) => {
  if (ageMs === null) return "usia tidak tersedia"
  const minutes = Math.floor(ageMs / 60_000)
  if (minutes < 60) return `${Math.max(1, minutes)} menit menunggu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam menunggu`
  return `${Math.floor(hours / 24)} hari menunggu`
}

const evidenceSummary = (decision: DecisionInboxItem) => {
  if (!decision.evidence || Array.isArray(decision.evidence)) return null
  const values = [decision.evidence.reason, decision.evidence.message, decision.evidence.classification]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
  return values[0] ?? null
}

const actionButtonClass = (action: string) => {
  if (action === "CANCEL") return "bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500"
  if (action === "RETRY") return "bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500"
  return "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500"
}

export const DecisionsPage: React.FC = () => {
  const { data: decisions = [], isLoading, isFetching, isError, refetch } = useDecisionInbox()
  const resolve = useResolveDecision()
  const [pending, setPending] = useState<{ decision: DecisionInboxItem; action: string } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const summary = useMemo(() => ({
    high: decisions.filter((decision) => decision.risk === "HIGH").length,
    total: decisions.length,
  }), [decisions])

  const confirmResolution = async () => {
    if (!pending) return
    setNotice(null)
    try {
      const result = await resolve.mutateAsync({ decisionId: pending.decision.decisionId, action: pending.action })
      setNotice(result.alreadyResolved ? "Decision sudah diselesaikan sebelumnya; tampilan disegarkan tanpa perubahan kedua." : `Decision ${pending.decision.decisionId} diselesaikan dengan action ${pending.action}.`)
      setPending(null)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Decision gagal diselesaikan.")
    }
  }

  return <div className="w-full space-y-6 pb-12">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm text-slate-400">Human review queue</p>
        <h2 className="text-2xl font-semibold text-white">Decision Inbox</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-400">Decision yang belum selesai diurutkan berdasarkan risk lalu waktu tunggu. Action di bawah hanya berasal dari daftar enumerasi decision.</p>
      </div>
      <Button variant="outline" onClick={() => { void refetch() }} disabled={isFetching}>
        <RefreshCw className="mr-2 h-4 w-4" />{isFetching ? "Memuat…" : "Periksa ulang"}
      </Button>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Open decisions</p><p className="mt-1 text-2xl font-semibold text-white">{summary.total}</p></div>
      <div className="rounded-xl border border-rose-500/25 bg-rose-950/10 p-4"><p className="text-xs uppercase tracking-wide text-rose-300/70">High risk</p><p className="mt-1 text-2xl font-semibold text-rose-200">{summary.high}</p></div>
      <div className="rounded-xl border border-indigo-500/25 bg-indigo-950/10 p-4"><p className="text-xs uppercase tracking-wide text-indigo-300/70">Review rule</p><p className="mt-1 text-sm font-medium text-indigo-100">Risk ↓ · oldest first</p></div>
    </div>

    {notice && <div role="status" className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-3 text-sm text-indigo-200">{notice}</div>}
    {isError && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5 text-sm text-rose-200">Decision Inbox tidak dapat dimuat. Periksa koneksi daemon lalu coba lagi.</div>}
    {isLoading && <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-slate-400">Memuat decision inbox…</div>}
    {!isLoading && !isError && decisions.length === 0 && <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-8 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" /><h3 className="mt-3 font-semibold text-emerald-100">Tidak ada decision terbuka</h3><p className="mt-1 text-sm text-emerald-200/70">Semua decision durable sudah ditinjau atau belum ada blocker baru.</p></div>}

    <div className="space-y-4" aria-label="Unresolved decisions">
      {decisions.map((decision) => {
        const summaryText = evidenceSummary(decision)
        return <article key={decision.decisionId} data-testid="decision-card" className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`rounded-lg border p-2 ${riskClass(decision.risk)}`} aria-label={`Risk ${decision.risk}`}><AlertTriangle className="h-5 w-5" /></div>
              <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-white">{decision.type}</h3><span className={`rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${riskClass(decision.risk)}`}>Risk {decision.risk}</span></div><p className="mt-1 font-mono text-xs text-slate-500">{decision.decisionId}</p></div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" />{formatAge(decision.ageMs)}</div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{decision.requestedAction}</p>
          {summaryText && <p className="mt-2 rounded-lg bg-slate-900/80 px-3 py-2 text-xs text-slate-400">Evidence: {summaryText}</p>}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500"><span>Objective: <Link className="text-indigo-300 hover:text-indigo-200" to={`/objectives/${decision.objectiveId}`}>{decision.objectiveId}</Link></span>{decision.nodeId && <span>Node: {decision.nodeId}</span>}{decision.runId && <span>Run: {decision.runId}</span>}<span>Created: {new Date(decision.createdAt).toLocaleString("id-ID")}</span></div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4"><span className="mr-1 text-xs font-medium text-slate-400">Allowed actions:</span>{decision.allowedChoices.map((action) => <Button key={action} size="sm" className={actionButtonClass(action)} aria-label={`Resolve ${action} for ${decision.decisionId}`} onClick={() => setPending({ decision, action })}>{action}</Button>)}</div>
          <p className="mt-3 flex items-center gap-2 text-[11px] text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-indigo-300" />Resolution akan dicatat dengan identity operator lokal dan dapat diulang secara idempotent.</p>
        </article>
      })}
    </div>

    <AlertDialog open={Boolean(pending)} onOpenChange={(open) => { if (!open && !resolve.isPending) setPending(null) }}>
      <AlertDialogContent className="max-w-lg border border-slate-800 bg-slate-900 text-slate-100">
        <AlertDialogHeader className="space-y-3"><AlertDialogTitle className="text-white text-base">Confirm decision resolution</AlertDialogTitle><AlertDialogDescription className="text-slate-300 text-sm leading-relaxed">Action <strong className="text-white">{pending?.action}</strong> akan diterapkan pada <strong className="break-all font-mono text-white">{pending?.decision.decisionId}</strong>. Identity resolver diambil dari operator session lokal; mengirim identity dari luar tidak akan mengubah audit.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter className="mt-2 border-slate-800 bg-slate-900/50"><AlertDialogCancel disabled={resolve.isPending} className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white focus-visible:ring-indigo-500">Batal</AlertDialogCancel><AlertDialogAction disabled={resolve.isPending} onClick={(event) => { event.preventDefault(); void confirmResolution() }} className={actionButtonClass(pending?.action ?? "")}>{resolve.isPending ? "Menyimpan…" : "Confirm resolution"}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
}
