import React from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, XCircle } from "lucide-react"
import { useCancelObjective } from "@/hooks/use-orchestrator"
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
import { StatusBadge } from "./StatusBadge"
import { requestSections } from "./ObjectiveRequestHeading"
import type { SummaryListProps } from "../types"

export const SummaryList: React.FC<SummaryListProps> = ({ items }) => {
  const visibleItems = items.filter((item) => item.state !== "CANCELLED")
  const [cancelObjectiveId, setCancelObjectiveId] = React.useState<string | null>(null)
  const [cancelError, setCancelError] = React.useState<string | null>(null)
  const { mutateAsync: cancelObjective, isPending: cancelling } = useCancelObjective()

  const selectedObjective = items.find((item) => item.objectiveId === cancelObjectiveId)
  const confirmCancel = async () => {
    if (!cancelObjectiveId) return
    try {
      setCancelError(null)
      await cancelObjective(cancelObjectiveId)
      window.localStorage.removeItem("orchestrator.pending-objective.v1")
      setCancelObjectiveId(null)
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : "Objective tidak dapat dibatalkan.")
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Objectives</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Objective evidence center</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Pilih objective untuk meninjau outcome node, diff, preview, verification, blocker, usage, dan final acceptance.
        </p>
      </div>
      {visibleItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
          Belum ada objective.
        </div>
      ) : (
        visibleItems.map((item) => {
          const { title, details } = requestSections(item.request)
          return (
            <div
              key={item.objectiveId}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-indigo-500/40 hover:bg-slate-900 sm:p-6"
            >
              <Link
                to={`/objectives/${encodeURIComponent(item.objectiveId)}`}
                className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-indigo-300">{item.objectiveId}</p>
                    <h2 className="mt-2 line-clamp-2 max-w-4xl text-base font-semibold leading-snug text-white sm:text-lg">
                      {title}
                    </h2>
                    {details && (
                      <p className="mt-2 line-clamp-2 max-w-4xl text-sm leading-6 text-slate-400">
                        {details}
                      </p>
                    )}
                  </div>
                  <StatusBadge state={item.state} />
                </div>
              </Link>
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Projects
                </span>
                {item.projectIds.map((projectId) => (
                  <span
                    key={projectId}
                    className="rounded-md border border-slate-700/80 bg-slate-950/40 px-2 py-1 text-xs text-slate-400"
                  >
                    {projectId}
                  </span>
                ))}
                <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                  {item.state === "PLANNING" && (
                    <button
                      type="button"
                      onClick={() => setCancelObjectiveId(item.objectiveId)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/20"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Batalkan objective
                    </button>
                  )}
                  <Link
                    to={`/objectives/${encodeURIComponent(item.objectiveId)}`}
                    className="text-xs font-medium text-indigo-300 transition-colors hover:text-indigo-200"
                  >
                    Buka objective →
                  </Link>
                </div>
              </div>
            </div>
          )
        })
      )}

      <AlertDialog open={Boolean(selectedObjective)} onOpenChange={(open) => !open && !cancelling && setCancelObjectiveId(null)}>
        <AlertDialogContent className="border border-slate-800 bg-slate-900 text-slate-100">
          <AlertDialogHeader>
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-white">Batalkan objective?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Objective ini akan berstatus CANCELLED dan tidak akan diproses lagi. Record audit tetap disimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedObjective && <p className="break-all rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-slate-400">{selectedObjective.objectiveId}</p>}
          {cancelError && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{cancelError}</p>}
          <AlertDialogFooter className="border-slate-800 bg-slate-900/50">
            <AlertDialogCancel disabled={cancelling} className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">Kembali</AlertDialogCancel>
            <AlertDialogAction disabled={cancelling} onClick={(event) => { event.preventDefault(); void confirmCancel() }} className="bg-rose-600 text-white hover:bg-rose-500">
              {cancelling ? "Membatalkan..." : "Batalkan objective"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
