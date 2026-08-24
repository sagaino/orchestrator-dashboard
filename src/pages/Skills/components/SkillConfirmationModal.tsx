import React from "react"
import { CheckCircle2, CircleOff } from "lucide-react"
import type { SkillConfirmationModalProps } from "../types"

export const SkillConfirmationModal: React.FC<SkillConfirmationModalProps> = ({
  confirm,
  isPending,
  isError,
  errorMessage,
  onClose,
  onConfirm,
}) => {
  if (!confirm) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-toggle-title"
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300">
            {confirm.enabled ? <CircleOff className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          </div>
          <div>
            <h2 id="skill-toggle-title" className="text-base font-semibold text-white">
              {confirm.enabled ? "Disable" : "Enable"} skill?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              <span className="font-mono text-slate-200">
                {confirm.skillId}@{confirm.version}
              </span>{" "}
              akan{" "}
              {confirm.enabled
                ? "dikeluarkan dari kandidat routing dan assignment baru"
                : "tersedia kembali untuk routing dan assignment baru"}
              . Plan/run yang sudah tercatat tidak diubah.
            </p>
          </div>
        </div>
        {isError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-200"
          >
            {errorMessage || "Perubahan status skill gagal."}
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => void onConfirm()}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {isPending ? "Menyimpan…" : "Konfirmasi"}
          </button>
        </div>
      </div>
    </div>
  )
}
