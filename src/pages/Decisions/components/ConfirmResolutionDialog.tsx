import React from "react"
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
import { actionButtonClass } from "./DecisionCard"
import type { ConfirmResolutionDialogProps } from "../types"

export const ConfirmResolutionDialog: React.FC<ConfirmResolutionDialogProps> = ({
  pending,
  isPending,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <AlertDialog open={Boolean(pending)} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg border border-slate-800 bg-slate-900 text-slate-100">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-white text-base">Confirm decision resolution</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300 text-sm leading-relaxed">
            Action <strong className="text-white">{pending?.action}</strong> akan diterapkan pada <strong className="break-all font-mono text-white">{pending?.decision.decisionId}</strong>. Identity resolver diambil dari operator session lokal; mengirim identity dari luar tidak akan mengubah audit.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 border-slate-800 bg-slate-900/50">
          <AlertDialogCancel
            disabled={isPending}
            className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white focus-visible:ring-indigo-500"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              void onConfirm()
            }}
            className={actionButtonClass(pending?.action ?? "")}
          >
            {isPending ? "Menyimpan…" : "Confirm resolution"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
