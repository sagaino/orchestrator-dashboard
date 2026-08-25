import React from "react"
import { Link } from "react-router-dom"
import {
  ExternalLink,
  Sparkles,
  RotateCcw,
  Check,
  X,
  Wrench,
  ArrowRight,
} from "lucide-react"
import type { RunActionToolbarProps } from "../types"

export const RunActionToolbar: React.FC<RunActionToolbarProps> = ({
  selectedRun,
  actionLoading,
  onPreview,
  onStart,
  onRequestChanges,
  onAccept,
  onReject,
  onRecover,
}) => {
  const taskFailed = String(selectedRun.task.status ?? "").toUpperCase() === "FAILED"
  const objectiveId = selectedRun.task.objectiveId ?? selectedRun.execution?.orchestration?.objectiveId ?? null
  const orchestrationManaged = selectedRun.task.orchestrationManaged === true || Boolean(objectiveId)
  const legacyObjectivePath = `/tasks?projectId=${encodeURIComponent(selectedRun.project.id)}&prompt=${encodeURIComponent(selectedRun.task.title || selectedRun.task.id)}`

  return (
    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Human Review Actions
        </span>
        <span className="text-[11px] text-slate-400 font-mono">allow_self_accept: false</span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {/* Preview in VS Code */}
        <button
          onClick={() => onPreview(selectedRun.runId)}
          disabled={actionLoading}
          className="px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Preview in VS Code</span>
        </button>

        {/* Legacy start/approval remains available only for legacy runs. */}
        {!orchestrationManaged && (selectedRun.state === "PENDING_APPROVAL" || selectedRun.state === "APPROVED") && (
          <button
            onClick={() => onStart(selectedRun.runId)}
            disabled={actionLoading}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Approve & Execute</span>
          </button>
        )}

        {/* Review Actions if state == REVIEW or RETROSPECTIVE */}
        {(selectedRun.state === "REVIEW" || selectedRun.state === "RETROSPECTIVE") && (
          <>
            <button
              onClick={onRequestChanges}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Request Changes</span>
            </button>

            <button
              onClick={() => onAccept(selectedRun.runId)}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Accept & Sync Wiki</span>
            </button>

            <button
              onClick={() => onReject(selectedRun.runId)}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reject</span>
            </button>

            {objectiveId && (
              <Link
                to={`/objectives/${encodeURIComponent(objectiveId)}`}
                className="px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-medium text-indigo-200 flex items-center gap-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>Lihat Objective</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </>
        )}

        {/* Failed actions */}
        {selectedRun.state === "FAILED" && (
          <>
            {!orchestrationManaged && <button
              onClick={() => onRecover(selectedRun.runId)}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Wrench className="h-3.5 w-3.5" />
              <span>Recover verification</span>
            </button>}

            {orchestrationManaged && objectiveId ? (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/objectives/${encodeURIComponent(objectiveId)}`}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Buka Objective & Restart Subtask</span>
                </Link>
                <Link
                  to="/decisions"
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>Decision Inbox</span>
                </Link>
              </div>
            ) : !orchestrationManaged && taskFailed ? (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={legacyObjectivePath}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white flex items-center gap-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Buat Objective pengganti</span>
                </Link>
                <span className="max-w-sm text-[11px] leading-relaxed text-slate-400">Task ini berasal dari flow lama. Buat Objective baru untuk menjalankan pekerjaan melalui flow autopilot.</span>
              </div>
            ) : (
              <p className="max-w-sm text-[11px] leading-relaxed text-slate-400">
                Retry node dapat dilakukan langsung dari halaman Objective atau melalui Decision Inbox.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
