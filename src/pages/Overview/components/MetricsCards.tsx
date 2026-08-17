import React from "react"
import { Cpu, AlertTriangle, FolderGit2, CheckCircle2 } from "lucide-react"
import type { MetricsCardsProps } from "../types/overview"

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  daemon,
  reviewCount,
  projectCount,
  completedCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Worker Slots */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Worker Slots</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Cpu className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">
            {daemon ? `${daemon.parallel.activeWorkers} / ${daemon.parallel.maxWorkers}` : "0 / 2"}
          </span>
          <span className="text-xs text-slate-400">slots aktif</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Kapasitas paralel worker pool</p>
      </div>

      {/* Metric 2: Review Ready */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Review Ready</span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400">{reviewCount}</span>
          <span className="text-xs text-slate-400">menunggu keputusan</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Human review gate approval</p>
      </div>

      {/* Metric 3: Active Projects */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</span>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <FolderGit2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{projectCount}</span>
          <span className="text-xs text-emerald-400 font-medium">terdaftar di Wiki</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Graphify & sandbox terkoneksi</p>
      </div>

      {/* Metric 4: Total Tasks Done */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks Done</span>
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{completedCount}</span>
          <span className="text-xs text-slate-400">tasks selesai</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">Terverifikasi & tersinkronisasi Wiki</p>
      </div>
    </div>
  )
}
