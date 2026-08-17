import { useState, type FormEvent } from "react"
import { useProjects, useDaemonStatus, useJobs, useRequestTask } from "@/hooks/use-orchestrator"
import { toast } from "@/components/ui/toast"
import type { UseTasksReturn, TaskStatusMessage } from "../types"

const isClarificationNeeded = (res: any): boolean => {
  if (!res) return false
  if (
    res.status === "NEEDS_CLARIFICATION" ||
    res.state === "NEEDS_CLARIFICATION" ||
    res.verdict === "NEEDS_CLARIFICATION" ||
    res.needsClarification === true ||
    res.clarificationNeeded === true ||
    res.status === "CLARIFICATION" ||
    res.state === "CLARIFICATION"
  ) {
    return true
  }
  return false
}

const extractClarificationQuestion = (res: any): string => {
  if (!res) return "AI memerlukan klarifikasi tambahan sebelum task dapat dibuat."
  return (
    res.question ||
    res.clarification ||
    res.clarificationQuestion ||
    res.feedback ||
    res.readinessGateFeedback ||
    res.message ||
    "AI memerlukan klarifikasi tambahan untuk memvalidasi readiness gate task."
  )
}

export const useTasks = (): UseTasksReturn => {
  const { data: projects = [] } = useProjects()
  const { data: daemon = null, refetch: refetchDaemon } = useDaemonStatus()
  const { data: jobs = [] } = useJobs()
  const { mutateAsync: requestTask, isPending: submitting } = useRequestTask()

  const [selectedProject, setSelectedProject] = useState("orchestrator-dashboard")
  const [prompt, setPrompt] = useState("")
  const [autoStart, setAutoStart] = useState(true)
  const [statusMessage, setStatusMessage] = useState<TaskStatusMessage | null>(null)

  // Clarification state
  const [clarificationOpen, setClarificationOpen] = useState(false)
  const [clarificationQuestion, setClarificationQuestion] = useState("")
  const [clarificationAnswer, setClarificationAnswer] = useState("")
  const [pendingPrompt, setPendingPrompt] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt || !selectedProject) return

    try {
      setStatusMessage(null)
      const res = await requestTask({
        project: selectedProject,
        request: trimmedPrompt,
        autoStart,
      })

      if (isClarificationNeeded(res)) {
        const questionText = extractClarificationQuestion(res)
        setClarificationQuestion(questionText)
        setClarificationAnswer("")
        setPendingPrompt(trimmedPrompt)
        setClarificationOpen(true)

        toast.add({
          title: "Klarifikasi Diperlukan",
          description: questionText,
          type: "warning",
        })
        return
      }

      const successText = `Task canonical berhasil dibuat: ${res?.task?.id || "Task"} (${res?.autoStart ? "Otomatis diantrekan" : "Tersimpan di Backlog"}).`
      setStatusMessage({
        type: "success",
        text: successText,
      })
      setPrompt("")
      setPendingPrompt("")
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

  const handleCloseClarification = () => {
    setClarificationOpen(false)
  }

  const handleSubmitClarification = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedAnswer = clarificationAnswer.trim()
    if (!trimmedAnswer || !selectedProject) return

    const basePrompt = pendingPrompt.trim() || prompt.trim()
    const combinedRequest = `${basePrompt}\n\n[Klarifikasi Tambahan]:\n${trimmedAnswer}`

    try {
      setStatusMessage(null)
      const res = await requestTask({
        project: selectedProject,
        request: combinedRequest,
        autoStart,
      })

      if (isClarificationNeeded(res)) {
        const nextQuestion = extractClarificationQuestion(res)
        setClarificationQuestion(nextQuestion)
        setClarificationAnswer("")
        setPendingPrompt(combinedRequest)
        setClarificationOpen(true)

        toast.add({
          title: "Klarifikasi Diperlukan",
          description: nextQuestion,
          type: "warning",
        })
        return
      }

      setClarificationOpen(false)
      setClarificationAnswer("")
      setClarificationQuestion("")
      setPrompt("")
      setPendingPrompt("")

      const successText = `Task canonical berhasil dibuat: ${res?.task?.id || "Task"} (${res?.autoStart ? "Otomatis diantrekan" : "Tersimpan di Backlog"}).`
      setStatusMessage({
        type: "success",
        text: successText,
      })
      toast.add({
        title: "Task Canonical Dibuat",
        description: successText,
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      const errorText = `Gagal mengirim klarifikasi: ${errorMessage}`
      setStatusMessage({
        type: "error",
        text: errorText,
      })
      toast.add({
        title: "Gagal Mengirim Klarifikasi",
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
    clarificationOpen,
    setClarificationOpen,
    clarificationQuestion,
    setClarificationQuestion,
    clarificationAnswer,
    setClarificationAnswer,
    handleCloseClarification,
    handleSubmitClarification,
    pendingPrompt,
  }
}
