import React from "react"
import { CheckCircle2 } from "lucide-react"
import { DecisionCard } from "./DecisionCard"
import type { DecisionListProps } from "../types"

export const DecisionList: React.FC<DecisionListProps> = ({
  decisions,
  isLoading,
  isError,
  notice,
  onSelectAction,
}) => {
  return (
    <div className="space-y-4">
      {notice && (
        <div role="status" className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-3 text-sm text-indigo-200">
          {notice}
        </div>
      )}
      {isError && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5 text-sm text-rose-200">
          Decision Inbox tidak dapat dimuat. Periksa koneksi daemon lalu coba lagi.
        </div>
      )}
      {isLoading && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-slate-400">
          Memuat decision inbox…
        </div>
      )}
      {!isLoading && !isError && decisions.length === 0 && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" />
          <h3 className="mt-3 font-semibold text-emerald-100">Tidak ada decision terbuka</h3>
          <p className="mt-1 text-sm text-emerald-200/70">Semua decision durable sudah ditinjau atau belum ada blocker baru.</p>
        </div>
      )}
      <div className="space-y-4" aria-label="Unresolved decisions">
        {decisions.map((decision) => (
          <DecisionCard key={decision.decisionId} decision={decision} onSelectAction={onSelectAction} />
        ))}
      </div>
    </div>
  )
}
