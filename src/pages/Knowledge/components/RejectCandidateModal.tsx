import React from "react"
import { X, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { RejectCandidateModalProps } from "../types"

export const RejectCandidateModal: React.FC<RejectCandidateModalProps> = ({
  isOpen,
  candidate,
  reason,
  onReasonChange,
  actionLoading,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-md">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-base">
            <X className="h-5 w-5" />
            <DialogTitle className="text-white text-base">Tolak Knowledge Candidate</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-xs leading-relaxed">
            Candidate <strong className="text-white font-mono">{candidate?.title}</strong> akan ditolak dan diarsipkan ke <code className="text-slate-300">03-Sources/other/</code>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onConfirm} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Alasan Penolakan
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Masukkan alasan penolakan candidate..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none font-sans"
            />
          </div>

          <DialogFooter className="border-slate-800 bg-slate-900/50 -mx-4 -mb-4 p-4 rounded-b-xl">
            <button
              type="button"
              disabled={actionLoading}
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={actionLoading || !reason.trim()}
              className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer flex items-center gap-1.5"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{actionLoading ? "Menolak..." : "Tolak Candidate"}</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
