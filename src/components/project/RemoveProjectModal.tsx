import React, { useState } from "react"
import {
  Trash2,
  Archive,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useRemoveProject } from "@/hooks/use-orchestrator"
import { toast } from "@/components/ui/toast"

export interface RemoveProjectModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string | null
  projectRepo?: string
}

export const RemoveProjectModal: React.FC<RemoveProjectModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectRepo,
}) => {
  const [purgePermanently, setPurgePermanently] = useState(false)
  const [confirmInput, setConfirmInput] = useState("")
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const { mutateAsync: removeProject, isPending } = useRemoveProject()

  const handleClose = () => {
    if (isPending) return
    setPurgePermanently(false)
    setConfirmInput("")
    setErrorDetails(null)
    onClose()
  }

  const isConfirmed = confirmInput.trim() === projectId

  const handleRemove = async () => {
    if (!projectId || !isConfirmed || isPending) return
    setErrorDetails(null)

    try {
      await removeProject({
        projectId,
        purge: purgePermanently,
      })

      toast.add({
        title: purgePermanently ? "Project Dipurge Permanen" : "Project Diarsipkan",
        description: purgePermanently
          ? `Project '${projectId}' berhasil dihapus tuntas dari Wiki Vault.`
          : `Project '${projectId}' berhasil di-unregister dan diarsipkan ke 03-Sources.`,
        type: "success",
      })

      handleClose()
    } catch (err: any) {
      const errorObj = err.response?.data?.error
      const msg = typeof errorObj === "string" 
        ? errorObj 
        : errorObj?.message || err.message || "Gagal menghapus project"
      setErrorDetails(msg)
      toast.add({
        title: "Gagal Menghapus Project",
        description: msg,
        type: "error",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 sm:max-w-xl max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl rounded-2xl gap-0">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 border-b border-slate-800/80 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 pr-6">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
              <Trash2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                Hapus Project dari Orchestrator
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Unregister metadata project dari sistem kontrol AI.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="p-5 space-y-3.5 overflow-y-auto max-h-[calc(85vh-130px)] text-xs">
          {/* Target Project Card */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs">Project ID:</span>
              <span className="text-rose-400 font-bold text-xs">{projectId}</span>
            </div>
            {projectRepo && (
              <div className="flex items-center justify-between text-[11px] gap-2 pt-0.5">
                <span className="text-slate-500 shrink-0">Repository:</span>
                <span className="text-slate-300 truncate font-sans text-[11px]">{projectRepo}</span>
              </div>
            )}
          </div>

          {/* Safety Guarantees Notice */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-emerald-400 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Jaminan Keamanan Source Code:</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed pl-5.5">
              Folder kode sumber asli di komputer <strong>TIDAK AKAN DIHAPUS</strong>. Global knowledge yang pernah dipelajari AI juga tetap aman.
            </p>
          </div>

          {/* Error Details */}
          {errorDetails && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-rose-400 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Tidak Dapat Menghapus Project:</span>
              </div>
              <p className="text-[11px] text-rose-200/90 leading-relaxed pl-5.5">{errorDetails}</p>
            </div>
          )}

          {/* Deletion Method Options */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Pilih Metode Penghapusan:</label>
            <div className="space-y-2">
              {/* Option 1: Unregister & Archive (Default) */}
              <div
                onClick={() => setPurgePermanently(false)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  !purgePermanently
                    ? "bg-indigo-950/30 border-indigo-500/50 text-slate-200"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Archive className={`h-4 w-4 mt-0.5 shrink-0 ${!purgePermanently ? "text-indigo-400" : "text-slate-500"}`} />
                <div className="space-y-0.5">
                  <div className="font-semibold text-xs text-white">Unregister & Archive (Direkomendasikan)</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Hapus dari daftar aktif dashboard dan pindahkan riwayat task ke folder arsip <code className="text-indigo-300 font-mono text-[10px]">03-Sources/other/removed-projects/</code>.
                  </p>
                </div>
              </div>

              {/* Option 2: Purge Archive (Permanent) */}
              <div
                onClick={() => setPurgePermanently(true)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  purgePermanently
                    ? "bg-rose-950/30 border-rose-500/50 text-slate-200"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <ShieldAlert className={`h-4 w-4 mt-0.5 shrink-0 ${purgePermanently ? "text-rose-400" : "text-slate-500"}`} />
                <div className="space-y-0.5">
                  <div className="font-semibold text-xs text-white">Purge Permanently from Wiki Vault</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Hapus bersih seluruh jejak metadata project dari Obsidian Vault dan pindahkan ke karantina audit eksternal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Type Confirmation */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] text-slate-400">
              Ketik <span className="font-mono text-rose-400 font-semibold">{projectId}</span> untuk mengonfirmasi:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={`Ketik ${projectId || ""}`}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 p-4 px-5 border-t border-slate-800/80 bg-slate-950/50 flex flex-row items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={!isConfirmed || isPending}
            className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>{purgePermanently ? "Purge Project Permanen" : "Hapus & Arsipkan"}</span>
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
