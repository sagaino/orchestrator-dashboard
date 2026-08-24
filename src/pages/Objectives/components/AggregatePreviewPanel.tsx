import React from "react"
import { ExternalLink, Layers3, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./StatusBadge"
import type { AggregatePreviewPanelProps } from "../types"

export const AggregatePreviewPanel: React.FC<AggregatePreviewPanelProps> = ({
  preview,
  onStop,
  stopping,
}) => {
  if (!preview) return null

  return (
    <section className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-cyan-300" />
            <h2 className="text-sm font-semibold text-white">Aggregate project preview</h2>
            <StatusBadge state={preview.status} />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Loopback-only URLs untuk project runnable. Preview unavailable tidak dihitung sebagai verification failure.
          </p>
        </div>
        {preview.cleanup.status === "ACTIVE" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={stopping}
            onClick={onStop}
            className="gap-2 border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            <Square className="h-3.5 w-3.5" />
            {stopping ? "Cleaning…" : "Stop preview"}
          </Button>
        )}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {preview.previews.map((item) => (
          <div key={item.projectId} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-emerald-200">{item.projectId}</span>
              <StatusBadge state={item.status} />
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center gap-1 break-all font-mono text-xs text-cyan-300 hover:text-cyan-200"
            >
              {item.url}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        ))}
        {preview.unavailable.map((item, index) => (
          <div
            key={`${item.projectId ?? "project"}-${index}`}
            className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-amber-200">{item.projectId ?? "Unknown project"}</span>
              <StatusBadge state="UNAVAILABLE" />
            </div>
            <p className="mt-2 text-amber-100/80">{item.message ?? item.reason}</p>
            <p className="mt-1 text-[11px] text-slate-500">Verification: NOT EVALUATED</p>
          </div>
        ))}
      </div>
    </section>
  )
}
