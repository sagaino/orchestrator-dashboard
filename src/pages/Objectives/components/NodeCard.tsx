import React from "react"
import { Brain, Eye, FileDiff, RotateCcw, ShieldCheck, Terminal, XCircle, ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./StatusBadge"
import type { NodeCardProps } from "../types"

const runPath = (runId: string, tab: "OVERVIEW" | "DIFF" | "LOGS" | "QA" | "RETROSPECTIVE") =>
  `/runs?runId=${encodeURIComponent(runId)}&tab=${tab}`

const runLinkClass = "inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"

export const NodeCard: React.FC<NodeCardProps> = ({ node, onRequestRetry, retrying }) => {
  const showLogs = Boolean(
    node.runId &&
      (node.error || ["FAILED", "BLOCKED"].includes(String(node.state).toUpperCase())),
  )

  const isReview = node.state === "REVIEW" || node.state === "RETROSPECTIVE"
  const isRunning = ["RUNNING", "EXECUTING", "CLAIMED", "CLAIMING", "VERIFYING", "SCOPE_AUDIT"].includes(String(node.state).toUpperCase())
  const isDone = node.state === "DONE"
  const isFailed = node.state === "FAILED" || node.state === "BLOCKED"

  const cardBorder = isReview
    ? "border-amber-500/50 bg-amber-500/5 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20"
    : isDone
      ? "border-emerald-500/30 bg-slate-900/60"
      : isRunning
        ? "border-cyan-500/40 bg-cyan-500/5 shadow-md shadow-cyan-500/5"
        : isFailed
          ? "border-rose-500/40 bg-rose-500/5"
          : "border-slate-800 bg-slate-900/50"

  return (
    <article className={`rounded-xl border p-4.5 transition-all ${cardBorder}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-indigo-300 font-semibold">{node.nodeId} · {node.type}</p>
          <h3 className="mt-1 text-sm font-semibold text-white leading-snug">{node.title}</h3>
          <p className="mt-1 text-xs text-slate-400 font-mono">{node.projectId} · {node.role}</p>
        </div>
        <StatusBadge state={node.state} />
      </div>

      <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Run ID</p>
          <p className="mt-1 break-all font-mono text-slate-300">{node.runId ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Commit</p>
          <p className="mt-1 break-all font-mono text-slate-300">{node.commitHash ? `${node.commitHash.slice(0, 8)}…` : "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Verification</p>
          <div className="mt-1">
            <StatusBadge state={node.verificationStatus} />
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs">
        {node.runId ? (
          <>
            <Link className={runLinkClass} to={runPath(node.runId, "OVERVIEW")}>
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Evidence
            </Link>
            <Link className={runLinkClass} to={runPath(node.runId, "DIFF")}>
              <FileDiff className="h-3.5 w-3.5 text-cyan-400" /> Diff
            </Link>
            <Link className={runLinkClass} to={runPath(node.runId, "QA")}>
              <Eye className="h-3.5 w-3.5 text-amber-400" /> Preview
            </Link>
            <Link className={runLinkClass} to={runPath(node.runId, "RETROSPECTIVE")}>
              <Brain className="h-3.5 w-3.5 text-violet-400" /> Runs View
            </Link>
            {showLogs && (
              <Link className={runLinkClass} to={runPath(node.runId, "LOGS")}>
                <Terminal className="h-3.5 w-3.5 text-rose-400" /> View Logs
              </Link>
            )}
          </>
        ) : (
          node.links.evidence && (
            <a className={runLinkClass} href={node.links.evidence} target="_blank" rel="noreferrer">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Evidence
            </a>
          )
        )}
      </div>

      {node.changedPaths.length > 0 && (
        <p className="mt-3 text-xs text-slate-400 font-mono text-[11px] truncate">
          <span className="text-slate-500">Changes: </span>{node.changedPaths.join(", ")}
        </p>
      )}

      {node.error && (
        <p className="mt-2.5 flex items-start gap-1.5 text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span>{node.error.message ?? "Node mengalami kegagalan eksekusi."}</span>
        </p>
      )}

      {/* Prominent Action Callouts based on state */}
      {isReview && node.runId && (
        <div className="mt-3.5 pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Menunggu Review & Persetujuan
          </span>
          <Link
            to={runPath(node.runId, "OVERVIEW")}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span>Review Run Sekarang</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {isRunning && (
        <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-300">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            Agent sedang mengerjakan tugas...
          </span>
          {node.runId && (
            <Link
              to={runPath(node.runId, "LOGS")}
              className="text-xs text-cyan-400 hover:text-cyan-200 flex items-center gap-1 font-mono"
            >
              <Terminal className="h-3.5 w-3.5" /> Live Logs
            </Link>
          )}
        </div>
      )}

      {isDone && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-300 font-mono">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Subtask Verified & Selesai
          </span>
          {node.runId && (
            <Link
              to={runPath(node.runId, "DIFF")}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              Lihat Diff ↗
            </Link>
          )}
        </div>
      )}

      {isFailed && onRequestRetry && (
        <div className="mt-3.5 pt-3 border-t border-rose-500/20 flex items-center justify-between">
          <span className="text-xs text-rose-300">Eksekusi terhenti</span>
          <Button
            type="button"
            size="sm"
            className="gap-2 bg-rose-600 text-white hover:bg-rose-500"
            disabled={retrying}
            onClick={() => onRequestRetry(node)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {retrying ? "Memproses…" : "Restart Subtask"}
          </Button>
        </div>
      )}
    </article>
  )
}
