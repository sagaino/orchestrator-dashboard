import React from "react"
import { Check, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import type { AcceptRunModalProps } from "../types"

export const AcceptRunModal: React.FC<AcceptRunModalProps> = ({
  isOpen,
  run,
  actionLoading,
  onClose,
  onConfirm,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-md">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
            <Check className="h-5 w-5" />
            <AlertDialogTitle className="text-white text-base">Accept & Sinkronisasi Wiki</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-300 text-xs leading-relaxed space-y-2">
            <span>
              Apakah Anda yakin ingin menyetujui run <strong className="text-white font-mono">{run?.task?.id}</strong>?
            </span>
            <span className="block p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <span>Perubahan kode akan diaplikasikan ke branch utama project dan pengetahuan yang relevan disinkronkan ke Wiki secara permanen.</span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="border-slate-800 bg-slate-900/50 mt-2">
          <AlertDialogCancel
            disabled={actionLoading}
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={actionLoading}
            onClick={onConfirm}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
          >
            {actionLoading ? "Menyetujui..." : "Setujui Run"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
