import React from "react"
import { AlertTriangle, CheckCircle2, FileCheck2, FolderLock, ListChecks, RefreshCw, ShieldCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { TaskConfirmationModalProps } from "../types"

const EmptyValue = () => <span className="text-slate-500">Tidak ditentukan</span>

export const TaskConfirmationModal: React.FC<TaskConfirmationModalProps> = ({
  isOpen,
  result,
  queueAfterConfirmation,
  confirming,
  onClose,
  onConfirm,
}) => {
  if (!result) return null

  const confirmation = result.confirmation
  const readiness = confirmation.readiness ?? result.readiness
  const canQueue = readiness?.ready === true

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !confirming && onClose()}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-300">
            <FileCheck2 className="h-5 w-5" />
            <DialogTitle className="text-white text-lg">Review Canonical Plan</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-xs leading-relaxed">
            Task sudah dibuat di Backlog. Periksa scope dan verification berikut sebelum memberi persetujuan eksplisit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section className="rounded-xl border border-slate-700 bg-slate-950/50 p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-indigo-300">{result.task.id}</p>
                <h3 className="mt-1 text-sm font-semibold text-white">{result.task.title}</h3>
                <p className="mt-1 text-[11px] text-slate-500">{result.project} · {result.task.path}</p>
              </div>
              <div className="flex gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider ${canQueue ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}>
                  {readiness?.verdict ?? "UNKNOWN"}
                </span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-amber-300">
                  RISK {confirmation.risk?.toUpperCase() || "UNKNOWN"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-slate-900 p-2"><p className="text-lg font-bold text-emerald-300">{readiness?.summary.passed ?? 0}</p><p className="text-[10px] text-slate-500">Passed</p></div>
              <div className="rounded-lg bg-slate-900 p-2"><p className="text-lg font-bold text-rose-300">{readiness?.summary.blockers ?? 0}</p><p className="text-[10px] text-slate-500">Blockers</p></div>
              <div className="rounded-lg bg-slate-900 p-2"><p className="text-lg font-bold text-amber-300">{readiness?.summary.warnings ?? 0}</p><p className="text-[10px] text-slate-500">Warnings</p></div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-200"><FolderLock className="h-4 w-4 text-sky-400" />Allowed Paths</h4>
              {confirmation.allowedPaths.length ? <ul className="space-y-1.5">{confirmation.allowedPaths.map((path) => <li key={path} className="break-all font-mono text-[11px] text-slate-400">• {path}</li>)}</ul> : <EmptyValue />}
            </section>
            <section className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-200"><ShieldCheck className="h-4 w-4 text-emerald-400" />Verification</h4>
              {confirmation.verification.length ? <ul className="space-y-1.5">{confirmation.verification.map((item) => <li key={item} className="font-mono text-[11px] text-slate-400">• {item}</li>)}</ul> : <EmptyValue />}
            </section>
          </div>

          <section className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-200"><ListChecks className="h-4 w-4 text-violet-400" />Acceptance Criteria</h4>
            {confirmation.acceptanceCriteria.length ? <ol className="space-y-1.5">{confirmation.acceptanceCriteria.map((item, index) => <li key={`${index}-${item}`} className="text-xs leading-relaxed text-slate-400"><span className="mr-2 font-mono text-violet-400">{index + 1}.</span>{item}</li>)}</ol> : <EmptyValue />}
          </section>

          {readiness?.checks?.length ? (
            <section className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-200"><CheckCircle2 className="h-4 w-4 text-emerald-400" />Readiness Checks</h4>
              <ul className="space-y-2">{readiness.checks.map((check) => <li key={check.id} className="flex items-start justify-between gap-3 text-[11px]"><span className="text-slate-400">{check.message}</span><span className="shrink-0 font-mono text-slate-500">{check.status}</span></li>)}</ul>
            </section>
          ) : null}

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            <div className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Approval mode: EXPLICIT HUMAN.</strong> Eksekusi tidak dimulai sampai Anda memilih Approve &amp; Queue. Menutup dialog akan mempertahankan task di Backlog.</p></div>
          </div>
        </div>

        <DialogFooter className="border-slate-800 bg-slate-900/50 -mx-4 -mb-4 p-4 rounded-b-xl flex flex-row items-center justify-end gap-2">
          <button type="button" disabled={confirming} onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors disabled:opacity-50">
            Simpan di Backlog
          </button>
          {queueAfterConfirmation && (
            <button type="button" disabled={confirming || !canQueue} onClick={onConfirm} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-medium text-white transition-colors flex items-center gap-1.5">
              {confirming ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Mengantrekan...</> : <><ShieldCheck className="h-3.5 w-3.5" />Approve &amp; Queue</>}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
