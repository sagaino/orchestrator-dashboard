import { useState, type FormEvent } from "react"
import { useProjects, useDaemonStatus, useJobs, useRequestTask } from "@/hooks/use-orchestrator"
import { toast } from "@/components/ui/toast"
import type { UseTasksReturn, TaskStatusMessage } from "../types"

export const useTasks = (): UseTasksReturn => {
  const { data: projects = [] } = useProjects()
  const { data: daemon = null, refetch: refetchDaemon } = useDaemonStatus()
  const { data: jobs = [] } = useJobs()
  const { mutateAsync: requestTask, isPending: submitting } = useRequestTask()

  const [selectedProject, setSelectedProject] = useState("orchestrator-dashboard")
  const [prompt, setPrompt] = useState("")
  const [autoStart, setAutoStart] = useState(true)
  const [statusMessage, setStatusMessage] = useState<TaskStatusMessage | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || !selectedProject) return
    try {
      setStatusMessage(null)
      const res = await requestTask({
        project: selectedProject,
        request: prompt.trim(),
        autoStart,
      })
      const successText = `Task canonical berhasil dibuat: ${res.task?.id || "Task"} (${res.autoStart ? "Otomatis diantrekan" : "Tersimpan di Backlog"}).`
      setStatusMessage({
        type: "success",
        text: successText,
      })
      setPrompt("")
      toast.add({
        title: "Task Canonical Dibuat",
        description: successText,
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      const errorText = `Gagal membuat task: ${errorMessage}`
      setStatusMessage({
        type: "error",
        text: errorText,
      })
      toast.add({
        title: "Gagal Membuat Task",
        description: errorMessage,
        type: "error",
      })
    }
  }

  const queueJobs = daemon?.queue.latestJobs || jobs || []

  return {
    projects,
    daemon,
    jobs,
    queueJobs,
    selectedProject,
    setSelectedProject,
    prompt,
    setPrompt,
    autoStart,
    setAutoStart,
    statusMessage,
    setStatusMessage,
    submitting,
    handleSubmit,
    refetchDaemon,
  }
}

