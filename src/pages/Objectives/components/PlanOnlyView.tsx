import React from "react"
import { Link } from "react-router-dom"
import { Target } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import { ObjectiveRequestHeading } from "./ObjectiveRequestHeading"
import { ObjectivePlanGate } from "./ObjectivePlanGate"
import type { PlanOnlyViewProps } from "../types"

export const PlanOnlyView: React.FC<PlanOnlyViewProps> = ({ lifecycle }) => {
  return (
    <div className="w-full space-y-6">
      <Link to="/objectives" className="text-xs text-indigo-300 hover:text-indigo-200">
        ← Semua objectives
      </Link>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 shrink-0 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2.5 text-indigo-300">
            <Target className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="mb-1 font-mono text-xs text-indigo-300">{lifecycle.objectiveId}</p>
            <ObjectiveRequestHeading request={lifecycle.request} />
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
          <StatusBadge state={lifecycle.state} />
          <ObjectivePlanGate lifecycle={lifecycle} />
        </div>
      </div>
      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <h2 className="text-sm font-semibold text-amber-200">Execution belum dimulai</h2>
        <p className="mt-2 text-xs text-slate-400">
          Plan revision aktif menunggu human approval. Evidence eksekusi akan tersedia setelah plan disetujui dan dimaterialisasi.
        </p>
      </section>
    </div>
  )
}
