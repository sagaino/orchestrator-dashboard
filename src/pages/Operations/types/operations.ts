import type React from "react"
import type {
  OperationsReadiness,
  OperationsCheck,
  OperationsAlert,
  OperationsArtifactCoverage,
  ReleaseOperations,
  RetentionPlan,
  BackupSchedulePreview,
  BackupRotationPreview,
  BackupRecoveryStatus,
  DaemonStatus,
} from "@/services/orchestrator"

export type {
  OperationsReadiness,
  OperationsCheck,
  OperationsAlert,
  OperationsArtifactCoverage,
  ReleaseOperations,
  RetentionPlan,
  BackupSchedulePreview,
  BackupRotationPreview,
  BackupRecoveryStatus,
  DaemonStatus,
}

export type MetricTone = "neutral" | "good" | "bad"

export interface ReleaseMetricProps {
  label: string
  value: string
  detail: string
  tone?: MetricTone
}

export interface ReleaseEvidenceCardProps {
  title: string
  status: string
  body: string
  detail: string
}

export interface OperationsHeaderProps {
  isRefreshing: boolean
  onRefresh: () => void
}

export interface OperationsReadinessSectionProps {
  readiness?: OperationsReadiness
  isLoading: boolean
  daemon?: DaemonStatus | null
  alertOwners: Record<string, string>
  onAlertOwnerChange: (alertId: string, value: string) => void
  alertEvidence: Record<string, string>
  onAlertEvidenceChange: (alertId: string, value: string) => void
  alertSnooze: Record<string, string>
  onAlertSnoozeChange: (alertId: string, value: string) => void
  onAcknowledgeAlert: (alertId: string, owner: string, snoozeMinutes?: string) => void
  isAcknowledgingAlert: boolean
  onResolveAlert: (alertId: string, owner: string, evidence: string) => void
  isResolvingAlert: boolean
}

export interface BackupGovernanceSectionProps {
  backupRecovery?: BackupRecoveryStatus
  backupRoot: string
  onBackupRootChange: (value: string) => void
  backupInterval: number
  onBackupIntervalChange: (value: number) => void
  rotationDays: number
  onRotationDaysChange: (value: number) => void
  keepLatest: number
  onKeepLatestChange: (value: number) => void
  drillEvidence: string
  onDrillEvidenceChange: (value: string) => void
  onPreviewSchedule: () => void
  isPreviewingSchedule: boolean
  schedulePreviewData?: BackupSchedulePreview
  onVerifyBackup: () => void
  isVerifyingBackup: boolean
  onPreviewRotation: () => void
  isPreviewingRotation: boolean
  rotationPreviewData?: BackupRotationPreview
  onRecordDrill: () => void
  isRecordingDrill: boolean
}

export interface ReleaseOperationsSectionProps {
  release?: ReleaseOperations
  releaseLoading: boolean
  confirmed: boolean
  onConfirmedChange: (confirmed: boolean) => void
  activationNotice: string | null
  onPrepareActivation: () => void
}

export interface SafeRetentionSectionProps {
  days: number
  onDaysChange: (days: number) => void
  onPreviewRetention: () => void
  isPreviewingRetention: boolean
  activePlan?: RetentionPlan
  planId: string | null
  retentionConfirmed: boolean
  onRetentionConfirmedChange: (confirmed: boolean, planId: string) => void
  onPurgeRetention: (planId: string) => void
  isPurgingRetention: boolean
  trash: RetentionPlan[]
  onRestoreRetention: (trashId: string) => void
  isRestoringRetention: boolean
}

export interface UseOperationsReturn {
  // Readiness & Daemon
  readiness?: OperationsReadiness
  readinessLoading: boolean
  isFetchingReadiness: boolean
  daemon: DaemonStatus | null

  // Release
  release?: ReleaseOperations
  releaseLoading: boolean
  isFetchingRelease: boolean
  releaseConfirmed: boolean
  setReleaseConfirmed: React.Dispatch<React.SetStateAction<boolean>>
  activationNotice: string | null
  setActivationNotice: React.Dispatch<React.SetStateAction<string | null>>
  handlePrepareActivation: () => void

  // Backup Recovery
  backupRecovery?: BackupRecoveryStatus
  isFetchingBackupRecovery: boolean
  backupRoot: string
  setBackupRoot: React.Dispatch<React.SetStateAction<string>>
  backupInterval: number
  setBackupInterval: React.Dispatch<React.SetStateAction<number>>
  rotationDays: number
  setRotationDays: React.Dispatch<React.SetStateAction<number>>
  keepLatest: number
  setKeepLatest: React.Dispatch<React.SetStateAction<number>>
  drillEvidence: string
  setDrillEvidence: React.Dispatch<React.SetStateAction<string>>
  schedulePreviewData?: BackupSchedulePreview
  isPreviewingSchedule: boolean
  rotationPreviewData?: BackupRotationPreview
  isPreviewingRotation: boolean
  isVerifyingBackup: boolean
  isRecordingDrill: boolean
  handlePreviewSchedule: () => void
  handleVerifyBackup: () => void
  handlePreviewRotation: () => void
  handleRecordDrill: () => void

  // Alerts
  alertOwners: Record<string, string>
  setAlertOwners: React.Dispatch<React.SetStateAction<Record<string, string>>>
  handleAlertOwnerChange: (alertId: string, value: string) => void
  alertEvidence: Record<string, string>
  setAlertEvidence: React.Dispatch<React.SetStateAction<Record<string, string>>>
  handleAlertEvidenceChange: (alertId: string, value: string) => void
  alertSnooze: Record<string, string>
  setAlertSnooze: React.Dispatch<React.SetStateAction<Record<string, string>>>
  handleAlertSnoozeChange: (alertId: string, value: string) => void
  handleAcknowledgeAlert: (alertId: string, owner: string, snoozeMinutes?: string) => void
  isAcknowledgingAlert: boolean
  handleResolveAlert: (alertId: string, owner: string, evidence: string) => void
  isResolvingAlert: boolean

  // Retention & Trash
  days: number
  setDays: React.Dispatch<React.SetStateAction<number>>
  planId: string | null
  setPlanId: React.Dispatch<React.SetStateAction<string | null>>
  retentionConfirmed: boolean
  setRetentionConfirmed: React.Dispatch<React.SetStateAction<boolean>>
  handleRetentionConfirmedChange: (confirmed: boolean, planId: string) => void
  activePlan?: RetentionPlan
  isPreviewingRetention: boolean
  isPurgingRetention: boolean
  isRestoringRetention: boolean
  trash: RetentionPlan[]
  handlePreviewRetention: () => void
  handlePurgeRetention: (planId: string) => void
  handleRestoreRetention: (trashId: string) => void

  // Global Refresh
  isRefreshing: boolean
  handleRefreshAll: () => void
}
