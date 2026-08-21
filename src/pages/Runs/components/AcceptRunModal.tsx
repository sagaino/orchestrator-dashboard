import React, { useState, useEffect } from "react"
import { Check, AlertTriangle, GitCommit } from "lucide-react"
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
  const [autoCommit, setAutoCommit] = useState(true)
  const [commitMessage, setCommitMessage] = useState("")

  useEffect(() => {
    if (run) {
      const defaultMsg = `feat(${run.task?.id || "TASK"}): ${run.task?.title || "completed task"}`
      setCommitMessage(defaultMsg)
      setAutoCommit(true)
    }
  }, [run, isOpen])

  const handleConfirmSubmit = async () => {
    if (actionLoading || (autoCommit && !commitMessage.trim())) return
    try {
      await onConfirm({
        autoCommit,
        commitMessage: autoCommit ? commitMessage.trim() : undefined,
      })
    } catch {
      // Error handling is handled in the onConfirm caller
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleConfirmSubmit()
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !actionLoading && onClose()}>
      <AlertDialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-lg">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
            <Check className="h-5 w-5" />
            <AlertDialogTitle className="text-white text-base">Accept & Sinkronisasi Wiki</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-300 text-xs leading-relaxed space-y-3">
            <span>
              Apakah Anda yakin ingin menyetujui run <strong className="text-white font-mono">{run?.task?.id}</strong>?
            </span>
            <span className="block p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <span>Perubahan kode akan diaplikasikan ke branch utama project dan pengetahuan yang relevan disinkronkan ke Wiki secara permanen.</span>
            </span>

            {/* Optional Auto Git Commit Controls */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoCommit}
                  onChange={(e) => setAutoCommit(e.target.checked)}
                  disabled={actionLoading}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                />
                <GitCommit className="h-4 w-4 text-indigo-400" />
                <span>Auto-commit ke Git setelah Accept</span>
              </label>

              {autoCommit && (
                <div className="space-y-1 pl-6">
                  <label className="block text-[11px] font-medium text-slate-400">
                    Pesan Commit (bisa diedit):
                  </label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={actionLoading}
                    placeholder="e.g. feat(FE-019): deskripsi commit"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 placeholder:text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
                  />
                </div>
              )}
            </div>
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
            disabled={actionLoading || (autoCommit && !commitMessage.trim())}
            onClick={handleConfirmSubmit}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer disabled:opacity-50"
          >
            {actionLoading ? "Menyetujui..." : autoCommit ? "Setujui & Commit" : "Setujui Saja"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
