import React, { useState } from "react"
import { Image, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ObjectiveVisualEvidencePanelProps } from "../types"

export const ObjectiveVisualEvidencePanel: React.FC<ObjectiveVisualEvidencePanelProps> = ({
  report,
  onRepair,
  repairing,
}) => {
  const [repairNodeId, setRepairNodeId] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  if (!report) return null

  const submitRepair = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!repairNodeId || !reason.trim()) return
    try {
      await onRepair(repairNodeId, reason.trim())
      setMessage("Repair path disetujui dan revision lifecycle sudah dimulai.")
      setRepairNodeId(null)
      setReason("")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Repair path tidak dapat dibuat.")
    }
  }

  return (
    <section className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-violet-300" />
            <h2 className="text-sm font-semibold text-white">Objective visual & E2E evidence</h2>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Report ini menautkan evidence per-run; artifact screenshot tidak diduplikasi. Ownership tetap terlihat per node dan project.
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-400">
          <div>
            {report.summary.evidenceCount} visual checks · {report.summary.captureCount} captures
          </div>
          <div>
            {report.summary.projectCount} project · {report.summary.viewports.join(", ") || "No viewport"}
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {report.nodes.map((node) => (
          <div key={node.nodeId} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-violet-200">{node.nodeId} · {node.projectId}</p>
                <p className="mt-1 text-[11px] text-slate-500">Run: {node.runId ?? "—"} · State: {node.runState ?? "NO_RUN"}</p>
              </div>
              {node.requestChanges.available && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={repairing}
                  onClick={() => {
                    setRepairNodeId(node.nodeId)
                    setMessage(null)
                  }}
                  className="gap-1.5 border-violet-500/30 text-violet-200 hover:bg-violet-500/10"
                >
                  <RefreshCw className="h-3.5 w-3.5" />Request changes
                </Button>
              )}
            </div>
            {node.verificationChecks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {node.verificationChecks.map((check, index) => (
                  <span
                    key={`${String(check.command ?? check.script ?? "check")}-${index}`}
                    className="rounded border border-slate-700 px-2 py-1 text-[10px] text-slate-300"
                  >
                    {String(check.command ?? check.script ?? "check")} · {String(check.status ?? "UNKNOWN")}
                  </span>
                ))}
              </div>
            )}
            {node.evidenceRefs.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500">
                Belum ada visual capture untuk node ini; status visual tetap UNKNOWN.
              </p>
            ) : (
              <div className="mt-3 grid gap-2 lg:grid-cols-2">
                {node.evidenceRefs.map((item) => (
                  <div key={item.evidenceId} className="rounded border border-slate-800 p-2 text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-violet-200 hover:text-violet-100"
                      >
                        {item.evidenceId}
                      </a>
                      <span className="text-slate-500">
                        {item.viewport.name} · {item.viewport.width}×{item.viewport.height}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-400">
                      Route: <span className="font-mono text-slate-200">{item.route}</span>
                    </p>
                    <p className="mt-1 text-slate-500">
                      Comparison: <span className="text-slate-300">{item.checks.comparisonStatus}</span> · Accessibility:{" "}
                      <span className="text-slate-300">{item.checks.accessibilityStatus}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
            {node.captureRefs.length > 0 && (
              <p className="mt-3 text-[11px] text-slate-500">
                Capture jobs: {node.captureRefs.map((capture) => `${capture.captureId} (${capture.status})`).join(", ")}
              </p>
            )}
            {repairNodeId === node.nodeId && (
              <form onSubmit={submitRepair} className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                <label className="text-[11px] text-violet-200" htmlFor={`repair-reason-${node.nodeId}`}>
                  Alasan request changes
                </label>
                <textarea
                  id={`repair-reason-${node.nodeId}`}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Contoh: perbaiki overflow pada mobile viewport"
                  className="mt-2 min-h-20 w-full rounded border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200 outline-none focus:border-violet-400"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setRepairNodeId(null)}>
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={repairing || !reason.trim()}
                    className="gap-1.5 bg-violet-600 text-white hover:bg-violet-500"
                  >
                    {repairing ? "Memulai…" : "Approve repair"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
      {message && <p className="mt-3 text-xs text-violet-200">{message}</p>}
    </section>
  )
}
