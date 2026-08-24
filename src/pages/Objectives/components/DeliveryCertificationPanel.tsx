import React, { useState } from "react"
import { ShieldCheck } from "lucide-react"
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
import { StatusBadge } from "./StatusBadge"
import type { DeliveryCertificationPanelProps } from "../types"

export function deliveryCertificationErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { error?: { message?: string; details?: { blockers?: unknown } }; data?: { status?: string; blockers?: unknown } } } })?.response
  const payload = response?.data
  const apiError = payload?.error
  const result = payload?.data
  const blockerSource = apiError?.details?.blockers ?? result?.blockers
  const blockers = Array.isArray(blockerSource) ? blockerSource.filter((item): item is string => typeof item === "string") : []
  const message = apiError?.message || (result?.status === "BLOCKED" ? "Delivery certification masih diblokir oleh machine gate." : error instanceof Error ? error.message : fallback)
  return blockers.length > 0 ? `${message} Blockers: ${blockers.join(", ")}` : message
}

export const DeliveryCertificationPanel: React.FC<DeliveryCertificationPanelProps> = ({
  certification,
  canRun,
  onRun,
  onAccept,
  running,
  accepting,
}) => {
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const run = async () => {
    try {
      await onRun()
      setMessage(null)
    } catch (error) {
      setMessage(deliveryCertificationErrorMessage(error, "Delivery certification tidak dapat dibuat."))
    }
  }

  const accept = async () => {
    try {
      await onAccept()
      setAcceptOpen(false)
      setMessage(null)
    } catch (error) {
      setMessage(deliveryCertificationErrorMessage(error, "Delivery certification tidak dapat diterima."))
    }
  }

  return (
    <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <h2 className="text-sm font-semibold text-white">Delivery certification</h2>
            {certification && <StatusBadge state={certification.status} />}
          </div>
          <p className="mt-2 max-w-2xl text-xs text-slate-400">
            Satu bundle durable yang memeriksa plan, execution, integration, preview, visual/E2E evidence, human acceptance, cleanup, dan knowledge capture.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canRun || running}
            onClick={() => void run()}
            className="border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10"
          >
            {running ? "Checking…" : certification ? "Re-run certification" : "Run delivery certification"}
          </Button>
          {certification?.status === "HUMAN_GATE_REQUIRED" && (
            <Button
              type="button"
              size="sm"
              disabled={accepting}
              onClick={() => setAcceptOpen(true)}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              Accept delivery certification
            </Button>
          )}
        </div>
      </div>
      {!canRun && !certification && (
        <p className="mt-3 text-xs text-amber-200">
          Jalankan setelah objective final acceptance berstatus ACCEPTED.
        </p>
      )}
      {certification && (
        <>
          <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-slate-500">Certification ID</p>
              <p className="mt-1 break-all font-mono text-slate-200">{certification.certificationId}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-slate-500">Machine checks</p>
              <p className="mt-1 font-semibold text-white">
                {certification.checks.filter((check) => check.passed).length} / {certification.checks.length} PASS
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-slate-500">Human gate</p>
              <p className="mt-1 text-slate-200">
                {certification.humanGate.confirmed ? `Accepted by ${certification.humanGate.approvedBy ?? "operator"}` : "Required"}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {certification.checks.map((check) => (
              <div key={check.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/30 p-3 text-xs">
                <div>
                  <p className="font-mono text-slate-200">{check.id}</p>
                  <p className="mt-1 text-slate-500">{check.message}</p>
                </div>
                <StatusBadge state={check.status} />
              </div>
            ))}
          </div>
          {certification.blockers.length > 0 && (
            <p className="mt-3 text-xs text-rose-300">Blockers: {certification.blockers.join(", ")}</p>
          )}
          <p className="mt-3 text-xs text-slate-500">{certification.nextAction}</p>
        </>
      )}
      {message && <p className="mt-3 text-xs text-rose-300">{message}</p>}
      <AlertDialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <AlertDialogContent className="max-w-lg border border-slate-800 bg-slate-900 text-slate-100">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-white">Accept delivery certification</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-sm leading-relaxed">
              Human gate ini mengunci bundle certification setelah seluruh machine checks lulus. Pastikan evidence delivery sudah ditinjau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 border-slate-800 bg-slate-900/50">
            <AlertDialogCancel
              disabled={accepting}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white focus-visible:ring-indigo-500"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={accepting}
              onClick={(event) => {
                event.preventDefault()
                void accept()
              }}
              className="bg-emerald-600 text-white hover:bg-emerald-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
            >
              {accepting ? "Menyimpan…" : "Accept certification"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
