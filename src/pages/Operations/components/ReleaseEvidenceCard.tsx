import React from "react"
import type { ReleaseEvidenceCardProps } from "../types"

export const ReleaseEvidenceCard: React.FC<ReleaseEvidenceCardProps> = ({
  title,
  status,
  body,
  detail,
}) => {
  const good = ["PASS", "READY", "AVAILABLE"].includes(status)
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <span
          className={`rounded border px-2 py-0.5 text-xs ${
            good
              ? "border-emerald-500/30 text-emerald-300"
              : "border-amber-500/30 text-amber-200"
          }`}
        >
          {status}
        </span>
      </div>
      <p className="mt-3 truncate text-sm text-slate-100" title={body}>
        {body}
      </p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  )
}
