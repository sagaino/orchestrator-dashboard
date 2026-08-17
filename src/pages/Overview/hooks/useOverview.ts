import { useState, type FormEvent } from "react"
import { useDaemonStatus, useProjects, useRuns, useRequestTask } from "@/hooks/use-orchestrator"
import type { UseOverviewReturn } from "../types/overview"

export const useOverview = (): UseOverviewReturn => {
  const { data: daemon = null, isLoading: daemonLoading } = useDaemonStatus()
  const { data: projects = [], isLoading: projectsLoading } = useProjects()
  const { data: runs = [], isLoading: runsLoading } = useRuns()
  
  const { mutateAsync: requestTask, isPending: submitting } = useRequestTask()

  const [quickPrompt, setQuickPrompt] = useState("")
  const [selectedProject, setSelectedProject] = useState("orchestrator-dashboard")
  const [quickSuccess, setQuickSuccess] = useState<string | null>(null)

  const loading = daemonLoading || projectsLoading || runsLoading

  const handleQuickSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!quickPrompt.trim() || !selectedProject) return
    try {
      setQuickSuccess(null)
      const res = await requestTask({
        project: selectedProject,
        request: quickPrompt.trim(),
        autoStart: true,
      })
      setQuickSuccess(`Task ${res.task?.id || "baru"} berhasil dibuat dan dimasukkan ke antrean!`)
      setQuickPrompt("")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      alert(`Gagal mengirim task: ${errorMessage}`)
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
    loadData: async () => {},
  }
}
