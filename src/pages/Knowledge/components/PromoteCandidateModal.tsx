import React from "react"
import { BookOpen, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { PromoteCandidateModalProps } from "../types"

export const PromoteCandidateModal: React.FC<PromoteCandidateModalProps> = ({
  isOpen,
  candidate,
  targetPath,
  onTargetPathChange,
  actionLoading,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-md">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
            <BookOpen className="h-5 w-5" />
            <DialogTitle className="text-white text-base">Promote Candidate to Wiki</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-xs leading-relaxed">
            Candidate <strong className="text-white font-mono">{candidate?.title}</strong> akan dipromosikan ke layer <code className="text-indigo-300">01-Knowledge/</code>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onConfirm} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Target Path di 01-Knowledge/ <span className="text-slate-500 font-normal">(opsional)</span>
            </label>
            <input
              type="text"
              value={targetPath}
              onChange={(e) => onTargetPathChange(e.target.value)}
              placeholder="Contoh: 01-Knowledge/patterns/my-pattern.md"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Biarkan kosong jika ingin menggunakan path canonical default dari orchestrator.
            </p>
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
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{actionLoading ? "Memproses..." : "Promote to Wiki"}</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
