import React from "react"
import { RotateCcw, Send, MessageSquare, Trash2 } from "lucide-react"
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
  inlineComments = [],
  onRemoveComment,
  visualAnnotations = [],
  onRemoveVisualAnnotation,
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
              Poin Revisi / Catatan Perbaikan {(visualAnnotations.length > 0 || (inlineComments && inlineComments.length > 0)) && <span className="text-slate-500 font-normal">(Opsional jika sudah ada anotasi)</span>}
            </label>
            <textarea
              rows={3}
              required={visualAnnotations.length === 0 && (!inlineComments || inlineComments.length === 0)}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={
                visualAnnotations.length > 0 || (inlineComments && inlineComments.length > 0)
                  ? "Tambahkan instruksi umum tambahan jika ada (opsional)..."
                  : "Tuliskan poin-poin yang perlu direvisi..."
              }
              className="w-full px-3.5 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none font-sans"
            />
          </div>

          {/* Visual Annotations Summary */}
          {visualAnnotations && visualAnnotations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>Visual Pin Annotations ({visualAnnotations.length})</span>
                </label>
                <span className="text-[10px] text-slate-400 font-sans">
                  Disertakan sebagai koordinat visual
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800 divide-y divide-slate-800/60">
                {visualAnnotations.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-2.5 pt-1.5 first:pt-0"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-rose-300 font-semibold">Pin #{idx + 1}</span>
                        <span className="px-1.5 py-0.2 rounded bg-rose-950/80 border border-rose-500/30 text-rose-300 text-[10px] shrink-0 font-mono">
                          X:{Math.round(item.x)}% Y:{Math.round(item.y)}%
                        </span>
                      </div>
                      <p className="text-slate-200 text-xs whitespace-pre-wrap font-sans pl-0.5">{item.comment}</p>
                    </div>
                    {onRemoveVisualAnnotation && (
                      <button
                        type="button"
                        onClick={() => onRemoveVisualAnnotation(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                        title="Hapus pin visual"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inline Annotations Summary */}
          {inlineComments && inlineComments.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Inline Diff Annotations ({inlineComments.length})</span>
                </label>
                <span className="text-[10px] text-slate-400 font-sans">
                  Disertakan dalam payload revisi
                </span>
              </div>
              <div className="max-h-44 overflow-y-auto space-y-2 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800 divide-y divide-slate-800/60">
                {inlineComments.map((item, idx) => (
                  <div
                    key={item.id || `${item.file}-${item.line}-${idx}`}
                    className="flex items-start justify-between gap-2.5 pt-1.5 first:pt-0"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-indigo-300 truncate font-semibold">{item.file}</span>
                        <span className="px-1.5 py-0.2 rounded bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 text-[10px] shrink-0">
                          Line {item.line}
                        </span>
                      </div>
                      <p className="text-slate-200 text-xs whitespace-pre-wrap font-sans pl-0.5">{item.comment}</p>
                    </div>
                    {onRemoveComment && (
                      <button
                        type="button"
                        onClick={() => onRemoveComment(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                        title="Hapus catatan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
              disabled={
                actionLoading ||
                (!reason.trim() && visualAnnotations.length === 0 && (!inlineComments || inlineComments.length === 0))
              }
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


