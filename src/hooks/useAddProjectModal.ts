import { useState } from "react"
import {
  useOnboardExistingProject,
  useOnboardNewProject,
  useArchivedProjects,
  useRestoreArchivedProject,
  usePurgeArchivedProject,
} from "@/hooks/use-orchestrator"
import { toast } from "@/components/ui/toast"

export type AddProjectTab = "existing" | "new" | "archive"

export interface UseAddProjectModalOptions {
  onClose: () => void
  onSuccess?: (result: any) => void
}

export function useAddProjectModal({
  onClose,
  onSuccess,
}: UseAddProjectModalOptions) {
  const [activeTab, setActiveTab] = useState<AddProjectTab>("existing")

  // Existing Project State
  const [existingRepoPath, setExistingRepoPath] = useState("")
  const [existingProjectId, setExistingProjectId] = useState("")

  // New Project State
  const [newProjectId, setNewProjectId] = useState("")
  const [newTargetDir, setNewTargetDir] = useState("")
  const [newBlueprint, setNewBlueprint] = useState("frontend-vite")

  // Status & Error
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { data: archivedProjects = [], isLoading: isLoadingArchived } = useArchivedProjects()
  const { mutateAsync: restoreProject, isPending: isRestoring } = useRestoreArchivedProject()
  const { mutateAsync: purgeProject, isPending: isPurging } = usePurgeArchivedProject()

  const {
    mutateAsync: onboardExisting,
    isPending: isSubmittingExisting,
  } = useOnboardExistingProject()

  const {
    mutateAsync: onboardNew,
    isPending: isSubmittingNew,
  } = useOnboardNewProject()

  const isSubmitting = isSubmittingExisting || isSubmittingNew || isRestoring || isPurging

  const resetForm = () => {
    setExistingRepoPath("")
    setExistingProjectId("")
    setNewProjectId("")
    setNewTargetDir("")
    setNewBlueprint("frontend-vite")
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleClose = () => {
    if (isSubmitting) return
    resetForm()
    onClose()
  }

  const handleTabChange = (tab: AddProjectTab) => {
    if (isSubmitting) return
    setActiveTab(tab)
    setErrorMessage(null)
  }

  const handleExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const repoPath = existingRepoPath.trim()
    if (!repoPath) {
      setErrorMessage("Repository Path wajib diisi.")
      return
    }

    try {
      setErrorMessage(null)
      setSuccessMessage(null)
      const res = await onboardExisting({
        repositoryPath: repoPath,
        projectId: existingProjectId.trim() || undefined,
      })

      const projId = res?.projectId || existingProjectId.trim() || "Project"
      const msg = `Project '${projId}' berhasil di-onboard ke Orchestrator.`
      setSuccessMessage(msg)
      toast.add({
        title: "Onboarding Berhasil",
        description: msg,
        type: "success",
      })

      if (onSuccess) {
        onSuccess(res)
      }

      handleClose()
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Gagal melakukan onboarding existing project."
      setErrorMessage(msg)
      toast.add({
        title: "Onboarding Gagal",
        description: msg,
        type: "error",
      })
    }
  }

  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const projId = newProjectId.trim()
    const targetDir = newTargetDir.trim()

    if (!projId) {
      setErrorMessage("Project ID wajib diisi.")
      return
    }
    if (!targetDir) {
      setErrorMessage("Target Directory wajib diisi.")
      return
    }

    try {
      setErrorMessage(null)
      setSuccessMessage(null)
      const res = await onboardNew({
        projectId: projId,
        targetDirectory: targetDir,
        blueprint: newBlueprint.trim() || "frontend-vite",
      })

      const msg = `Project baru '${projId}' berhasil dibuat dan didaftarkan.`
      setSuccessMessage(msg)
      toast.add({
        title: "Project Baru Berhasil Dibuat",
        description: msg,
        type: "success",
      })

      if (onSuccess) {
        onSuccess(res)
      }

      handleClose()
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Gagal membuat dan mendaftarkan project baru."
      setErrorMessage(msg)
      toast.add({
        title: "Gagal Membuat Project Baru",
        description: msg,
        type: "error",
      })
    }
  }

  const handleRestoreProject = async (projectId: string) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)
      await restoreProject(projectId)
      const msg = `Project '${projectId}' berhasil dikembalikan dan diaktifkan kembali.`
      setSuccessMessage(msg)
      toast.add({
        title: "Project Berhasil Dikembalikan",
        description: msg,
        type: "success",
      })
      handleClose()
    } catch (err: any) {
      const errorObj = err?.response?.data?.error
      const msg = typeof errorObj === "string" ? errorObj : errorObj?.message || err?.message || "Gagal me-restore project."
      setErrorMessage(msg)
      toast.add({
        title: "Gagal Restore Project",
        description: msg,
        type: "error",
      })
    }
  }

  const handlePurgeProject = async (projectId: string) => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)
      await purgeProject(projectId)
      const msg = `Arsip project '${projectId}' berhasil dibersihkan permanen dari Vault.`
      setSuccessMessage(msg)
      toast.add({
        title: "Arsip Dipurge Permanen",
        description: msg,
        type: "success",
      })
    } catch (err: any) {
      const errorObj = err?.response?.data?.error
      const msg = typeof errorObj === "string" ? errorObj : errorObj?.message || err?.message || "Gagal purge arsip project."
      setErrorMessage(msg)
      toast.add({
        title: "Gagal Purge Arsip",
        description: msg,
        type: "error",
      })
    }
  }

  return {
    activeTab,
    setActiveTab,
    existingRepoPath,
    setExistingRepoPath,
    existingProjectId,
    setExistingProjectId,
    newProjectId,
    setNewProjectId,
    newTargetDir,
    setNewTargetDir,
    newBlueprint,
    setNewBlueprint,
    archivedProjects,
    isLoadingArchived,
    isRestoring,
    isPurging,
    errorMessage,
    setErrorMessage,
    successMessage,
    setSuccessMessage,
    isSubmitting,
    isSubmittingExisting,
    isSubmittingNew,
    resetForm,
    handleClose,
    handleTabChange,
    handleExistingSubmit,
    handleNewSubmit,
    handleRestoreProject,
    handlePurgeProject,
  }
}

export default useAddProjectModal
