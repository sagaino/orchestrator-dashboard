import { useState } from "react"
import {
  useAcknowledgeOperationsAlert,
  useBackupRecoveryStatus,
  useDaemonStatus,
  useOperationsReadiness,
  usePreviewBackupRotation,
  usePreviewBackupSchedule,
  usePreviewRetention,
  usePurgeRetention,
  useRecordRecoveryDrill,
  useReleaseOperations,
  useResolveOperationsAlert,
  useRestoreRetention,
  useRetentionTrash,
  useVerifyRegisteredBackup,
} from "@/hooks/use-orchestrator"
import type { UseOperationsReturn } from "../types"

export const useOperations = (): UseOperationsReturn => {
  const {
    data: readiness,
    isLoading: readinessLoading,
    refetch: refetchReadiness,
    isFetching: isFetchingReadiness,
  } = useOperationsReadiness()
  const { data: daemon = null, refetch: refetchDaemon } = useDaemonStatus()
  const {
    data: release,
    isLoading: releaseLoading,
    refetch: refetchRelease,
    isFetching: isFetchingRelease,
  } = useReleaseOperations()
  const {
    data: backupRecovery,
    refetch: refetchBackupRecovery,
    isFetching: isFetchingBackupRecovery,
  } = useBackupRecoveryStatus()
  const { data: trash = [] } = useRetentionTrash()

  const preview = usePreviewRetention()
  const purge = usePurgeRetention()
  const restore = useRestoreRetention()
  const acknowledgeAlert = useAcknowledgeOperationsAlert()
  const resolveAlert = useResolveOperationsAlert()
  const backupSchedule = usePreviewBackupSchedule()
  const backupRotation = usePreviewBackupRotation()
  const verifyBackup = useVerifyRegisteredBackup()
  const recordDrill = useRecordRecoveryDrill()

  const [days, setDays] = useState(30)
  const [planId, setPlanId] = useState<string | null>(null)
  const [retentionConfirmed, setRetentionConfirmed] = useState(false)
  const [releaseConfirmed, setReleaseConfirmed] = useState(false)
  const [activationNotice, setActivationNotice] = useState<string | null>(null)
  const [alertOwners, setAlertOwners] = useState<Record<string, string>>({})
  const [alertEvidence, setAlertEvidence] = useState<Record<string, string>>({})
  const [alertSnooze, setAlertSnooze] = useState<Record<string, string>>({})
  const [backupRoot, setBackupRoot] = useState("")
  const [backupInterval, setBackupInterval] = useState(24)
  const [rotationDays, setRotationDays] = useState(30)
  const [keepLatest, setKeepLatest] = useState(2)
  const [drillEvidence, setDrillEvidence] = useState("")

  const activePlan = preview.data

  const handleRefreshAll = () => {
    refetchReadiness()
    refetchDaemon()
    refetchRelease()
    refetchBackupRecovery()
  }

  const handleAlertOwnerChange = (alertId: string, value: string) => {
    setAlertOwners((current) => ({ ...current, [alertId]: value }))
  }

  const handleAlertEvidenceChange = (alertId: string, value: string) => {
    setAlertEvidence((current) => ({ ...current, [alertId]: value }))
  }

  const handleAlertSnoozeChange = (alertId: string, value: string) => {
    setAlertSnooze((current) => ({ ...current, [alertId]: value }))
  }

  const handleAcknowledgeAlert = (alertId: string, owner: string, snoozeMinutes?: string) => {
    const trimmedOwner = owner.trim()
    if (!trimmedOwner) return
    acknowledgeAlert.mutate({
      alertId,
      owner: trimmedOwner,
      snoozeMinutes: snoozeMinutes ? Number(snoozeMinutes) : undefined,
    })
  }

  const handleResolveAlert = (alertId: string, owner: string, evidence: string) => {
    const trimmedOwner = owner.trim()
    const trimmedEvidence = evidence.trim()
    if (!trimmedOwner || !trimmedEvidence) return
    resolveAlert.mutate({
      alertId,
      resolvedBy: trimmedOwner,
      evidence: trimmedEvidence,
    })
  }

  const handlePreviewSchedule = () => {
    const target = (backupRoot || backupRecovery?.target.configuredTarget || "").trim()
    if (!target) return
    backupSchedule.mutate({
      backupRoot: target,
      intervalHours: backupInterval,
    })
  }

  const handleVerifyBackup = () => {
    if (!backupRecovery?.registeredBackup) return
    verifyBackup.mutate()
  }

  const handlePreviewRotation = () => {
    const target = (backupRoot || backupRecovery?.target.configuredTarget || "").trim()
    if (!target) return
    backupRotation.mutate({
      backupRoot: target,
      olderThanDays: rotationDays,
      keepLatest,
    })
  }

  const handleRecordDrill = () => {
    const trimmed = drillEvidence.trim()
    if (!trimmed) return
    recordDrill.mutate({ evidence: trimmed, result: "PASS" })
  }

  const handlePrepareActivation = () => {
    setActivationNotice(
      "Konfirmasi UI siap diteruskan ke external supervisor; tidak ada aktivasi yang dijalankan dari dashboard."
    )
  }

  const handleRetentionConfirmedChange = (checked: boolean, targetPlanId: string) => {
    setRetentionConfirmed(checked)
    setPlanId(targetPlanId)
  }

  const handlePreviewRetention = () => {
    preview.mutate(days)
  }

  const handlePurgeRetention = (targetPlanId: string) => {
    purge.mutate(targetPlanId)
  }

  const handleRestoreRetention = (trashId: string) => {
    restore.mutate(trashId)
  }

  const isRefreshing = isFetchingReadiness || isFetchingRelease || isFetchingBackupRecovery

  return {
    readiness,
    readinessLoading,
    isFetchingReadiness,
    daemon,

    release,
    releaseLoading,
    isFetchingRelease,
    releaseConfirmed,
    setReleaseConfirmed,
    activationNotice,
    setActivationNotice,
    handlePrepareActivation,

    backupRecovery,
    isFetchingBackupRecovery,
    backupRoot,
    setBackupRoot,
    backupInterval,
    setBackupInterval,
    rotationDays,
    setRotationDays,
    keepLatest,
    setKeepLatest,
    drillEvidence,
    setDrillEvidence,
    schedulePreviewData: backupSchedule.data,
    isPreviewingSchedule: backupSchedule.isPending,
    rotationPreviewData: backupRotation.data,
    isPreviewingRotation: backupRotation.isPending,
    isVerifyingBackup: verifyBackup.isPending,
    isRecordingDrill: recordDrill.isPending,
    handlePreviewSchedule,
    handleVerifyBackup,
    handlePreviewRotation,
    handleRecordDrill,

    alertOwners,
    setAlertOwners,
    handleAlertOwnerChange,
    alertEvidence,
    setAlertEvidence,
    handleAlertEvidenceChange,
    alertSnooze,
    setAlertSnooze,
    handleAlertSnoozeChange,
    handleAcknowledgeAlert,
    isAcknowledgingAlert: acknowledgeAlert.isPending,
    handleResolveAlert,
    isResolvingAlert: resolveAlert.isPending,

    days,
    setDays,
    planId,
    setPlanId,
    retentionConfirmed,
    setRetentionConfirmed,
    handleRetentionConfirmedChange,
    activePlan,
    isPreviewingRetention: preview.isPending,
    isPurgingRetention: purge.isPending,
    isRestoringRetention: restore.isPending,
    trash,
    handlePreviewRetention,
    handlePurgeRetention,
    handleRestoreRetention,

    isRefreshing,
    handleRefreshAll,
  }
}
