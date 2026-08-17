import React from "react"
import { HelpCircle, Send, RefreshCw, MessageSquareQuote } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { ClarificationModalProps } from "../types"

export const ClarificationModal: React.FC<ClarificationModalProps> = ({
  isOpen,
  question,
  answer,
  onAnswerChange,
  submitting = false,
  onClose,
  onSubmit,
  originalPrompt,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-lg shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
            <HelpCircle className="h-5 w-5" />
            <DialogTitle className="text-white text-base">Klarifikasi Diperlukan</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-xs leading-relaxed">
            AI memerlukan klarifikasi tambahan untuk memvalidasi readiness gate dan memastikan batasan scope task.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* AI Question Box */}
          <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs space-y-1.5">
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquareQuote className="h-3.5 w-3.5" />
              Pertanyaan AI (Readiness Gate Feedback):
            </div>
            <p className="text-amber-200/90 leading-relaxed font-sans whitespace-pre-wrap">
              {question || "Silakan berikan detail atau klarifikasi tambahan untuk instruksi task Anda."}
            </p>
          </div>

          {/* Original Prompt preview */}
          {originalPrompt && (
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Instruksi Asal:
              </span>
              <p className="text-slate-400 line-clamp-2 italic font-sans text-[11px]">
                "{originalPrompt}"
              </p>
            </div>
          )}

          {/* Answer Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="clarification-answer" className="block text-xs font-medium text-slate-300">
              Jawaban Klarifikasi
            </label>
            <textarea
              id="clarification-answer"
              rows={4}
              required
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Berikan jawaban atau rincian tambahan terkait pertanyaan di atas..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none font-sans"
            />
          </div>

          <DialogFooter className="border-slate-800 bg-slate-900/50 -mx-4 -mb-4 p-4 rounded-b-xl flex flex-row items-center justify-end gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !answer.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-medium text-white transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Kirim Jawaban & Lanjutkan</span>
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
