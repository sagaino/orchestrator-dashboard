import React from "react"
import { RotateCcw, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { RequestChangesModalProps } from "../types"

export const RequestChangesModal: React.FC<RequestChangesModalProps> = ({
  isOpen,
  reason,
  onReasonChange,
  actionLoading,
  onClose,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-lg">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
            <RotateCcw className="h-5 w-5" />
            <DialogTitle className="text-white text-base">Request Changes (Revisi Agent)</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-xs leading-relaxed">
            Instruksi revisi ini akan dikirimkan ke agent pada worktree terisolasi yang sama untuk diperbaiki ulang.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Poin Revisi / Catatan Perbaikan
            </label>
            <textarea
              rows={5}
              required
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Tuliskan poin-poin yang perlu direvisi..."
              className="w-full px-3.5 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none font-sans"
            />
          </div>

          <DialogFooter className="border-slate-800 bg-slate-900/50 -mx-4 -mb-4 p-4 rounded-b-xl">
            <button
              type="button"
              disabled={actionLoading}
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={actionLoading || !reason.trim()}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-xs font-medium text-white transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{actionLoading ? "Mengirim..." : "Kirim Revisi"}</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

