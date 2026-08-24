import React from "react"
import { DatabaseBackup, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReleaseMetric } from "./ReleaseMetric"
import type { BackupGovernanceSectionProps } from "../types"

export const BackupGovernanceSection: React.FC<BackupGovernanceSectionProps> = ({
  backupRecovery,
  backupRoot,
  onBackupRootChange,
  backupInterval,
  onBackupIntervalChange,
  rotationDays,
  onRotationDaysChange,
  keepLatest,
  onKeepLatestChange,
  drillEvidence,
  onDrillEvidenceChange,
  onPreviewSchedule,
  isPreviewingSchedule,
  schedulePreviewData,
  onVerifyBackup,
  isVerifyingBackup,
  onPreviewRotation,
  isPreviewingRotation,
  rotationPreviewData,
  onRecordDrill,
  isRecordingDrill,
}) => {
  const configuredTarget = backupRoot || backupRecovery?.target.configuredTarget || ""

  return (
    <section
      className="rounded-xl border border-cyan-500/25 bg-cyan-950/10 p-5"
      aria-labelledby="backup-recovery-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-cyan-300">
            P8.3 · Backup Rotation & Recovery Review
          </p>
          <h3 id="backup-recovery-title" className="text-xl font-semibold text-white">
            Backup governance
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Jadwal dan rotasi selalu berupa preview/evidence. Dashboard tidak mengaktifkan launchd, restore, promotion, atau penghapusan permanen.
          </p>
        </div>
        <DatabaseBackup className="h-6 w-6 text-cyan-300" />
      </div>

      {backupRecovery && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <ReleaseMetric
            label="Target"
            value={
              backupRecovery.target.independentTarget === true
                ? "INDEPENDENT"
                : backupRecovery.target.independentTarget === false
                  ? "NOT INDEPENDENT"
                  : "UNKNOWN"
            }
            detail={backupRecovery.target.configuredTarget || "Belum dikonfigurasi"}
            tone={backupRecovery.target.independentTarget === true ? "good" : "bad"}
          />
          <ReleaseMetric
            label="Schedule"
            value={backupRecovery.schedule?.launchctlActivated ? "ACTIVE" : "ARTIFACT ONLY"}
            detail={
              backupRecovery.schedule
                ? `${backupRecovery.schedule.intervalHours} jam · ${backupRecovery.schedule.label}`
                : "Belum ada schedule artifact"
            }
          />
          <ReleaseMetric
            label="Recovery drill"
            value={backupRecovery.drill.status}
            detail={
              backupRecovery.drill.dueAt
                ? `Due ${new Date(backupRecovery.drill.dueAt).toLocaleDateString("id-ID")}`
                : "Belum ada evidence"
            }
            tone={backupRecovery.drill.status === "CURRENT" ? "good" : "bad"}
          />
          <ReleaseMetric
            label="Artifact coverage"
            value={backupRecovery.artifactCoverage?.complete ? "COMPLETE" : "MISSING"}
            detail={
              backupRecovery.artifactCoverage
                ? `${backupRecovery.artifactCoverage.protectedActiveRecordCount} active protected`
                : "Belum ada snapshot"
            }
            tone={backupRecovery.artifactCoverage?.complete ? "good" : "bad"}
          />
          <ReleaseMetric
            label="Guardrails"
            value="ON"
            detail="Restore · promotion · delete manual"
            tone="good"
          />
        </div>
      )}

      {backupRecovery?.artifactCoverage && (
        <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-100">Cakupan artefak operasi</p>
              <p className="mt-1 text-xs text-slate-400">
                Objective, plan, orchestration, decision, dan integration artifact diverifikasi sebagai bagian backup; state aktif tidak eligible untuk purge.
              </p>
            </div>
            <span className="rounded border border-emerald-500/30 px-2 py-1 text-xs text-emerald-300">
              {backupRecovery.artifactCoverage.complete &&
              backupRecovery.artifactCoverage.activeStateNeverPurged
                ? "PROTECTED"
                : "REVIEW"}
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <ReleaseMetric
              label="Collections"
              value={String(backupRecovery.artifactCoverage.requiredCollections.length)}
              detail={backupRecovery.artifactCoverage.requiredCollections.join(" · ")}
              tone="good"
            />
            <ReleaseMetric
              label="Files"
              value={String(backupRecovery.artifactCoverage.totals.fileCount)}
              detail={`${backupRecovery.artifactCoverage.totals.bytes} bytes`}
            />
            <ReleaseMetric
              label="Active state"
              value={String(backupRecovery.artifactCoverage.protectedActiveRecordCount)}
              detail="protected from retention purge"
              tone="good"
            />
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
          <p className="font-medium text-slate-100">Schedule preview</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_100px_auto]">
            <input
              aria-label="Backup target path"
              value={configuredTarget}
              onChange={(event) => onBackupRootChange(event.target.value)}
              placeholder="/absolute/external-backups"
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
            />
            <input
              aria-label="Backup interval hours"
              type="number"
              min="1"
              value={backupInterval}
              onChange={(event) => onBackupIntervalChange(Number(event.target.value))}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
            />
            <Button
              size="sm"
              disabled={!configuredTarget.trim() || isPreviewingSchedule}
              onClick={onPreviewSchedule}
            >
              {isPreviewingSchedule ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Buat preview"
              )}
            </Button>
          </div>
          {schedulePreviewData && (
            <p className="mt-2 text-xs text-cyan-200">
              {schedulePreviewData.label} · {schedulePreviewData.intervalHours} jam · launchctl activated:{" "}
              {String(schedulePreviewData.launchd.activated)}
            </p>
          )}
          <Button
            className="mt-3"
            size="sm"
            variant="outline"
            disabled={!backupRecovery?.registeredBackup || isVerifyingBackup}
            onClick={onVerifyBackup}
          >
            {isVerifyingBackup ? "Verifikasi…" : "Verifikasi backup terdaftar"}
          </Button>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
          <p className="font-medium text-slate-100">Rotation preview & drill</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_90px_90px_auto]">
            <input
              aria-label="Rotation backup target"
              value={configuredTarget}
              onChange={(event) => onBackupRootChange(event.target.value)}
              placeholder="backup root"
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
            />
            <input
              aria-label="Rotation age days"
              type="number"
              min="1"
              value={rotationDays}
              onChange={(event) => onRotationDaysChange(Number(event.target.value))}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
            />
            <input
              aria-label="Keep latest backups"
              type="number"
              min="1"
              value={keepLatest}
              onChange={(event) => onKeepLatestChange(Number(event.target.value))}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
            />
            <Button
              size="sm"
              disabled={!configuredTarget.trim() || isPreviewingRotation}
              onClick={onPreviewRotation}
            >
              {isPreviewingRotation ? "Memuat…" : "Preview rotasi"}
            </Button>
          </div>
          {rotationPreviewData && (
            <p className="mt-2 text-xs text-cyan-200">
              {rotationPreviewData.summary.candidateCount} kandidat ·{" "}
              {rotationPreviewData.guardrail}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <input
              aria-label="Recovery drill evidence"
              value={drillEvidence}
              onChange={(event) => onDrillEvidenceChange(event.target.value)}
              placeholder="evidence recovery drill"
              className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
            />
            <Button
              size="sm"
              disabled={!drillEvidence.trim() || isRecordingDrill}
              onClick={onRecordDrill}
            >
              {isRecordingDrill ? "Mencatat…" : "Catat drill PASS"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
