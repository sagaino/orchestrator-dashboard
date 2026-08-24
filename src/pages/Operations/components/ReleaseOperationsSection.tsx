import React from "react"
import { Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReleaseMetric } from "./ReleaseMetric"
import { ReleaseEvidenceCard } from "./ReleaseEvidenceCard"
import type { ReleaseOperationsSectionProps } from "../types"

export const ReleaseOperationsSection: React.FC<ReleaseOperationsSectionProps> = ({
  release,
  releaseLoading,
  confirmed,
  onConfirmedChange,
  activationNotice,
  onPrepareActivation,
}) => {
  const pendingTotal = release?.queueDrain.pending?.total ?? 0
  const stopDaemonOnly = release?.queueDrain.activation?.daemonStopOnly === true
  const queueMetric = release?.queueDrain.drained
    ? { value: "DRAINED", detail: "Tidak ada pekerjaan aktif." }
    : stopDaemonOnly
      ? {
          value: "STOP REQUIRED",
          detail: "Ledger kosong; daemon perlu dihentikan supervisor eksternal.",
        }
      : pendingTotal > 0
        ? {
            value: "PENDING WORK",
            detail: `${pendingTotal} pekerjaan aktif/uncertain.`,
          }
        : {
            value: "BLOCKED",
            detail: `${release?.queueDrain.blockers.length ?? 0} blocker evidence.`,
          }

  return (
    <section
      className="rounded-xl border border-indigo-500/25 bg-indigo-950/10 p-5"
      aria-labelledby="release-operations-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-indigo-300">P6.4 · Release Operations</p>
          <h3 id="release-operations-title" className="text-xl font-semibold text-white">
            Guarded release
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Bukti kandidat dan kesiapan aktivasi ditampilkan terpisah dari eksekusi supervisor.
          </p>
        </div>
        {release && (
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              release.activation.eligible
                ? "border-amber-400/40 text-amber-200"
                : "border-rose-400/40 text-rose-200"
            }`}
          >
            {release.activation.state}
          </span>
        )}
      </div>

      {releaseLoading ? (
        <div className="mt-5 text-sm text-slate-400">Memuat release evidence…</div>
      ) : release ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ReleaseMetric
              label="Current runtime"
              value={release.current.runtimeVersion}
              detail="stable"
            />
            <ReleaseMetric
              label="Candidate"
              value={release.candidate.runtimeVersion || "Tidak tersedia"}
              detail={release.candidate.releaseId || release.candidate.status}
            />
            <ReleaseMetric
              label="Compatibility"
              value={release.compatibility.outcome}
              detail={
                release.compatibility.errors.length
                  ? `${release.compatibility.errors.length} error`
                  : "contract valid"
              }
              tone={release.compatibility.compatible ? "good" : "bad"}
            />
            <ReleaseMetric
              label="Queue drain"
              value={queueMetric.value}
              detail={queueMetric.detail}
              tone={release.queueDrain.drained ? "good" : "bad"}
            />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <ReleaseEvidenceCard
              title="Backup"
              status={release.backup.status}
              body={release.backup.backupId || "Belum ada backup runtime"}
              detail={
                release.backup.backedUpAt
                  ? `Backed up ${new Date(release.backup.backedUpAt).toLocaleString("id-ID")}${
                      release.backup.verifiedAt
                        ? ` · verified ${new Date(release.backup.verifiedAt).toLocaleString("id-ID")}`
                        : ""
                    }`
                  : "Rollback belum siap"
              }
            />
            <ReleaseEvidenceCard
              title="Health checks"
              status={release.health.status}
              body={
                release.health.daemon.healthy
                  ? "Daemon healthy"
                  : "Daemon belum healthy"
              }
              detail={
                release.health.daemon.heartbeatAgeMs === null
                  ? "Heartbeat tidak tersedia"
                  : `Heartbeat ${Math.round(release.health.daemon.heartbeatAgeMs / 1000)}s lalu`
              }
            />
            <ReleaseEvidenceCard
              title="Rollback evidence"
              status={release.rollback.evidenceStatus}
              body={release.rollback.backupId || "Missing"}
              detail={release.rollback.message}
            />
          </div>

          <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/50 p-4">
            <div className="flex items-start gap-3">
              <Circle className="mt-0.5 h-4 w-4 text-amber-300" />
              <div>
                <p className="font-medium text-slate-100">Konfirmasi aktivasi eksternal</p>
                <p className="mt-1 text-sm text-slate-400">
                  UI ini tidak mengaktifkan kandidat. Supervisor eksternal tetap membutuhkan identitas OS, session, nonce, dan konfirmasi manusia.
                </p>
              </div>
            </div>
            <label className="mt-3 flex items-start gap-2 text-sm text-slate-300">
              <input
                aria-label="Saya memahami aktivasi dilakukan oleh external supervisor"
                type="checkbox"
                checked={confirmed}
                disabled={!release.activation.eligible}
                onChange={(event) => onConfirmedChange(event.target.checked)}
              />
              <span>
                Saya memahami bahwa aktivasi dan rollback dilakukan oleh{" "}
                <code className="text-indigo-300">external-supervisor</code>.
              </span>
            </label>
            <Button
              className="mt-3"
              disabled={!release.activation.eligible || !confirmed}
              onClick={onPrepareActivation}
            >
              Siapkan konfirmasi aktivasi
            </Button>
            {activationNotice && (
              <p role="status" className="mt-3 text-sm text-emerald-300">
                {activationNotice}
              </p>
            )}
          </div>
        </>
      ) : null}
    </section>
  )
}
