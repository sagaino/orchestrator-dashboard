import { useState, type FormEvent } from "react"
import { useDaemonStatus, useProjects, useRuns, useRequestTask, useConfirmTaskQueue } from "@/hooks/use-orchestrator"
import { toast } from "@/components/ui/toast"
import type { TaskRequestResult } from "@/services/orchestrator"
import type { UseOverviewReturn } from "../types/overview"

export const useOverview = (): UseOverviewReturn => {
  const { data: daemon = null, isLoading: daemonLoading } = useDaemonStatus()
  const { data: projects = [], isLoading: projectsLoading } = useProjects()
  const { data: runs = [], isLoading: runsLoading } = useRuns()
  
  const { mutateAsync: requestTask, isPending: submitting } = useRequestTask()
  const { mutateAsync: confirmTaskQueue, isPending: confirming } = useConfirmTaskQueue()

  const [quickPrompt, setQuickPrompt] = useState("")
  const [selectedProject, setSelectedProject] = useState("orchestrator-dashboard")
  const [quickSuccess, setQuickSuccess] = useState<string | null>(null)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<TaskRequestResult | null>(null)

  const loading = daemonLoading || projectsLoading || runsLoading

  const handleQuickSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!quickPrompt.trim() || !selectedProject) return
    try {
      setQuickSuccess(null)
      const res = await requestTask({
        project: selectedProject,
        request: quickPrompt.trim(),
        autoStart: false,
      })
      const successMsg = `Task ${res.task.id} dibuat di Backlog. Review plan sebelum mengantrekan.`
      setQuickSuccess(successMsg)
      setConfirmationResult(res)
      setConfirmationOpen(true)
      setQuickPrompt("")
      toast.add({
        title: "Canonical Plan Siap",
        description: successMsg,
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Mengirim Task",
        description: errorMessage,
        type: "error",
      })
    }
  }

  const handleCloseConfirmation = () => {
    if (confirming) return
    setConfirmationOpen(false)
    if (confirmationResult) setQuickSuccess(`Task ${confirmationResult.task.id} tetap tersimpan di Backlog.`)
  }

  const handleConfirmQueue = async () => {
    if (!confirmationResult) return
    try {
      const queued = await confirmTaskQueue({
        projectId: confirmationResult.project,
        taskInput: confirmationResult.task.id,
        approvedBy: "user",
      })
      setConfirmationOpen(false)
      setQuickSuccess(`Task ${confirmationResult.task.id} disetujui dan masuk antrean.`)
      toast.add({ title: "Task Disetujui", description: queued.nextAction, type: "success" })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({ title: "Approval Gagal", description: errorMessage, type: "error" })
    }
  }

  const reviewRuns = runs.filter((r) => r.state === "REVIEW")
  const activeRuns = runs.filter((r) => ["CLAIMED", "EXECUTING", "VERIFYING", "SCOPE_AUDIT"].includes(r.state))
  const completedRuns = runs.filter((r) => r.state === "DONE")

  return {
    daemon,
    projects,
    runs,
    loading,
    quickPrompt,
    setQuickPrompt,
    selectedProject,
    setSelectedProject,
    submitting,
    quickSuccess,
    reviewRuns,
    activeRuns,
    completedRuns,
    handleQuickSubmit,
    confirmationOpen,
    confirmationResult,
    confirming,
    handleCloseConfirmation,
    handleConfirmQueue,
    loadData: async () => {},
  }
}
