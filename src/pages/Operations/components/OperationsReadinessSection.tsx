import React from "react"
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldAlert,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OperationsReadinessSectionProps } from "../types"

export const OperationsReadinessSection: React.FC<OperationsReadinessSectionProps> = ({
  readiness,
  isLoading,
  daemon,
  alertOwners,
  onAlertOwnerChange,
  alertEvidence,
  onAlertEvidenceChange,
  alertSnooze,
  onAlertSnoozeChange,
  onAcknowledgeAlert,
  isAcknowledgingAlert,
  onResolveAlert,
  isResolvingAlert,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-slate-400">
        Memuat readiness…
      </div>
    )
  }

  if (!readiness) {
    return null
  }

  const statusClass =
    readiness.status === "READY"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : readiness.status === "DEGRADED"
        ? "bg-amber-500/15 text-amber-200 border-amber-500/30"
        : "bg-rose-500/15 text-rose-200 border-rose-500/30"

  const runtimeConfig = readiness.signals.runtimeConfig
  const profileAlignment = readiness.signals.runtimeProfileAlignment
  const profileCheck = readiness.checks.find((item) => item.id === "runtime-profile")
  const queue = readiness.signals.queue
  const displayValue = (value: unknown) => typeof value === "string" ? value : JSON.stringify(value)
  const alignmentLabel = profileAlignment?.aligned === true
    ? "SESUAI"
    : profileAlignment?.aligned === false
      ? "TIDAK SESUAI"
      : "BELUM TERSEDIA"
  const alignmentClass = profileAlignment?.aligned === true
    ? "border-emerald-500/30 text-emerald-200"
    : profileAlignment?.aligned === false
      ? "border-rose-500/40 text-rose-200"
      : "border-slate-600 text-slate-300"
  const formatQueueAge = (ageMs: number | undefined) => {
    if (!Number.isFinite(ageMs) || !ageMs || ageMs < 1000) return "0 menit"
    return `${Math.floor(ageMs / 60_000)} menit`
  }

  return (
    <>
      <div className={`rounded-xl border p-5 ${statusClass}`}>
        <div className="flex items-center gap-3">
          {readiness.status === "READY" ? <CheckCircle2 /> : <ShieldAlert />}
          <div>
            <p className="font-semibold">{readiness.status}</p>
            <p className="text-sm opacity-90">
              {readiness.admission.allowed
                ? "Admission aktif untuk pekerjaan baru."
                : `${readiness.admission.blockers.length} blocker harus diselesaikan sebelum admission dibuka.`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <section aria-labelledby="runtime-profile-title" className={`rounded-xl border bg-slate-950/40 p-4 ${profileAlignment?.aligned === false ? "border-rose-500/40" : "border-slate-800"}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 id="runtime-profile-title" className="font-medium text-slate-100">Runtime profile</h3>
              <p className="mt-1 text-xs text-slate-500">Konfigurasi efektif yang sedang digunakan daemon.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded border px-2 py-0.5 text-xs ${alignmentClass}`}>
                {alignmentLabel}
              </span>
              <span className="rounded border border-indigo-500/30 px-2 py-0.5 text-xs text-indigo-200">{runtimeConfig?.profile ?? "UNKNOWN"}</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
            <span>Objective scheduler: <strong className="text-slate-200">{runtimeConfig?.flags.objectiveScheduler ? "ON" : "OFF"}</strong></span>
            <span>Cross-project: <strong className="text-slate-200">{runtimeConfig?.flags.crossProject ? "ON" : "OFF"}</strong></span>
            <span>Same-project parallel: <strong className="text-slate-200">{runtimeConfig?.flags.sameProjectParallel ? "ON" : "OFF"}</strong></span>
            <span>Parallel objectives: <strong className="text-slate-200">{runtimeConfig?.flags.parallelObjectives ? "ON" : "OFF"}</strong></span>
            <span>Skills: <strong className="text-slate-200">{runtimeConfig?.flags.skills ? "ON" : "OFF"}</strong></span>
            <span>Max parallel jobs: <strong className="text-slate-200">{runtimeConfig?.capacity.maxParallelJobs ?? "-"}</strong></span>
          </div>
          {profileAlignment?.overrides && profileAlignment.overrides.length > 0 && (
            <p className="mt-3 text-xs text-cyan-200">{profileAlignment.overrides.length} opt-in eksplisit aktif dan masih berada dalam batas aman profil.</p>
          )}
          {profileAlignment?.mismatches && profileAlignment.mismatches.length > 0 && (
            <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-100">
              <p className="font-medium">Konfigurasi yang perlu diperbaiki:</p>
              <ul className="mt-2 space-y-1">
                {profileAlignment.mismatches.map((item) => (
                  <li key={item.field}><code>{item.field}</code>: saat ini {displayValue(item.actual)}, seharusnya {displayValue(item.expected)}</li>
                ))}
              </ul>
              {profileCheck?.action && <p className="mt-2 text-rose-200">Tindakan aman: {profileCheck.action}</p>}
            </div>
          )}
        </section>

        <section aria-labelledby="worker-capacity-title" className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 id="worker-capacity-title" className="font-medium text-slate-100">Worker capacity & queue</h3>
              <p className="mt-1 text-xs text-slate-500">Status antrean diperbarui bersama readiness.</p>
            </div>
            <span className="rounded border border-cyan-500/30 px-2 py-0.5 text-xs text-cyan-200">{daemon?.parallel.activeWorkers ?? queue?.activeWorkers ?? 0}/{daemon?.parallel.maxWorkers ?? queue?.maxWorkers ?? "-"} workers</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
            <span>Queued: <strong className="text-slate-200">{daemon?.queue.queuedJobCount ?? queue?.queued ?? 0}</strong></span>
            <span>Running: <strong className="text-slate-200">{daemon?.queue.runningJobCount ?? queue?.running ?? 0}</strong></span>
            <span>Review: <strong className="text-slate-200">{daemon?.queue.reviewJobCount ?? queue?.review ?? 0}</strong></span>
            <span>Slot tersedia: <strong className="text-slate-200">{daemon?.parallel.availableWorkerSlots ?? queue?.availableWorkerSlots ?? "-"}</strong></span>
            <span>Eligible queued: <strong className="text-slate-200">{daemon?.parallel.eligibleQueuedJobCount ?? queue?.eligibleQueuedJobCount ?? "-"}</strong></span>
            <span>Usia tertua: <strong className="text-slate-200">{formatQueueAge(queue?.oldestAgeMs)}</strong></span>
          </div>
          {((daemon?.parallel.blockedQueuedJobCount ?? queue?.blockedQueuedJobCount ?? 0) > 0) && (
            <p className="mt-3 text-xs text-amber-200">Ada {daemon?.parallel.blockedQueuedJobCount ?? queue?.blockedQueuedJobCount} job menunggu dependency atau reservation project.</p>
          )}
        </section>
      </div>

      {readiness.alerts.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
          <div className="mb-3 flex items-center gap-2 font-medium text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            Alert ownership & runbook
          </div>
          <div className="space-y-3">
            {readiness.alerts.map((alert) => {
              const owner = alertOwners[alert.alertId] ?? alert.owner ?? ""
              const evidence = alertEvidence[alert.alertId] ?? ""
              const snooze = alertSnooze[alert.alertId] ?? ""

              return (
                <div
                  key={alert.alertId}
                  className="rounded-lg border border-amber-500/20 bg-slate-950/30 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-amber-100">{alert.message}</p>
                      <p className="mt-1 text-xs text-amber-200/70">
                        {alert.alertId} · {alert.acknowledgementState ?? "UNACKNOWLEDGED"} · owner role: {alert.ownerRole ?? "operations"}
                      </p>
                    </div>
                    {alert.snoozeUntil && (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-[10px] text-slate-300">
                        <Clock3 className="h-3 w-3" />
                        Snooze sampai {new Date(alert.snoozeUntil).toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    {(alert.runbookSteps ?? []).map((step) => (
                      <span
                        key={step}
                        className="inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-1"
                      >
                        <BookOpen className="h-3 w-3 text-indigo-300" />
                        {step}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-[1fr_100px_auto]">
                    <label className="sr-only" htmlFor={`alert-owner-${alert.alertId}`}>
                      Owner alert {alert.alertId}
                    </label>
                    <div className="flex items-center gap-2 rounded border border-slate-700 bg-slate-900 px-2">
                      <UserRound className="h-3.5 w-3.5 text-slate-500" />
                      <input
                        id={`alert-owner-${alert.alertId}`}
                        value={owner}
                        onChange={(event) =>
                          onAlertOwnerChange(alert.alertId, event.target.value)
                        }
                        placeholder="owner"
                        className="min-w-0 flex-1 bg-transparent py-1.5 text-xs text-slate-200 outline-none"
                      />
                    </div>
                    <input
                      aria-label={`Snooze ${alert.alertId}`}
                      value={snooze}
                      onChange={(event) =>
                        onAlertSnoozeChange(alert.alertId, event.target.value)
                      }
                      placeholder="menit"
                      type="number"
                      min="1"
                      className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
                    />
                    <Button
                      size="sm"
                      disabled={!owner.trim() || isAcknowledgingAlert}
                      onClick={() => onAcknowledgeAlert(alert.alertId, owner, snooze)}
                    >
                      {isAcknowledgingAlert ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Ambil ownership"
                      )}
                    </Button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      aria-label={`Evidence resolution ${alert.alertId}`}
                      value={evidence}
                      onChange={(event) =>
                        onAlertEvidenceChange(alert.alertId, event.target.value)
                      }
                      placeholder="resolution evidence / run ID"
                      className="min-w-[240px] flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!owner.trim() || !evidence.trim() || isResolvingAlert}
                      onClick={() => onResolveAlert(alert.alertId, owner, evidence)}
                    >
                      {isResolvingAlert ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Catat resolution
                        </>
                      )}
                    </Button>
                  </div>

                  {alert.resolution && (
                    <p className="mt-2 text-xs text-emerald-300">
                      Resolution oleh {alert.resolution.resolvedBy} pada{" "}
                      {alert.resolution.resolvedAt
                        ? new Date(alert.resolution.resolvedAt).toLocaleString("id-ID")
                        : "-"}
                      .
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {readiness.checks.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-slate-100">{item.id}</p>
              <span
                className={`rounded border px-2 py-0.5 text-xs ${
                  item.status === "PASS"
                    ? "border-emerald-500/30 text-emerald-300"
                    : item.status === "WARN"
                      ? "border-amber-500/30 text-amber-200"
                      : "border-rose-500/30 text-rose-200"
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{item.message}</p>
            <p className="mt-2 text-xs text-slate-500">Tindakan: {item.action}</p>
          </div>
        ))}
      </div>

      {daemon?.restartReconciliation && (
        <section
          aria-labelledby="restart-reconciliation-title"
          className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3
                id="restart-reconciliation-title"
                className="font-medium text-slate-100"
              >
                Restart reconciliation
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Pemulihan ledger saat daemon terakhir dimulai.
              </p>
            </div>
            <span
              className={`rounded border px-2 py-0.5 text-xs ${
                daemon.restartReconciliation.status === "COMPLETE"
                  ? "border-emerald-500/30 text-emerald-300"
                  : daemon.restartReconciliation.status === "FAILED"
                    ? "border-rose-500/30 text-rose-200"
                    : "border-amber-500/30 text-amber-200"
              }`}
            >
              {daemon.restartReconciliation.status}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {daemon.restartReconciliation.runs} run · {daemon.restartReconciliation.jobs} job direkonsiliasi
            {daemon.restartReconciliation.completedAt
              ? ` · selesai ${new Date(daemon.restartReconciliation.completedAt).toLocaleString("id-ID")}`
              : ""}
          </p>
          {daemon.restartReconciliation.error && (
            <p className="mt-2 text-xs text-rose-300">
              {daemon.restartReconciliation.error}
            </p>
          )}
        </section>
      )}
    </>
  )
}
