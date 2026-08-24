import { useState } from "react"
import {
  useAcceptObjective,
  useStartIntegration,
  usePreviewRun,
  useAggregatePreview,
  useStopAggregatePreview,
  useRequestObjectiveVisualChanges,
  useCaptureVisualEvidence,
  useDeliveryCertification,
  useCreateDeliveryCertification,
  useAcceptDeliveryCertification,
  useRequestObjectiveNodeRetry,
} from "@/hooks/use-orchestrator"
import { toast } from "@/components/ui/toast"
import type { AggregatePreview, ObjectiveEvidence, ObjectiveEvidenceNode, UseEvidenceViewReturn } from "../types"

export const useEvidenceView = (evidence: ObjectiveEvidence): UseEvidenceViewReturn => {
  const objective = evidence.objective
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [previewMessage, setPreviewMessage] = useState<string | null>(null)
  const [aggregatePreview, setAggregatePreview] = useState<AggregatePreview | null>(null)
  const [retryNode, setRetryNode] = useState<ObjectiveEvidenceNode | null>(null)
  const [retryReason, setRetryReason] = useState("")

  const accept = useAcceptObjective()
  const integration = useStartIntegration()
  const preview = usePreviewRun()
  const aggregate = useAggregatePreview()
  const stopAggregate = useStopAggregatePreview()
  const visualRepair = useRequestObjectiveVisualChanges()
  const visualCapture = useCaptureVisualEvidence()
  const delivery = useDeliveryCertification(objective.objectiveId)
  const createDelivery = useCreateDeliveryCertification()
  const acceptDelivery = useAcceptDeliveryCertification()
  const nodeRetry = useRequestObjectiveNodeRetry()

  const handlePreview = async (runId: string) => {
    try {
      const result = await preview.mutateAsync(runId)
      setPreviewMessage(`Preview opened: ${result.workspacePath ?? runId}`)
      toast.add({
        title: "Preview Dibuka",
        description: `Workspace review untuk ${runId} berhasil dibuka di VS Code.`,
        type: "success",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Preview tidak tersedia."
      setPreviewMessage(msg)
      toast.add({ title: "Gagal Preview", description: msg, type: "error" })
    }
  }

  const handleAccept = async () => {
    try {
      await accept.mutateAsync(objective.objectiveId)
      setAcceptOpen(false)
      toast.add({
        title: "Objective Accepted",
        description: `Objective ${objective.objectiveId} berhasil di-accept! Diff diterapkan ke branch utama & Wiki disinkronkan.`,
        type: "success",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal accept objective."
      toast.add({ title: "Gagal Final Acceptance", description: msg, type: "error" })
    }
  }

  const handleAggregatePreview = async () => {
    try {
      const res = await aggregate.mutateAsync({ objectiveId: objective.objectiveId })
      setAggregatePreview(res)
      const port = res.previews[0]?.port ? `port ${res.previews[0].port}` : "port terisolasi"
      toast.add({
        title: "Aggregate Preview Aktif",
        description: `Dev server preview berhasil dijalankan pada ${port}.`,
        type: "success",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Aggregate preview tidak tersedia."
      setPreviewMessage(msg)
      toast.add({ title: "Gagal Aggregate Preview", description: msg, type: "error" })
    }
  }

  const handleStopAggregatePreview = async () => {
    if (!aggregatePreview) return
    try {
      const res = await stopAggregate.mutateAsync({ objectiveId: objective.objectiveId, sessionId: aggregatePreview.sessionId })
      setAggregatePreview(res)
      toast.add({
        title: "Aggregate Preview Dihentikan",
        description: "Dev server preview terisolasi berhasil ditutup dan port dibersihkan.",
        type: "info",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal menghentikan preview."
      toast.add({ title: "Gagal Stop Preview", description: msg, type: "error" })
    }
  }

  const handleVisualRepair = async (nodeId: string, reason: string) => {
    try {
      await visualRepair.mutateAsync({ objectiveId: objective.objectiveId, nodeId, reason })
      setPreviewMessage(`Visual repair untuk ${nodeId} disetujui.`)
      toast.add({
        title: "Visual Repair Disetujui",
        description: `Agent dikerahkan untuk memperbaiki tampilan visual node ${nodeId}.`,
        type: "success",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal request visual repair."
      toast.add({ title: "Gagal Visual Repair", description: msg, type: "error" })
    }
  }

  const handleVisualCapture = async (runId: string, baseUrl: string) => {
    try {
      await visualCapture.mutateAsync({ objectiveId: objective.objectiveId, runId, baseUrl, route: "/" })
      setPreviewMessage(`Visual capture untuk ${runId} selesai.`)
      toast.add({
        title: "Visual Screenshot Dicapture",
        description: `Screenshot visual QA untuk ${runId} berhasil disimpan ke evidence report.`,
        type: "success",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal capture visual screenshot."
      toast.add({ title: "Gagal Visual Capture", description: msg, type: "error" })
    }
  }

  const handleDeliveryRun = async () => {
    try {
      await createDelivery.mutateAsync(objective.objectiveId)
      toast.add({
        title: "Delivery Certification Berjalan",
        description: "Pengujian delivery certification otomatis sedang dijalankan...",
        type: "info",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal menjalankan delivery certification."
      toast.add({ title: "Gagal Delivery Certification", description: msg, type: "error" })
    }
  }

  const handleDeliveryAccept = async () => {
    try {
      await acceptDelivery.mutateAsync({
        objectiveId: objective.objectiveId,
        certificationId: delivery.data?.latest?.certificationId,
      })
      toast.add({
        title: "Delivery Certification Disetujui",
        description: "Hasil delivery certification berhasil disahkan untuk release.",
        type: "success",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal menyetujui delivery certification."
      toast.add({ title: "Gagal Accept Certification", description: msg, type: "error" })
    }
  }

  const handleIntegration = async () => {
    try {
      await integration.mutateAsync({
        objectiveId: objective.objectiveId,
        orchestrationId: typeof evidence.orchestration?.orchestrationId === "string" ? evidence.orchestration.orchestrationId : null,
        integrationNodeId: evidence.nodes.find((node) => node.type === "INTEGRATION")?.nodeId ?? null,
      })
      setPreviewMessage(null)
      toast.add({
        title: "Integration Verification Dimulai",
        description: "Verifikasi integrasi cross-node sedang berlangsung...",
        type: "info",
      })
    } catch (error) {
      const response = (error as { response?: { data?: { error?: { message?: string } } } })?.response
      const msg = response?.data?.error?.message ?? (error instanceof Error ? error.message : "Integration verification tidak dapat dimulai.")
      setPreviewMessage(msg)
      toast.add({ title: "Gagal Verifikasi Integrasi", description: msg, type: "error" })
    }
  }

  const handleNodeRetry = async () => {
    if (!retryNode) return
    const reason = retryReason.trim() || "Retry setelah human review atas kegagalan node orchestration."
    try {
      await nodeRetry.mutateAsync({
        objectiveId: objective.objectiveId,
        orchestrationId: typeof evidence.orchestration?.orchestrationId === "string" ? evidence.orchestration.orchestrationId : null,
        nodeId: retryNode.nodeId,
        reason,
      })
      setRetryNode(null)
      setRetryReason("")
      setPreviewMessage(`Retry decision untuk ${retryNode.nodeId} dibuat. Buka Decision Inbox untuk memilih RETRY.`)
      toast.add({
        title: "Retry Decision Dibuat",
        description: `Decision untuk node ${retryNode.nodeId} telah dikirim ke Decision Inbox.`,
        type: "success",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal membuat retry decision."
      toast.add({ title: "Gagal Request Retry", description: msg, type: "error" })
    }
  }

  return {
    acceptOpen,
    setAcceptOpen,
    previewMessage,
    aggregatePreview,
    delivery: delivery.data?.latest ?? null,
    previewPending: preview.isPending,
    acceptPending: accept.isPending,
    aggregatePending: aggregate.isPending,
    stopAggregatePending: stopAggregate.isPending,
    visualRepairPending: visualRepair.isPending,
    visualCapturePending: visualCapture.isPending,
    visualCaptureRunId: visualCapture.variables?.runId ?? null,
    createDeliveryPending: createDelivery.isPending,
    acceptDeliveryPending: acceptDelivery.isPending,
    integrationPending: integration.isPending,
    retryNode,
    setRetryNode,
    retryReason,
    setRetryReason,
    retryNodePending: nodeRetry.isPending,
    handlePreview,
    handleAccept,
    handleAggregatePreview,
    handleStopAggregatePreview,
    handleVisualRepair,
    handleVisualCapture,
    handleDeliveryRun,
    handleDeliveryAccept,
    handleIntegration,
    handleNodeRetry,
  }
}
