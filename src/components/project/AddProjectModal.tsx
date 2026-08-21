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
  Archive,
  RotateCcw,
  Trash2,
  Clock,
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
    archivedProjects,
    isLoadingArchived,
    isRestoring,
    isPurging,
    errorMessage,
    successMessage,
    isSubmitting,
    isSubmittingExisting,
    isSubmittingNew,
    handleClose,
    handleTabChange,
    handleExistingSubmit,
    handleNewSubmit,
    handleRestoreProject,
    handlePurgeProject,
  } = useAddProjectModal({ onClose, onSuccess })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-800/80 bg-slate-900/90 space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white leading-snug">
                Project Management & Onboarding
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Daftarkan repositori, inisialisasi project baru, atau kelola arsip project.
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
              <span>New Project</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleTabChange("archive")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === "archive"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Archive className="h-4 w-4" />
              <span>Archived ({archivedProjects.length})</span>
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

          {/* Tab 1: Existing Project Form */}
          {activeTab === "existing" && (
            <form id="form-onboard-existing" onSubmit={handleExistingSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Repository Path</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="/Users/username/ciniru/my-repo"
                  value={existingRepoPath}
                  onChange={(e) => setExistingRepoPath(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50"
                />
                <p className="text-[11px] text-slate-500">
                  Path absolut ke direktori Git repository yang berisi <code className="text-indigo-400">package.json</code>.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Custom Project ID</span>
                  <span className="text-[10px] text-slate-500 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="my-project (default: nama folder)"
                  value={existingProjectId}
                  onChange={(e) => setExistingProjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50"
                />
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
                  <Info className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Proses Onboarding Existing:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
                  <li>Validasi git repository dan package verification baseline.</li>
                  <li>Bootstrap & indexing Knowledge Graphify otomatis.</li>
                  <li>Registrasi project ke Obsidian Wiki schema.</li>
                </ul>
              </div>
            </form>
          )}

          {/* Tab 2: New Project Form */}
          {activeTab === "new" && (
            <form id="form-onboard-new" onSubmit={handleNewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Project ID / Name</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="my-saas-app"
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Target Directory</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="/Users/username/ciniru/my-saas-app"
                  value={newTargetDir}
                  onChange={(e) => setNewTargetDir(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Architecture Blueprint</span>
                </label>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Vite + React + TypeScript + Shadcn UI
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
            </form>
          )}

          {/* Tab 3: Archived Projects List */}
          {activeTab === "archive" && (
            <div className="space-y-3">
              {isLoadingArchived ? (
                <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span>Memuat daftar arsip project...</span>
                </div>
              ) : archivedProjects.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center space-y-2">
                  <Archive className="h-8 w-8 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-300">Tidak Ada Project yang Diarsipkan</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Semua project aktif atau sudah dibersihkan permanen dari Vault.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {archivedProjects.map((p) => (
                    <div
                      key={p.projectId}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white text-sm">{p.projectId}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {p.versionCount} snapshot arsip
                          </span>
                        </div>
                        {p.repository && (
                          <p className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                            {p.repository}
                          </p>
                        )}
                        {p.removedAt && (
                          <p className="text-[10px] text-slate-500">
                            Diarsipkan: {new Date(p.removedAt).toLocaleString("id-ID")}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleRestoreProject(p.projectId)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Restore Project</span>
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handlePurgeProject(p.projectId)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs transition-all cursor-pointer disabled:opacity-50"
                          title="Purge Permanently from Vault"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="m-0 p-4 border-t border-slate-800 bg-slate-900/90 flex flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Tutup
          </button>

          {activeTab === "existing" && (
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
          )}

          {activeTab === "new" && (
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
