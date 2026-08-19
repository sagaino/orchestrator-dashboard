import { useState, useEffect, type FormEvent } from "react"
import type { RunManifest } from "@/services/orchestrator"
import { 
  useRuns, 
  useRunDiff, 
  useAcceptRun, 
  useRejectRun, 
  useRequestChanges, 
  useStartRun,
  usePreviewRun,
  useRecoverRun,
  useRetryRun
} from "@/hooks/use-orchestrator"
import { toast } from "@/components/ui/toast"
import type { UseRunsPageReturn, RunFilterState, RunTabType, InlineComment } from "../types"

export const useRunsPage = (): UseRunsPageReturn => {
  const { data: runs = [], isLoading: runsLoading, refetch: refetchRuns } = useRuns()
  
  const [filterState, setFilterState] = useState<RunFilterState>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRun, setSelectedRun] = useState<RunManifest | null>(null)
  const [activeTab, setActiveTab] = useState<RunTabType>("OVERVIEW")
  const [revisionModalOpen, setRevisionModalOpen] = useState(false)
  const [revisionReason, setRevisionReason] = useState("")
  const [inlineComments, setInlineComments] = useState<InlineComment[]>([])
  const [acceptModalOpen, setAcceptModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("Rejected by user")

  const { data: diffData, isLoading: diffLoading } = useRunDiff(
    (selectedRun && (activeTab === "DIFF" || activeTab === "QA")) ? selectedRun.runId : null
  )

  const { mutateAsync: acceptRun, isPending: acceptPending } = useAcceptRun()
  const { mutateAsync: rejectRun, isPending: rejectPending } = useRejectRun()
  const { mutateAsync: requestChanges, isPending: changesPending } = useRequestChanges()
  const { mutateAsync: startRun, isPending: startPending } = useStartRun()
  const { mutateAsync: previewRun, isPending: previewPending } = usePreviewRun()
  const { mutateAsync: recoverRun, isPending: recoverPending } = useRecoverRun()
  const { mutateAsync: retryRun, isPending: retryPending } = useRetryRun()

  const actionLoading = acceptPending || rejectPending || changesPending || startPending || previewPending || recoverPending || retryPending

  // Keep selectedRun in sync if runs change
  useEffect(() => {
    if (!selectedRun && runs.length > 0) {
      setSelectedRun(runs[0])
    } else if (selectedRun && runs.length > 0) {
      const updated = runs.find((r) => r.runId === selectedRun.runId)
      if (updated && updated !== selectedRun) {
        setSelectedRun(updated)
      }
    }
  }, [runs, selectedRun])

  // Reset inline comments when active run changes
  useEffect(() => {
    setInlineComments([])
  }, [selectedRun?.runId])

  const filteredRuns = runs.filter((r) => {
    if ((r.state as string) === "SUPERSEDED") return false

    const matchesFilter =
      filterState === "ALL" ||
      (filterState === "REVIEW" && (r.state === "REVIEW" || r.state === "RETROSPECTIVE")) ||
      (filterState === "ACTIVE" && ["PENDING_APPROVAL", "APPROVED", "CLAIMING", "CLAIMED", "RUNNING", "EXECUTING", "VERIFYING", "SCOPE_AUDIT"].includes(r.state)) ||
      (filterState === "DONE" && r.state === "DONE") ||
      (filterState === "FAILED" && r.state === "FAILED")

    const matchesSearch =
      r.task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.project.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.runId.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  // Review Actions
  const handleStart = async (runId: string) => {
    try {
      await startRun({ runId })
      toast.add({
        title: "Run Approved",
        description: "Run berhasil di-approve dan mulai dieksekusi!",
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Menjalankan Run",
        description: errorMessage,
        type: "error",
      })
    }
  }

  const handlePreview = async (runId: string) => {
    try {
      const res = await previewRun(runId)
      toast.add({
        title: "Workspace VS Code Dibuka",
        description: res?.workspacePath || "Berhasil dibuka di VS Code.",
        type: "info",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Preview",
        description: errorMessage,
        type: "error",
      })
    }
  }

  const handleOpenAcceptModal = () => {
    setAcceptModalOpen(true)
  }

  const handleConfirmAccept = async (options?: { autoCommit?: boolean; commitMessage?: string }) => {
    if (!selectedRun) return
    try {
      await acceptRun({
        runId: selectedRun.runId,
        approvedBy: "user",
        autoCommit: options?.autoCommit,
        commitMessage: options?.commitMessage,
      })
      setAcceptModalOpen(false)
      toast.add({
        title: "Run Accepted",
        description: options?.autoCommit
          ? "Run berhasil di-accept, di-commit ke Git, dan disinkronkan ke Wiki!"
          : "Run berhasil di-accept dan disinkronkan ke branch utama & Wiki!",
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Accept",
        description: errorMessage,
        type: "error",
      })
    }
  }

  const handleOpenRejectModal = () => {
    setRejectReason("Rejected by user")
    setRejectModalOpen(true)
  }

  const handleConfirmReject = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedRun) return
    try {
      await rejectRun({ runId: selectedRun.runId, reason: rejectReason.trim() || "Rejected by user" })
      setRejectModalOpen(false)
      toast.add({
        title: "Run Ditolak",
        description: "Run berhasil ditolak dan worktree dibersihkan.",
        type: "info",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Reject",
        description: errorMessage,
        type: "error",
      })
    }
  }

  const handleOpenRevisionModal = () => {
    setRevisionModalOpen(true)
  }

  const handleAccept = (runId: string) => {
    const target = runs.find((r) => r.runId === runId)
    if (target) setSelectedRun(target)
    setAcceptModalOpen(true)
  }

  const handleReject = (runId: string) => {
    const target = runs.find((r) => r.runId === runId)
    if (target) setSelectedRun(target)
    setRejectReason("Rejected by user")
    setRejectModalOpen(true)
  }

  const handleAddInlineComment = (comment: { file: string; line: number; comment: string }) => {
    setInlineComments((prev) => [
      ...prev,
      {
        ...comment,
        id: `${comment.file}:${comment.line}:${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
    ])
    toast.add({
      title: "Catatan Ditambahkan",
      description: `Catatan disimpan untuk ${comment.file} baris ${comment.line}.`,
      type: "info",
    })
  }

  const handleRemoveInlineComment = (index: number) => {
    setInlineComments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRequestChangesSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedRun || !revisionReason.trim()) return
    try {
      await requestChanges({
        runId: selectedRun.runId,
        reason: revisionReason.trim(),
        inlineComments: inlineComments.map(({ file, line, comment }) => ({ file, line, comment })),
      })
      setRevisionModalOpen(false)
      setRevisionReason("")
      setInlineComments([])
      toast.add({
        title: "Revisi Terkirim",
        description: "Revisi berhasil dikirim ke agent di worktree terisolasi!",
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Mengirim Revisi",
        description: errorMessage,
        type: "error",
      })
    }
  }

  const handleRecover = async (runId: string) => {
    try {
      await recoverRun(runId)
      toast.add({
        title: "Recovery Dijalankan",
        description: "Recovery berhasil dijalankan!",
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Recover",
        description: errorMessage,
        type: "error",
      })
    }
  }

  const handleRetry = async (runId: string) => {
    try {
      await retryRun(runId)
      toast.add({
        title: "Task Diantrekan Ulang",
        description: "Task berhasil didaftarkan ulang ke antrean!",
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Retry",
        description: errorMessage,
        type: "error",
      })
    }
  }

  return {
    runs,
    runsLoading,
    refetchRuns,
    filterState,
    setFilterState,
    searchQuery,
    setSearchQuery,
    selectedRun,
    setSelectedRun,
    activeTab,
    setActiveTab,
    revisionModalOpen,
    setRevisionModalOpen,
    revisionReason,
    setRevisionReason,
    inlineComments,
    setInlineComments,
    handleAddInlineComment,
    handleRemoveInlineComment,
    acceptModalOpen,
    setAcceptModalOpen,
    rejectModalOpen,
    setRejectModalOpen,
    rejectReason,
    setRejectReason,
    diffData,
    diffLoading,
    actionLoading,
    filteredRuns,
    handleStart,
    handlePreview,
    handleAccept,
    handleReject,
    handleOpenAcceptModal,
    handleOpenRejectModal,
    handleOpenRevisionModal,
    handleConfirmAccept,
    handleConfirmReject,
    handleRequestChangesSubmit,
    handleRecover,
    handleRetry,
  }
}

