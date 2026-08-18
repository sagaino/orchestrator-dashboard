import { useState } from "react"
import {
  useOnboardExistingProject,
  useOnboardNewProject,
} from "@/hooks/use-orchestrator"
import { toast } from "@/components/ui/toast"

export type AddProjectTab = "existing" | "new"

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

  const {
    mutateAsync: onboardExisting,
    isPending: isSubmittingExisting,
  } = useOnboardExistingProject()

  const {
    mutateAsync: onboardNew,
    isPending: isSubmittingNew,
  } = useOnboardNewProject()

  const isSubmitting = isSubmittingExisting || isSubmittingNew

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

      setTimeout(() => {
        handleClose()
      }, 1000)
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

      setTimeout(() => {
        handleClose()
      }, 1000)
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
  }
}

export default useAddProjectModal
