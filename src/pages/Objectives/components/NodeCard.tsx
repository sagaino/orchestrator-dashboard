import React from "react"
import { Brain, Eye, FileDiff, RotateCcw, ShieldCheck, Terminal, XCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./StatusBadge"
import type { NodeCardProps } from "../types"

const runPath = (runId: string, tab: "OVERVIEW" | "DIFF" | "LOGS" | "QA" | "RETROSPECTIVE") =>
  `/runs?runId=${encodeURIComponent(runId)}&tab=${tab}`

const runLinkClass = "inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200"

export const NodeCard: React.FC<NodeCardProps> = ({ node, onRequestRetry, retrying }) => {
  const showLogs = Boolean(
    node.runId &&
      (node.error || ["FAILED", "BLOCKED"].includes(String(node.state).toUpperCase())),
  )

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-indigo-300">{node.nodeId} · {node.type}</p>
          <h3 className="mt-1 text-sm font-semibold text-white">{node.title}</h3>
          <p className="mt-1 text-xs text-slate-400">{node.projectId} · {node.role}</p>
        </div>
        <StatusBadge state={node.state} />
      </div>
      <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Run</p>
          <p className="mt-1 break-all font-mono text-slate-300">{node.runId ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Commit</p>
          <p className="mt-1 break-all font-mono text-slate-300">{node.commitHash ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Verification</p>
          <div className="mt-1">
            <StatusBadge state={node.verificationStatus} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {node.runId ? (
          <>
            <Link className={runLinkClass} to={runPath(node.runId, "OVERVIEW")}>
              <ShieldCheck className="h-3.5 w-3.5" />Evidence
            </Link>
            <Link className={runLinkClass} to={runPath(node.runId, "DIFF")}>
              <FileDiff className="h-3.5 w-3.5" />Diff
            </Link>
            <Link className={runLinkClass} to={runPath(node.runId, "QA")}>
              <Eye className="h-3.5 w-3.5" />Preview
            </Link>
            <Link className={runLinkClass} to={runPath(node.runId, "RETROSPECTIVE")}>
              <Brain className="h-3.5 w-3.5" />Review in Runs
            </Link>
            {showLogs && (
              <Link className={runLinkClass} to={runPath(node.runId, "LOGS")}>
                <Terminal className="h-3.5 w-3.5" />View Logs
              </Link>
            )}
          </>
        ) : (
          node.links.evidence && (
            <a className={runLinkClass} href={node.links.evidence} target="_blank" rel="noreferrer">
              <ShieldCheck className="h-3.5 w-3.5" />Evidence
            </a>
          )
        )}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Changed paths: {node.changedPaths.length ? node.changedPaths.join(", ") : "Tidak ada"}
      </p>
      {node.error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-rose-300">
          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {node.error.message ?? "Node memiliki error."}
        </p>
      )}
      {node.state === "FAILED" && onRequestRetry && (
        <Button
          type="button"
          size="sm"
          className="mt-3 gap-2 bg-indigo-600 text-white hover:bg-indigo-500"
          disabled={retrying}
          onClick={() => onRequestRetry(node)}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {retrying ? "Membuat decision…" : "Request retry"}
        </Button>
      )}
    </article>
  )
}
