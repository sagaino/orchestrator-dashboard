import { useEffect, useState, type FormEvent } from "react"
import { OrchestratorApi, type DaemonStatus, type ProjectInfo, type RunManifest } from "@/services/orchestrator"
import type { UseOverviewReturn } from "../types/overview"

export const useOverview = (): UseOverviewReturn => {
  const [daemon, setDaemon] = useState<DaemonStatus | null>(null)
  const [projects, setProjects] = useState<ProjectInfo[]>([])
  const [runs, setRuns] = useState<RunManifest[]>([])
  const [loading, setLoading] = useState(true)
  const [quickPrompt, setQuickPrompt] = useState("")
  const [selectedProject, setSelectedProject] = useState("orchestrator-dashboard")
  const [submitting, setSubmitting] = useState(false)
  const [quickSuccess, setQuickSuccess] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [daemonData, projectsData, runsData] = await Promise.all([
        OrchestratorApi.getDaemonStatus(),
        OrchestratorApi.getProjects(),
        OrchestratorApi.getRuns(),
      ])
      setDaemon(daemonData)
      setProjects(projectsData)
      setRuns(runsData)
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0].id)
      }
    } catch (err) {
      console.error("Failed to load overview data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleQuickSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!quickPrompt.trim() || !selectedProject) return
    try {
      setSubmitting(true)
      setQuickSuccess(null)
      const res = await OrchestratorApi.requestTask({
        project: selectedProject,
        request: quickPrompt.trim(),
        autoStart: true,
      })
      setQuickSuccess(`Task ${res.task?.id || "baru"} berhasil dibuat dan dimasukkan ke antrean!`)
      setQuickPrompt("")
      loadData()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      alert(`Gagal mengirim task: ${errorMessage}`)
    } finally {
      setSubmitting(false)
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
    loadData,
  }
}
