import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Target, HelpCircle, Send, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
import { ObjectiveRequestHeading } from "./ObjectiveRequestHeading"
import { ObjectivePlanGate } from "./ObjectivePlanGate"
import { useGenerateObjectivePlan, useCancelObjective } from "@/hooks/use-orchestrator"
import type { PlanOnlyViewProps } from "../types"

export const PlanOnlyView: React.FC<PlanOnlyViewProps> = ({ lifecycle }) => {
  const navigate = useNavigate()
  const [clarificationAnswer, setClarificationAnswer] = useState("")
  const [cancelOpen, setCancelOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { mutateAsync: generatePlan, isPending: submittingClarification } = useGenerateObjectivePlan()
  const { mutateAsync: cancelObjective, isPending: cancelling } = useCancelObjective()

  const isNeedsClarification = lifecycle.state === "NEEDS_CLARIFICATION" || Boolean(lifecycle.planning?.clarificationQuestion)
  const clarificationQuestion = lifecycle.planning?.clarificationQuestion

  const handleSendClarification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clarificationAnswer.trim()) return
    setErrorMsg(null)
    try {
      await generatePlan({
        objectiveId: lifecycle.objectiveId,
        clarification: clarificationAnswer.trim(),
      })
      setClarificationAnswer("")
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengirim klarifikasi.")
    }
  }

  const handleConfirmCancel = async () => {
    setErrorMsg(null)
    try {
      await cancelObjective(lifecycle.objectiveId)
      setCancelOpen(false)
      navigate("/objectives")
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal membatalkan objective.")
    }
  }

  return (
    <div className="w-full space-y-6">
      <Link to="/objectives" className="text-xs text-indigo-300 hover:text-indigo-200">
        ← Semua objectives
      </Link>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 shrink-0 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2.5 text-indigo-300">
            <Target className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="mb-1 font-mono text-xs text-indigo-300">{lifecycle.objectiveId}</p>
            <ObjectiveRequestHeading request={lifecycle.request} />
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
          <div className="flex items-center gap-2">
            <StatusBadge state={lifecycle.state} />
            {["PLANNING", "NEEDS_CLARIFICATION", "PLAN_REVIEW"].includes(lifecycle.state) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCancelOpen(true)}
                className="h-8 gap-1.5 border-rose-500/30 bg-rose-500/10 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
              >
                <XCircle className="h-3.5 w-3.5" />
                Batalkan
              </Button>
            )}
          </div>
          <ObjectivePlanGate lifecycle={lifecycle} />
        </div>
      </div>

      {isNeedsClarification ? (
        <section className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-6 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg border border-amber-500/40 bg-amber-500/20 p-2 text-amber-300">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-amber-200">Klarifikasi Diperlukan oleh AI Planner</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-200 bg-slate-950/60 rounded-lg p-4 border border-amber-500/20 font-medium">
                {clarificationQuestion || "AI Planner memerlukan informasi tambahan untuk menyusun rencana dekomposisi yang aman."}
              </p>

              <form onSubmit={handleSendClarification} className="mt-4 space-y-3">
                <Textarea
                  value={clarificationAnswer}
                  onChange={(e) => setClarificationAnswer(e.target.value)}
                  placeholder="Tuliskan jawaban klarifikasi Anda di sini (misal: 'Ya, jalankan di project be-golang-app saja' atau 'Tambahkan project be-golang-app ke scope')..."
                  className="min-h-[90px] border-slate-700 bg-slate-900/90 text-sm text-slate-100 placeholder:text-slate-500"
                  disabled={submittingClarification}
                />
                {errorMsg && (
                  <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                    {errorMsg}
                  </p>
                )}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelOpen(true)}
                    className="border-slate-700 bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    Atau Batalkan Objective
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submittingClarification || !clarificationAnswer.trim()}
                    className="gap-2 bg-amber-600 font-medium text-white hover:bg-amber-500"
                  >
                    {submittingClarification ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Menyusun Ulang Plan...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Kirim Jawaban & Rencanakan Ulang
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h2 className="text-sm font-semibold text-amber-200">Execution belum dimulai</h2>
          <p className="mt-2 text-xs text-slate-400">
            Plan revision aktif menunggu human approval. Evidence eksekusi akan tersedia setelah plan disetujui dan dimaterialisasi.
          </p>
        </section>
      )}

      <AlertDialog open={cancelOpen} onOpenChange={(open) => !open && !cancelling && setCancelOpen(false)}>
        <AlertDialogContent className="border-slate-800 bg-slate-900 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Objective Ini?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400">
              Objective ini akan berstatus CANCELLED dan tidak akan diproses lebih lanjut.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {errorMsg && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{errorMsg}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling} className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
              Kembali
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelling}
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmCancel()
              }}
              className="bg-rose-600 text-white hover:bg-rose-500"
            >
              {cancelling ? "Membatalkan..." : "Ya, Batalkan Objective"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
