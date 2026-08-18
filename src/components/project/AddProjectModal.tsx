import React from "react"
import {
  FolderGit2,
  FolderPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Layers,
  Sparkles,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAddProjectModal } from "@/hooks/useAddProjectModal"

export interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (result: any) => void
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    activeTab,
    existingRepoPath,
    setExistingRepoPath,
    existingProjectId,
    setExistingProjectId,
    newProjectId,
    setNewProjectId,
    newTargetDir,
    setNewTargetDir,
    newBlueprint,
    errorMessage,
    successMessage,
    isSubmitting,
    isSubmittingExisting,
    isSubmittingNew,
    handleClose,
    handleTabChange,
    handleExistingSubmit,
    handleNewSubmit,
  } = useAddProjectModal({ onClose, onSuccess })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-800/80 bg-slate-900/90 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white leading-snug">
                Add / Onboard Project
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Daftarkan repositori yang ada atau inisialisasi project baru dengan blueprint terintegrasi.
              </DialogDescription>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleTabChange("existing")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === "existing"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FolderGit2 className="h-4 w-4" />
              <span>Existing Project</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleTabChange("new")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === "new"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>New Project (Vite + Shadcn)</span>
            </button>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-rose-200">Terjadi Kesalahan:</span>
                <p className="text-rose-300/90 leading-relaxed break-all font-mono text-[11px]">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Loading Progress State */}
          {isSubmitting && (
            <div className="p-5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {activeTab === "existing"
                      ? "Sedang Menghubungkan Repositori..."
                      : "Sedang Menginisialisasi Project Baru..."}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {activeTab === "existing"
                      ? "Memverifikasi package.json, baseline checks, dan bootstrapping Graphify code intelligence."
                      : "Menjalankan Vite + Shadcn template deterministic staging, verifikasi baseline, dan registrasi Vault."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Existing Project Form */}
          {activeTab === "existing" && (
            <form id="form-onboard-existing" onSubmit={handleExistingSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Repository Path Lokal <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={existingRepoPath}
                  onChange={(e) => setExistingRepoPath(e.target.value)}
                  placeholder="/Users/username/Documents/my-existing-project"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-mono text-xs disabled:opacity-50"
                />
                <p className="text-[11px] text-slate-400">
                  Lokasi path absolut atau relatif ke folder repositori Git lokal yang memiliki <code>package.json</code>.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Project ID (Opsional)
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={existingProjectId}
                  onChange={(e) => setExistingProjectId(e.target.value)}
                  placeholder="e.g. my-service (otomatis dari nama folder jika kosong)"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-mono text-xs disabled:opacity-50"
                />
                <p className="text-[11px] text-slate-400">
                  Identifier unik untuk project ini di sistem Orchestrator & Obsidian Wiki.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
                  <Info className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Proses Onboarding Otomatis:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
                  <li>Validasi Git status dan dependensi <code>package.json</code>.</li>
                  <li>Inisialisasi atau pembaruan Graphify code intelligence lokal.</li>
                  <li>Registrasi project ke <code>project-registry.md</code> dan Obsidian Vault.</li>
                </ul>
              </div>
            </form>
          )}

          {/* TAB 2: New Project Form */}
          {activeTab === "new" && (
            <form id="form-onboard-new" onSubmit={handleNewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Project ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  placeholder="e.g. admin-portal"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-mono text-xs disabled:opacity-50"
                />
                <p className="text-[11px] text-slate-400">
                  Slug unik nama project (akan menjadi ID di Obsidian Wiki & project registry).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Target Directory <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={newTargetDir}
                  onChange={(e) => setNewTargetDir(e.target.value)}
                  placeholder="/Users/username/Documents/projects/admin-portal"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-mono text-xs disabled:opacity-50"
                />
                <p className="text-[11px] text-slate-400">
                  Path folder tujuan tempat scaffold project baru akan ditempatkan.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Blueprint Template
                </label>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <div>
                      <div className="font-semibold text-slate-200 font-mono text-[11px]">
                        {newBlueprint} (Vite + React + Tailwind + Shadcn UI)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Blueprint deterministik versi 2 dengan standard verification baseline.
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    Default
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Fitur Otomatis Blueprint Baru:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
                  <li>Inisialisasi Vite + TypeScript + React + Shadcn UI komponen.</li>
                  <li>Preflight verification (typecheck, lint, build) sebelum commit.</li>
                  <li>Inisialisasi Git repository awal dan bootstrap Graphify.</li>
                </ul>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="m-0 border-t border-slate-800 bg-slate-900/90 flex flex-row items-center justify-between gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Batal
          </button>

          {activeTab === "existing" ? (
            <button
              type="submit"
              form="form-onboard-existing"
              disabled={isSubmitting || !existingRepoPath.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center gap-1.5 shadow-sm"
            >
              {isSubmittingExisting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Onboarding...</span>
                </>
              ) : (
                <>
                  <FolderGit2 className="h-3.5 w-3.5" />
                  <span>Onboard Existing Project</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="submit"
              form="form-onboard-new"
              disabled={isSubmitting || !newProjectId.trim() || !newTargetDir.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center gap-1.5 shadow-sm"
            >
              {isSubmittingNew ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Membuat Project...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Create & Onboard Project</span>
                </>
              )}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
