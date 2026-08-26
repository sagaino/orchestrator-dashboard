import React, { useState } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, CheckCircle2, Filter, HelpCircle, XCircle } from "lucide-react"
import { useCancelObjective, useGenerateObjectivePlan, useObjective } from "@/hooks/use-orchestrator"
import { ClarificationModal } from "@/pages/Tasks/components/ClarificationModal"
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
  const [filter, setFilter] = useState<"ACTIVE" | "ALL" | "DONE" | "CANCELLED">(() => {
    const hasActive = items.some((item) => item.state !== "CANCELLED" && item.state !== "DONE")
    return hasActive ? "ACTIVE" : "ALL"
  })
  const visibleItems = items.filter((item) => {
    if (filter === "ALL") return true
    if (filter === "DONE") return item.state === "DONE"
    if (filter === "CANCELLED") return item.state === "CANCELLED"
    return item.state !== "CANCELLED" && item.state !== "DONE"
  })

  const [cancelObjectiveId, setCancelObjectiveId] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const { mutateAsync: cancelObjective, isPending: cancelling } = useCancelObjective()

  const [clarifyObjectiveId, setClarifyObjectiveId] = useState<string | null>(null)
  const [clarificationAnswer, setClarificationAnswer] = useState("")
  const { mutateAsync: generatePlan, isPending: submittingClarification } = useGenerateObjectivePlan()
  const { data: clarifyDetail } = useObjective(clarifyObjectiveId ?? "")

  const selectedObjective = items.find((item) => item.objectiveId === cancelObjectiveId)
  const selectedClarifyItem = items.find((item) => item.objectiveId === clarifyObjectiveId)

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

  const handleClarificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clarifyObjectiveId || !clarificationAnswer.trim()) return
    try {
      await generatePlan({
        objectiveId: clarifyObjectiveId,
        clarification: clarificationAnswer.trim(),
      })
      setClarifyObjectiveId(null)
      setClarificationAnswer("")
    } catch {
      // error handled by mutation
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          <span>Objectives</span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-white">Objective evidence center</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Pilih objective untuk meninjau outcome node, diff, preview, verification, blocker, usage, dan final acceptance.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-2">
        {(["ACTIVE", "ALL", "DONE", "CANCELLED"] as const).map((value) => {
          const labels = { ACTIVE: "Aktif", ALL: "Semua", DONE: "Selesai", CANCELLED: "Dibatalkan" }
          const count = value === "ACTIVE"
            ? items.filter((item) => item.state !== "CANCELLED" && item.state !== "DONE").length
            : value === "ALL"
              ? items.length
              : value === "DONE"
                ? items.filter((item) => item.state === "DONE").length
                : items.filter((item) => item.state === "CANCELLED").length
          const active = filter === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <span>{labels[value]}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  active ? "bg-indigo-500/40 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
        <span className="ml-auto text-[11px] text-slate-500">
          Objective dibatalkan tetap tersimpan untuk audit.
        </span>
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-3 text-sm font-medium text-slate-400">Tidak ada objective yang cocok dengan filter.</p>
        </div>
      ) : (
        visibleItems.map((item) => {
          const { title, details } = requestSections(item.request)
          return (
            <div
              key={item.objectiveId}
              className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 transition-all hover:border-slate-700/80 hover:bg-slate-900/60"
            >
              <Link to={`/objectives/${encodeURIComponent(item.objectiveId)}`} className="block">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-indigo-300">{item.objectiveId}</p>
                    <h2 className="mt-1 text-base font-semibold leading-snug text-white transition-colors group-hover:text-indigo-200">
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
                  {item.state === "NEEDS_CLARIFICATION" && (
                    <button
                      type="button"
                      onClick={() => setClarifyObjectiveId(item.objectiveId)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/30 shadow-sm cursor-pointer"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      Jawab Klarifikasi
                    </button>
                  )}
                  {["PLANNING", "NEEDS_CLARIFICATION", "PLAN_REVIEW"].includes(item.state) && (
                    <button
                      type="button"
                      onClick={() => setCancelObjectiveId(item.objectiveId)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/20 cursor-pointer"
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

      {/* Reusable Standard Clarification Modal Component */}
      <ClarificationModal
        isOpen={Boolean(clarifyObjectiveId)}
        question={clarifyDetail?.planning?.clarificationQuestion || ""}
        answer={clarificationAnswer}
        onAnswerChange={setClarificationAnswer}
        submitting={submittingClarification}
        onClose={() => {
          setClarifyObjectiveId(null)
          setClarificationAnswer("")
        }}
        onSubmit={handleClarificationSubmit}
        originalPrompt={clarifyDetail?.request || selectedClarifyItem?.request}
      />

      {/* Modal Dialog Pembatalan Objective */}
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
