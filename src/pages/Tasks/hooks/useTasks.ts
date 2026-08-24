import { useEffect, useRef, useState, type FormEvent } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useProjects, useDaemonStatus, useJobs, useUploadAsset, useDeleteAsset, useCreateObjective, useGenerateObjectivePlan, useApproveObjectivePlan, useMaterializeObjectivePlan, useAssignObjectivePlanSkills, useRequestObjectivePlanChanges, useCancelObjective, useObjective, useProjectRelationships, useSkillCatalog } from "@/hooks/use-orchestrator"
import { crossProjectEnabled } from "@/lib/feature-flags"
import { toast } from "@/components/ui/toast"
import type { AttachedAsset, ObjectiveDecision, ObjectiveIntakeResult, ObjectiveMode, ObjectivePlanReview, ObjectiveRecord, SkillCatalog } from "@/services/orchestrator"
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

const PENDING_OBJECTIVE_STORAGE_KEY = "orchestrator.pending-objective.v1"

interface PendingObjectiveDraft {
  objectiveId: string
  request: string
  mode: ObjectiveMode
}

function readPendingObjectiveDraft(): PendingObjectiveDraft | null {
  if (typeof window === "undefined") return null
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PENDING_OBJECTIVE_STORAGE_KEY) || "null")
    if (!parsed || typeof parsed.objectiveId !== "string" || typeof parsed.request !== "string") return null
    return parsed as PendingObjectiveDraft
  } catch {
    return null
  }
}

function savePendingObjectiveDraft(draft: PendingObjectiveDraft) {
  if (typeof window !== "undefined") window.localStorage.setItem(PENDING_OBJECTIVE_STORAGE_KEY, JSON.stringify(draft))
}

function clearPendingObjectiveDraft() {
  if (typeof window !== "undefined") window.localStorage.removeItem(PENDING_OBJECTIVE_STORAGE_KEY)
}

export const useTasks = (): UseTasksReturn => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reviewObjectiveId = searchParams.get("objectiveId")
  const intakeProjectId = searchParams.get("projectId")
  const intakePrompt = searchParams.get("prompt")
  const [storedPendingObjective] = useState(readPendingObjectiveDraft)
  const { data: projects = [] } = useProjects()
  const [targetMode, setTargetMode] = useState<ObjectiveMode>("EXISTING_PROJECT")
  const [selectedProject, setSelectedProject] = useState("orchestrator-dashboard")
  const [linkedProjectIds, setLinkedProjectIds] = useState<string[]>([])
  const { data: relationshipData, isLoading: relationshipsLoading } = useProjectRelationships(selectedProject, crossProjectEnabled && targetMode === "CROSS_PROJECT_INCIDENT")
  const { data: objectiveDetail } = useObjective(reviewObjectiveId || storedPendingObjective?.objectiveId || null)
  const { data: daemon = null, refetch: refetchDaemon } = useDaemonStatus()
  const { data: jobs = [] } = useJobs()
  const { mutateAsync: createObjective, isPending: creatingObjective } = useCreateObjective()
  const { mutateAsync: generateObjectivePlan, isPending: generatingPlan } = useGenerateObjectivePlan()
  const { mutateAsync: approveObjectivePlan, isPending: approvingPlan } = useApproveObjectivePlan()
  const { mutateAsync: materializeObjectivePlan, isPending: materializingPlan } = useMaterializeObjectivePlan()
  const { mutateAsync: assignObjectivePlanSkills, isPending: assigningPlanSkills } = useAssignObjectivePlanSkills()
  const { mutateAsync: requestObjectivePlanChanges, isPending: requestingPlanChanges } = useRequestObjectivePlanChanges()
  const { mutateAsync: cancelObjective, isPending: cancellingObjective } = useCancelObjective()
  const { mutateAsync: uploadAsset, isPending: isUploadingAsset } = useUploadAsset()
  const { mutateAsync: deleteAsset } = useDeleteAsset()
  const { data: skillCatalog } = useSkillCatalog()

  const [freshProjectId, setFreshProjectId] = useState("")
  const [freshTargetDirectory, setFreshTargetDirectory] = useState("")
  const [freshBlueprint, setFreshBlueprint] = useState("frontend-vite")
  const [prompt, setPrompt] = useState("")
  const [statusMessage, setStatusMessage] = useState<TaskStatusMessage | null>(null)
  const [attachedAssets, setAttachedAssets] = useState<AttachedAsset[]>([])
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
    const available = (relationshipData?.effectiveRelationships ?? relationshipData?.relationships ?? []).map((relationship) => relationship.targetProjectId)
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
  const [pendingPrompt, setPendingPrompt] = useState(storedPendingObjective?.request || "")
  const [pendingObjectiveId, setPendingObjectiveId] = useState<string | null>(storedPendingObjective?.objectiveId || null)
  const objectiveAttemptRef = useRef<{ fingerprint: string; key: string } | null>(null)

  const objectiveIdempotencyKey = (payload: Record<string, unknown>) => {
    const fingerprint = JSON.stringify(payload)
    if (!objectiveAttemptRef.current || objectiveAttemptRef.current.fingerprint !== fingerprint) {
      const randomPart = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
      objectiveAttemptRef.current = { fingerprint, key: `attempt-${randomPart}` }
    }
    return objectiveAttemptRef.current.key
  }

  const clearObjectiveAttempt = () => {
    objectiveAttemptRef.current = null
  }

  useEffect(() => {
    if (intakeProjectId) setSelectedProject(intakeProjectId)
    if (intakePrompt) setPrompt(intakePrompt)
  }, [intakeProjectId, intakePrompt])

  useEffect(() => {
    if (reviewObjectiveId || !storedPendingObjective || !objectiveDetail) return
    if (["CANCELLED", "DONE", "FAILED"].includes(objectiveDetail.state)) {
      clearPendingObjectiveDraft()
      setPendingObjectiveId(null)
      setPendingPrompt("")
      return
    }
    if (!["PLANNING", "NEEDS_CLARIFICATION"].includes(objectiveDetail.state)) return
    setTargetMode(objectiveDetail.mode as ObjectiveMode)
    setSelectedProject(objectiveDetail.projectIds[0] || "")
    setPrompt(objectiveDetail.request)
    setPendingPrompt(objectiveDetail.request)
    setPendingObjectiveId(objectiveDetail.objectiveId)
    setObjectiveResult({
      objective: objectiveDetail,
      summary: {},
      planning: { started: false, readOnly: true, tasksCreated: 0, jobsCreated: 0, runsCreated: 0 },
    })
    setStatusMessage({ type: "error", text: "Objective plan belum selesai. Lanjutkan dengan Retry Generate Plan." })
  }, [objectiveDetail, reviewObjectiveId, storedPendingObjective])

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
          idempotencyKey: objectiveIdempotencyKey({ mode: "FRESH_PROJECT", request: trimmedPrompt, projectIds: [trimmedProjectId], freshProject: { projectId: trimmedProjectId, targetDirectory: trimmedTargetDirectory, blueprint: freshBlueprint } }),
        })
        clearObjectiveAttempt()
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
      const allowedRelatedIds = new Set((relationshipData?.effectiveRelationships ?? relationshipData?.relationships ?? []).map((relationship) => relationship.targetProjectId))
      const safeLinkedProjectIds = linkedProjectIds.filter((projectId) => allowedRelatedIds.has(projectId) && projectId !== selectedProject)
      if (safeLinkedProjectIds.length === 0) {
        setStatusMessage({ type: "error", text: "Pilih minimal satu Linked Project yang memiliki relationship terdaftar dengan primary project." })
        return
      }
      try {
        setStatusMessage(null)
        const objective = await createObjective({
          mode: "CROSS_PROJECT_INCIDENT",
          request: trimmedPrompt,
          projectIds: [selectedProject, ...safeLinkedProjectIds],
          idempotencyKey: objectiveIdempotencyKey({ mode: "CROSS_PROJECT_INCIDENT", request: trimmedPrompt, projectIds: [selectedProject, ...safeLinkedProjectIds] }),
        })
        clearObjectiveAttempt()
        setObjectiveResult(objective)
        setPendingObjectiveId(objective.objective.objectiveId)
        setPendingPrompt(trimmedPrompt)
        savePendingObjectiveDraft({ objectiveId: objective.objective.objectiveId, request: trimmedPrompt, mode: "CROSS_PROJECT_INCIDENT" })
        const res = await generateObjectivePlan({ objectiveId: objective.objective.objectiveId })

        if (isClarificationNeeded(res)) {
          const questionText = extractClarificationQuestion(res)
          setClarificationQuestion(questionText)
          setClarificationAnswer("")
          setClarificationOpen(true)
          toast.add({ title: "Klarifikasi Lintas Project Diperlukan", description: questionText, type: "warning" })
          return
        }

        if (!res.plan) throw new Error("Diagnostic planner tidak menghasilkan plan review.")
        setPlanReviewObjective(res.objective)
        setPlanReview(res.plan)
        setPlanReviewDecisions(res.decisions ?? [])
        setPlanReviewOpen(true)
        setPrompt("")
        setPendingPrompt("")
        setPendingObjectiveId(null)
        clearPendingObjectiveDraft()
        const successText = `Linked Projects objective ${res.objective.objectiveId} dan ${res.plan.planId} siap untuk review.`
        setStatusMessage({ type: "success", text: successText })
        toast.add({ title: "Linked Projects Plan Siap Direview", description: "Review diagnostic evidence, relationship, contract checks, dan plan sebelum melanjutkan.", type: "success" })
      } catch (err: unknown) {
        const errorMessage = extractErrorMessage(err)
        setStatusMessage({ type: "error", text: `Gagal membuat Linked Projects objective: ${errorMessage}` })
        toast.add({ title: "Gagal Membuat Linked Projects Objective", description: errorMessage, type: "error" })
      }
      return
    }

    try {
      setStatusMessage(null)
      const retryObjectiveId = pendingObjectiveId
        && pendingPrompt === trimmedPrompt
        && objectiveResult?.objective.projectIds[0] === selectedProject
        && objectiveResult.objective.state === "PLANNING"
        ? pendingObjectiveId
        : null
      const objective = retryObjectiveId && objectiveResult ? objectiveResult : await createObjective({
        mode: "EXISTING_PROJECT",
        request: trimmedPrompt,
        projectIds: [selectedProject],
        attachments: attachedAssets,
        idempotencyKey: objectiveIdempotencyKey({ mode: "EXISTING_PROJECT", request: trimmedPrompt, projectIds: [selectedProject], attachments: attachedAssets }),
      })
      if (!retryObjectiveId) clearObjectiveAttempt()
      setObjectiveResult(objective)
      setPendingObjectiveId(objective.objective.objectiveId)
      setPendingPrompt(trimmedPrompt)
      savePendingObjectiveDraft({ objectiveId: objective.objective.objectiveId, request: trimmedPrompt, mode: "EXISTING_PROJECT" })
      const res = await generateObjectivePlan({ objectiveId: objective.objective.objectiveId })

      if (isClarificationNeeded(res)) {
        const questionText = extractClarificationQuestion(res)
        setClarificationQuestion(questionText)
        setClarificationAnswer("")
        setPendingPrompt(trimmedPrompt)
        setPendingObjectiveId(objective.objective.objectiveId)
        setClarificationOpen(true)

        toast.add({
          title: "Klarifikasi Diperlukan",
          description: questionText,
          type: "warning",
        })
        return
      }

      if (!res.plan) throw new Error("Planner tidak menghasilkan plan review.")
      const successText = `Objective ${res.objective.objectiveId} dan ${res.plan.planId} siap untuk review.`
      setPlanReviewObjective(res.objective)
      setPlanReview(res.plan)
      setPlanReviewDecisions(res.decisions ?? [])
      setPlanReviewOpen(true)
      setStatusMessage({ type: "success", text: successText })
      setPrompt("")
      setAttachedAssets([])
      setPendingPrompt("")
      setPendingObjectiveId(null)
      clearPendingObjectiveDraft()
      clearObjectiveAttempt()
      toast.add({
        title: "Plan Objective Siap Direview",
        description: successText,
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err)
      const errorText = `Gagal membuat objective plan: ${errorMessage}`
      setStatusMessage({
        type: "error",
        text: errorText,
      })
      toast.add({
        title: "Gagal Membuat Objective Plan",
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

    if (!pendingObjectiveId) return

    try {
      setStatusMessage(null)
      const res = await generateObjectivePlan({ objectiveId: pendingObjectiveId, clarification: trimmedAnswer })

      if (isClarificationNeeded(res)) {
        const nextQuestion = extractClarificationQuestion(res)
        setClarificationQuestion(nextQuestion)
        setClarificationAnswer("")
        setPendingPrompt(`${pendingPrompt}\n\n[Klarifikasi Tambahan]:\n${trimmedAnswer}`)
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
      if (!res.plan) throw new Error("Planner tidak menghasilkan plan review setelah klarifikasi.")
      setPrompt("")
      setPendingPrompt("")
      setPendingObjectiveId(null)
      clearPendingObjectiveDraft()
      clearObjectiveAttempt()
      setPlanReviewObjective(res.objective)
      setPlanReview(res.plan)
      setPlanReviewDecisions(res.decisions ?? [])
      setPlanReviewOpen(true)
      const successText = `${res.plan.planId} siap untuk review.`
      setStatusMessage({ type: "success", text: successText })
      toast.add({
        title: "Plan Objective Siap Direview",
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

  const handleRetryPlan = async () => {
    if (!pendingObjectiveId) return
    try {
      setStatusMessage(null)
      const res = await generateObjectivePlan({ objectiveId: pendingObjectiveId })
      if (isClarificationNeeded(res)) {
        const questionText = extractClarificationQuestion(res)
        setClarificationQuestion(questionText)
        setClarificationAnswer("")
        setClarificationOpen(true)
        setStatusMessage({ type: "error", text: "Klarifikasi diperlukan sebelum plan dapat dibuat." })
        return
      }
      if (!res.plan) throw new Error("Planner tidak menghasilkan plan review.")
      setPlanReviewObjective(res.objective)
      setPlanReview(res.plan)
      setPlanReviewDecisions(res.decisions ?? [])
      setPlanReviewOpen(true)
      setPrompt("")
      setPendingPrompt("")
      setPendingObjectiveId(null)
      clearPendingObjectiveDraft()
      clearObjectiveAttempt()
      setStatusMessage({ type: "success", text: `Objective ${res.objective.objectiveId} dan ${res.plan.planId} siap untuk review.` })
      toast.add({ title: "Plan Objective Siap Direview", description: "Retry berhasil melanjutkan objective yang sama.", type: "success" })
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err)
      setStatusMessage({ type: "error", text: `Retry objective plan gagal: ${errorMessage}` })
      toast.add({ title: "Retry Plan Gagal", description: errorMessage, type: "error" })
    }
  }

  const handleClosePlanReview = () => {
    if (approvingPlan || requestingPlanChanges || cancellingObjective) return
    setPlanReviewOpen(false)
  }

  const handleApprovePlan = async () => {
    if (!planReviewObjective || !planReview) return
    try {
      const approved = planReview.state === "APPROVED"
        ? { objective: planReviewObjective, plan: planReview, planFingerprint: planReview.planFingerprint }
        : await approveObjectivePlan({ objectiveId: planReviewObjective.objectiveId, planFingerprint: planReview.planFingerprint })
      if (!approved.planFingerprint) throw new Error("Plan fingerprint tidak tersedia untuk materialization.")
      const materialized = await materializeObjectivePlan({ objectiveId: approved.objective.objectiveId, planId: approved.plan.planId, planFingerprint: approved.planFingerprint })
      setPlanReviewOpen(false)
      setStatusMessage({ type: "success", text: `${materialized.tasks.length} task dari ${approved.plan.planId} dibuat dan orchestration ${materialized.orchestration.orchestrationId} dimulai.` })
      refetchDaemon?.()
      toast.add({ title: "Objective Mulai Dijalankan", description: `${materialized.tasks.length} task berhasil dimaterialisasi.`, type: "success" })
      navigate(`/objectives/${approved.objective.objectiveId}`)
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

  const handleAssignPlanSkills = async (assignments: Array<{ nodeId: string; skillId: string; version: string; checksum?: string }>) => {
    if (!planReviewObjective) return
    try {
      const result = await assignObjectivePlanSkills({ objectiveId: planReviewObjective.objectiveId, assignments })
      setPlanReviewObjective(result.objective)
      setPlanReview(result.plan)
      setPlanReviewDecisions((current) => [...current, result.decision])
      setStatusMessage({ type: "success", text: `${result.plan.planId} dibuat dengan skill assignment terverifikasi. Approval revision lama sudah tidak berlaku.` })
      toast.add({ title: "Skill Assigned", description: `${assignments.length} node memiliki skill manual pada revision baru.`, type: "success" })
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err)
      setStatusMessage({ type: "error", text: `Skill assignment gagal: ${errorMessage}` })
      toast.add({ title: "Skill Assignment Gagal", description: errorMessage, type: "error" })
      throw err
    }
  }

  const handleCancelObjective = async () => {
    if (!planReviewObjective) return
    try {
      const result = await cancelObjective(planReviewObjective.objectiveId)
      setPlanReviewObjective(result.objective)
      setPlanReview(result.plan)
      setPlanReviewOpen(false)
      setPendingPrompt("")
      setPendingObjectiveId(null)
      clearPendingObjectiveDraft()
      clearObjectiveAttempt()
      setStatusMessage({ type: "success", text: `Objective ${result.objective.objectiveId} dibatalkan. Tidak ada task atau run yang dijalankan.` })
      toast.add({ title: "Objective Dibatalkan", description: "Plan aktif tidak lagi dapat dieksekusi.", type: "success" })
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err)
      setStatusMessage({ type: "error", text: `Cancel objective gagal: ${errorMessage}` })
      toast.add({ title: "Cancel Gagal", description: errorMessage, type: "error" })
    }
  }

  const queueJobs = daemon?.queue.latestJobs || jobs || []
  const submittingState = creatingObjective || generatingPlan

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
    projectRelationships: relationshipData?.effectiveRelationships ?? relationshipData?.relationships ?? [],
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
    attachedAssets,
    handleAddAsset,
    handleRemoveAsset,
    isUploadingAsset,
    handleUploadFile,
    statusMessage,
    setStatusMessage,
    submitting: submittingState,
    handleSubmit,
    handleRetryPlan,
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
    objectiveResult,
    planReviewOpen,
    planReviewObjective,
    planReview,
    planReviewDecisions,
    planReviewActionLoading: approvingPlan || materializingPlan || assigningPlanSkills || requestingPlanChanges || cancellingObjective,
    skillCatalog: skillCatalog ?? { schemaVersion: 1, mode: "read-only-skill-catalog", registryState: "EMPTY", skills: [] } as SkillCatalog,
    handleAssignPlanSkills,
    handleClosePlanReview,
    handleApprovePlan,
    handleRequestPlanChanges,
    handleCancelObjective,
  }
}
