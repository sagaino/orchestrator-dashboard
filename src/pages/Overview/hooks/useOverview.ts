import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useDaemonStatus, useProjects, useRuns } from "@/hooks/use-orchestrator"
import type { UseOverviewReturn } from "../types/overview"

export const useOverview = (): UseOverviewReturn => {
  const navigate = useNavigate()
  const { data: daemon = null, isLoading: daemonLoading } = useDaemonStatus()
  const { data: projects = [], isLoading: projectsLoading } = useProjects()
  const { data: runs = [], isLoading: runsLoading } = useRuns()

  const [quickPrompt, setQuickPrompt] = useState("")
  const [selectedProject, setSelectedProject] = useState("orchestrator-dashboard")

  const loading = daemonLoading || projectsLoading || runsLoading

  const handleQuickSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!quickPrompt.trim() || !selectedProject) return
    const params = new URLSearchParams({ projectId: selectedProject, prompt: quickPrompt.trim() })
    navigate(`/tasks?${params.toString()}`)
  }

  const reviewRuns = runs.filter((r) => r.state === "REVIEW" || r.state === "RETROSPECTIVE")
  const activeRuns = runs.filter((r) => ["PENDING_APPROVAL", "APPROVED", "CLAIMING", "CLAIMED", "RUNNING", "EXECUTING", "VERIFYING", "SCOPE_AUDIT"].includes(r.state))
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
    reviewRuns,
    activeRuns,
    completedRuns,
    handleQuickSubmit,
    loadData: async () => {},
  }
}
