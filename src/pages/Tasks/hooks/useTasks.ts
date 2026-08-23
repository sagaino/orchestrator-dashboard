import { useEffect, useState, type FormEvent } from "react"
import { useSearchParams } from "react-router-dom"
import { useProjects, useDaemonStatus, useJobs, useRequestTask, useConfirmTaskQueue, useUploadAsset, useDeleteAsset, useCreateObjective, useApproveObjectivePlan, useRequestObjectivePlanChanges, useCancelObjective, useObjective, useProjectRelationships } from "@/hooks/use-orchestrator"
import { crossProjectEnabled } from "@/lib/feature-flags"
import { toast } from "@/components/ui/toast"
import type { AttachedAsset, ObjectiveDecision, ObjectiveIntakeResult, ObjectiveMode, ObjectivePlanReview, ObjectiveRecord, TaskRequestResult } from "@/services/orchestrator"
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

const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    const responseMessage = (error as any).response?.data?.error?.message
    if (typeof responseMessage === "string" && responseMessage.trim()) return responseMessage
  }
  return error instanceof Error ? error.message : String(error)
}

export const useTasks = (): UseTasksReturn => {
  const [searchParams] = useSearchParams()
  const reviewObjectiveId = searchParams.get("objectiveId")
  const { data: projects = [] } = useProjects()
  const [targetMode, setTargetMode] = useState<ObjectiveMode>("EXISTING_PROJECT")
  const [selectedProject, setSelectedProject] = useState("orchestrator-dashboard")
  const [linkedProjectIds, setLinkedProjectIds] = useState<string[]>([])
  const { data: relationshipData, isLoading: relationshipsLoading } = useProjectRelationships(selectedProject, crossProjectEnabled && targetMode === "CROSS_PROJECT_INCIDENT")
  const { data: objectiveDetail } = useObjective(reviewObjectiveId)
  const { data: daemon = null, refetch: refetchDaemon } = useDaemonStatus()
  const { data: jobs = [] } = useJobs()
  const { mutateAsync: requestTask, isPending: submitting } = useRequestTask()
  const { mutateAsync: createObjective, isPending: creatingObjective } = useCreateObjective()
  const { mutateAsync: approveObjectivePlan, isPending: approvingPlan } = useApproveObjectivePlan()
  const { mutateAsync: requestObjectivePlanChanges, isPending: requestingPlanChanges } = useRequestObjectivePlanChanges()
  const { mutateAsync: cancelObjective, isPending: cancellingObjective } = useCancelObjective()
  const { mutateAsync: confirmTaskQueue, isPending: confirming } = useConfirmTaskQueue()
  const { mutateAsync: uploadAsset, isPending: isUploadingAsset } = useUploadAsset()
  const { mutateAsync: deleteAsset } = useDeleteAsset()

  const [freshProjectId, setFreshProjectId] = useState("")
  const [freshTargetDirectory, setFreshTargetDirectory] = useState("")
  const [freshBlueprint, setFreshBlueprint] = useState("frontend-vite")
  const [prompt, setPrompt] = useState("")
  const [queueAfterConfirmation, setQueueAfterConfirmation] = useState(true)
  const [statusMessage, setStatusMessage] = useState<TaskStatusMessage | null>(null)
  const [attachedAssets, setAttachedAssets] = useState<AttachedAsset[]>([])
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<TaskRequestResult | null>(null)
  const [objectiveResult, setObjectiveResult] = useState<ObjectiveIntakeResult | null>(null)
  const [planReviewOpen, setPlanReviewOpen] = useState(false)
  const [planReviewObjective, setPlanReviewObjective] = useState<ObjectiveRecord | null>(null)
  const [planReview, setPlanReview] = useState<ObjectivePlanReview | null>(null)
  const [planReviewDecisions, setPlanReviewDecisions] = useState<ObjectiveDecision[]>([])

  useEffect(() => {
    if (projects.length > 0 && !projects.some((project) => project.id === selectedProject)) {
      setSelectedProject(projects[0].id)
    }
  }, [projects, selectedProject])

  useEffect(() => {
    const available = relationshipData?.relationships.map((relationship) => relationship.targetProjectId) ?? []
    setLinkedProjectIds((current) => current.filter((projectId) => available.includes(projectId)))
  }, [relationshipData, selectedProject])

  useEffect(() => {
    if (targetMode !== "CROSS_PROJECT_INCIDENT") setLinkedProjectIds([])
  }, [targetMode])

  useEffect(() => {
    if (!objectiveDetail?.plan) return
    setPlanReviewObjective(objectiveDetail)
    setPlanReview(objectiveDetail.plan)
    setPlanReviewDecisions(objectiveDetail.decisions ?? [])
    setPlanReviewOpen(true)
  }, [objectiveDetail])

  // Clarification state
  const [clarificationOpen, setClarificationOpen] = useState(false)
  const [clarificationQuestion, setClarificationQuestion] = useState("")
  const [clarificationAnswer, setClarificationAnswer] = useState("")
  const [pendingPrompt, setPendingPrompt] = useState("")

  const handleAddAsset = (asset: AttachedAsset) => {
    setAttachedAssets((prev) => [...prev, asset])
  }

  const handleRemoveAsset = async (index: number) => {
    const target = attachedAssets[index]
    setAttachedAssets((prev) => prev.filter((_, i) => i !== index))

    if (target) {
      try {
        await deleteAsset({
          type: target.type,
          relativeVaultPath: target.relativeVaultPath,
          relativeProjectPath: target.relativeProjectPath,
          projectId: selectedProject,
        })
      } catch (err) {
        console.warn("Gagal menghapus file fisik asset:", err)
      }
    }
  }

  const handleUploadFile = async (file: File, type: "MOCKUP" | "PROJECT_ASSET") => {
    try {
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
      })
      reader.readAsDataURL(file)
      const base64Data = await base64Promise

      const uploaded = await uploadAsset({
        fileName: file.name,
        base64Data,
        type,
        projectId: selectedProject,
      })

      handleAddAsset(uploaded)
      toast.add({
        title: "Asset Berhasil Diunggah",
        description: `${file.name} disimpan sebagai ${type === "MOCKUP" ? "UI Mockup Referensi" : "Asset Proyek"}.`,
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Mengunggah Asset",
        description: errorMessage,
        type: "error",
      })
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) return

    if (targetMode === "FRESH_PROJECT") {
      const trimmedProjectId = freshProjectId.trim()
      const trimmedTargetDirectory = freshTargetDirectory.trim()
      if (!trimmedProjectId || !trimmedTargetDirectory) {
        setStatusMessage({ type: "error", text: "Fresh Project ID dan absolute target path wajib diisi." })
        return
      }

      try {
        setStatusMessage(null)
        const result = await createObjective({
          mode: "FRESH_PROJECT",
          request: trimmedPrompt,
          projectIds: [trimmedProjectId],
          freshProject: {
            projectId: trimmedProjectId,
            targetDirectory: trimmedTargetDirectory,
            blueprint: freshBlueprint,
          },
        })
        setObjectiveResult(result)
        if (result.plan) {
          setPlanReviewObjective(result.objective)
          setPlanReview(result.plan)
          setPlanReviewDecisions(result.decisions ?? [])
          setPlanReviewOpen(true)
        }
        setPrompt("")
        setStatusMessage({
          type: "success",
          text: `Fresh Project objective ${result.objective.objectiveId} dibuat dan menunggu review genesis. Belum ada task atau queue yang dibuat.`,
        })
        toast.add({
          title: "Fresh Project Objective Dibuat",
          description: `Review genesis diperlukan sebelum repository dibuat.`,
          type: "success",
        })
      } catch (err: unknown) {
        const errorMessage = extractErrorMessage(err)
        setStatusMessage({ type: "error", text: `Gagal membuat Fresh Project objective: ${errorMessage}` })
        toast.add({ title: "Gagal Membuat Objective", description: errorMessage, type: "error" })
      }
      return
    }

    if (!selectedProject) return

    if (targetMode === "CROSS_PROJECT_INCIDENT") {
      if (!crossProjectEnabled) {
        setStatusMessage({ type: "error", text: "Linked Projects belum diaktifkan oleh ORCHESTRATOR_CROSS_PROJECT=1." })
        return
      }
      const allowedRelatedIds = new Set(relationshipData?.relationships.map((relationship) => relationship.targetProjectId) ?? [])
      const safeLinkedProjectIds = linkedProjectIds.filter((projectId) => allowedRelatedIds.has(projectId) && projectId !== selectedProject)
      if (safeLinkedProjectIds.length === 0) {
        setStatusMessage({ type: "error", text: "Pilih minimal satu Linked Project yang memiliki relationship eksplisit dengan primary project." })
        return
      }
      try {
        setStatusMessage(null)
        const result = await createObjective({
          mode: "CROSS_PROJECT_INCIDENT",
          request: trimmedPrompt,
          projectIds: [selectedProject, ...safeLinkedProjectIds],
        })
        setObjectiveResult(result)
        if (result.plan) {
          setPlanReviewObjective(result.objective)
          setPlanReview(result.plan)
          setPlanReviewDecisions(result.decisions ?? [])
          setPlanReviewOpen(true)
        }
        setPrompt("")
        setStatusMessage({ type: "success", text: `Linked Projects objective ${result.objective.objectiveId} dibuat untuk review planning.` })
        toast.add({ title: "Linked Projects Objective Dibuat", description: "Review relationship, contract checks, dan plan sebelum melanjutkan.", type: "success" })
      } catch (err: unknown) {
        const errorMessage = extractErrorMessage(err)
        setStatusMessage({ type: "error", text: `Gagal membuat Linked Projects objective: ${errorMessage}` })
        toast.add({ title: "Gagal Membuat Linked Projects Objective", description: errorMessage, type: "error" })
      }
      return
    }

    try {
      setStatusMessage(null)
      const res = await requestTask({
        project: selectedProject,
        request: trimmedPrompt,
        autoStart: false,
        attachedAssets,
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

      const successText = `Task canonical berhasil dibuat: ${res.task.id}. Menunggu review dan persetujuan Anda.`
      setConfirmationResult(res)
      setConfirmationOpen(true)
      setStatusMessage({
        type: "success",
        text: successText,
      })
      setPrompt("")
      setAttachedAssets([])
      setPendingPrompt("")
      refetchDaemon?.()
      toast.add({
        title: "Task Canonical Dibuat",
        description: successText,
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err)
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
        autoStart: false,
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

      const successText = `Task canonical berhasil dibuat: ${res.task.id}. Menunggu review dan persetujuan Anda.`
      setConfirmationResult(res)
      setConfirmationOpen(true)
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
      const errorMessage = extractErrorMessage(err)
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

  const handleCloseConfirmation = () => {
    if (confirming) return
    setConfirmationOpen(false)
    setStatusMessage({
      type: "success",
      text: confirmationResult
        ? `${confirmationResult.task.id} disimpan di Backlog dan belum dieksekusi.`
        : "Task disimpan di Backlog.",
    })
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
      setStatusMessage({ type: "success", text: `${confirmationResult.task.id} disetujui dan masuk antrean.` })
      refetchDaemon?.()
      toast.add({
        title: queued.action === "TASK_ALREADY_QUEUED" ? "Task Sudah Diantrekan" : "Task Disetujui",
        description: queued.nextAction,
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setStatusMessage({ type: "error", text: `Gagal mengantrekan task: ${errorMessage}` })
      toast.add({ title: "Approval Gagal", description: errorMessage, type: "error" })
    }
  }

  const handleClosePlanReview = () => {
    if (approvingPlan || requestingPlanChanges || cancellingObjective) return
    setPlanReviewOpen(false)
  }

  const handleApprovePlan = async () => {
    if (!planReviewObjective || !planReview) return
    try {
      const result = await approveObjectivePlan({ objectiveId: planReviewObjective.objectiveId, planFingerprint: planReview.planFingerprint })
      setPlanReviewObjective(result.objective)
      setPlanReview(result.plan)
      setStatusMessage({ type: "success", text: `${result.plan.planId} disetujui. Approval plan belum berarti final result acceptance atau queue execution.` })
      toast.add({ title: "Plan Disetujui", description: `${result.plan.planId} siap untuk tahap materialization berikutnya.`, type: "success" })
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err)
      setStatusMessage({ type: "error", text: `Approval plan gagal: ${errorMessage}` })
      toast.add({ title: "Approval Plan Gagal", description: errorMessage, type: "error" })
    }
  }

  const handleRequestPlanChanges = async (reason: string) => {
    if (!planReviewObjective) return
    try {
      const result = await requestObjectivePlanChanges({ objectiveId: planReviewObjective.objectiveId, reason })
      setPlanReviewObjective(result.objective)
      setPlanReview(result.plan)
      setStatusMessage({ type: "success", text: `${result.plan.planId} dibuat sebagai revision baru. Approval revision lama sudah tidak berlaku.` })
      toast.add({ title: "Plan Revision Dibuat", description: `${result.plan.planId} kembali ke planning untuk review ulang.`, type: "success" })
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err)
      setStatusMessage({ type: "error", text: `Request revision gagal: ${errorMessage}` })
      toast.add({ title: "Request Revision Gagal", description: errorMessage, type: "error" })
    }
  }

  const handleCancelObjective = async () => {
    if (!planReviewObjective) return
    try {
      const result = await cancelObjective(planReviewObjective.objectiveId)
      setPlanReviewObjective(result.objective)
      setPlanReview(result.plan)
      setPlanReviewOpen(false)
      setStatusMessage({ type: "success", text: `Objective ${result.objective.objectiveId} dibatalkan. Tidak ada task atau run yang dijalankan.` })
      toast.add({ title: "Objective Dibatalkan", description: "Plan aktif tidak lagi dapat dieksekusi.", type: "success" })
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err)
      setStatusMessage({ type: "error", text: `Cancel objective gagal: ${errorMessage}` })
      toast.add({ title: "Cancel Gagal", description: errorMessage, type: "error" })
    }
  }

  const queueJobs = daemon?.queue.latestJobs || jobs || []
  const submittingState = submitting || creatingObjective

  return {
    targetMode,
    setTargetMode,
    crossProjectEnabled,
    projects,
    daemon,
    jobs,
    queueJobs,
    selectedProject,
    setSelectedProject,
    projectRelationships: relationshipData?.relationships ?? [],
    linkedProjectIds,
    setLinkedProjectIds,
    relationshipsLoading,
    freshProjectId,
    setFreshProjectId,
    freshTargetDirectory,
    setFreshTargetDirectory,
    freshBlueprint,
    setFreshBlueprint,
    prompt,
    setPrompt,
    queueAfterConfirmation,
    setQueueAfterConfirmation,
    attachedAssets,
    handleAddAsset,
    handleRemoveAsset,
    isUploadingAsset,
    handleUploadFile,
    statusMessage,
    setStatusMessage,
    submitting: submittingState,
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
    confirmationOpen,
    confirmationResult,
    objectiveResult,
    confirming,
    handleCloseConfirmation,
    handleConfirmQueue,
    planReviewOpen,
    planReviewObjective,
    planReview,
    planReviewDecisions,
    planReviewActionLoading: approvingPlan || requestingPlanChanges || cancellingObjective,
    handleClosePlanReview,
    handleApprovePlan,
    handleRequestPlanChanges,
    handleCancelObjective,
  }
}
