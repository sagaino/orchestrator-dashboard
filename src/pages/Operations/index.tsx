import React from "react"
import { useOperations } from "./hooks"
import {
  OperationsHeader,
  OperationsReadinessSection,
  BackupGovernanceSection,
  ReleaseOperationsSection,
  SafeRetentionSection,
} from "./components"

export const OperationsPage: React.FC = () => {
  const {
    readiness,
    readinessLoading,
    daemon,

    release,
    releaseLoading,
    releaseConfirmed,
    setReleaseConfirmed,
    activationNotice,
    handlePrepareActivation,

    backupRecovery,
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
    schedulePreviewData,
    isPreviewingSchedule,
    rotationPreviewData,
    isPreviewingRotation,
    isVerifyingBackup,
    isRecordingDrill,
    handlePreviewSchedule,
    handleVerifyBackup,
    handlePreviewRotation,
    handleRecordDrill,

    alertOwners,
    handleAlertOwnerChange,
    alertEvidence,
    handleAlertEvidenceChange,
    alertSnooze,
    handleAlertSnoozeChange,
    handleAcknowledgeAlert,
    isAcknowledgingAlert,
    handleResolveAlert,
    isResolvingAlert,

    days,
    setDays,
    planId,
    retentionConfirmed,
    handleRetentionConfirmedChange,
    activePlan,
    isPreviewingRetention,
    isPurgingRetention,
    isRestoringRetention,
    trash,
    handlePreviewRetention,
    handlePurgeRetention,
    handleRestoreRetention,

    isRefreshing,
    handleRefreshAll,
  } = useOperations()

  return (
    <div className="w-full space-y-6 pb-12">
      <OperationsHeader
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshAll}
      />

      <OperationsReadinessSection
        readiness={readiness}
        isLoading={readinessLoading}
        daemon={daemon}
        alertOwners={alertOwners}
        onAlertOwnerChange={handleAlertOwnerChange}
        alertEvidence={alertEvidence}
        onAlertEvidenceChange={handleAlertEvidenceChange}
        alertSnooze={alertSnooze}
        onAlertSnoozeChange={handleAlertSnoozeChange}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        isAcknowledgingAlert={isAcknowledgingAlert}
        onResolveAlert={handleResolveAlert}
        isResolvingAlert={isResolvingAlert}
      />

      <BackupGovernanceSection
        backupRecovery={backupRecovery}
        backupRoot={backupRoot}
        onBackupRootChange={setBackupRoot}
        backupInterval={backupInterval}
        onBackupIntervalChange={setBackupInterval}
        rotationDays={rotationDays}
        onRotationDaysChange={setRotationDays}
        keepLatest={keepLatest}
        onKeepLatestChange={setKeepLatest}
        drillEvidence={drillEvidence}
        onDrillEvidenceChange={setDrillEvidence}
        onPreviewSchedule={handlePreviewSchedule}
        isPreviewingSchedule={isPreviewingSchedule}
        schedulePreviewData={schedulePreviewData}
        onVerifyBackup={handleVerifyBackup}
        isVerifyingBackup={isVerifyingBackup}
        onPreviewRotation={handlePreviewRotation}
        isPreviewingRotation={isPreviewingRotation}
        rotationPreviewData={rotationPreviewData}
        onRecordDrill={handleRecordDrill}
        isRecordingDrill={isRecordingDrill}
      />

      <ReleaseOperationsSection
        release={release}
        releaseLoading={releaseLoading}
        confirmed={releaseConfirmed}
        onConfirmedChange={setReleaseConfirmed}
        activationNotice={activationNotice}
        onPrepareActivation={handlePrepareActivation}
      />

      <SafeRetentionSection
        days={days}
        onDaysChange={setDays}
        onPreviewRetention={handlePreviewRetention}
        isPreviewingRetention={isPreviewingRetention}
        activePlan={activePlan}
        planId={planId}
        retentionConfirmed={retentionConfirmed}
        onRetentionConfirmedChange={handleRetentionConfirmedChange}
        onPurgeRetention={handlePurgeRetention}
        isPurgingRetention={isPurgingRetention}
        trash={trash}
        onRestoreRetention={handleRestoreRetention}
        isRestoringRetention={isRestoringRetention}
      />
    </div>
  )
}

export default OperationsPage
