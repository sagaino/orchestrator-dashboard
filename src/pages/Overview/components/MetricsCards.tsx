import React from "react"
import { Cpu, AlertTriangle, FolderGit2, CheckCircle2, ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
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
      <Link
        to="/operations"
        className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 backdrop-blur-sm transition-all group block cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-300 transition-colors">Worker Slots</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
            <Cpu className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">
            {daemon ? `${daemon.parallel.activeWorkers} / ${daemon.parallel.maxWorkers}` : "0 / 2"}
          </span>
          <span className="text-xs text-slate-400">slots aktif</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>Kapasitas worker pool</span>
          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
        </div>
      </Link>

      {/* Metric 2: Review Ready */}
      <Link
        to="/runs?filter=REVIEW"
        className={`p-5 rounded-xl border backdrop-blur-sm transition-all group block cursor-pointer ${
          reviewCount > 0
            ? "bg-amber-500/10 border-amber-500/40 hover:border-amber-500/60 hover:bg-amber-500/15 ring-1 ring-amber-500/20"
            : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${reviewCount > 0 ? "text-amber-300" : "text-slate-400"}`}>
            Review Ready
          </span>
          <div className={`p-2 rounded-lg ${reviewCount > 0 ? "bg-amber-500/20 text-amber-300" : "bg-amber-500/10 text-amber-400"}`}>
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${reviewCount > 0 ? "text-amber-300" : "text-amber-400"}`}>{reviewCount}</span>
          <span className="text-xs text-slate-400">menunggu keputusan</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>Human review gate</span>
          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-amber-300 transition-opacity" />
        </div>
      </Link>

      {/* Metric 3: Active Projects */}
      <Link
        to="/tasks"
        className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 backdrop-blur-sm transition-all group block cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-300 transition-colors">Active Projects</span>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
            <FolderGit2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{projectCount}</span>
          <span className="text-xs text-emerald-400 font-medium">terdaftar di Wiki</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>Graphify & sandbox</span>
          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
        </div>
      </Link>

      {/* Metric 4: Total Tasks Done */}
      <Link
        to="/runs?filter=DONE"
        className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 backdrop-blur-sm transition-all group block cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-300 transition-colors">Total Tasks Done</span>
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition-colors">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{completedCount}</span>
          <span className="text-xs text-slate-400">tasks selesai</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>Terverifikasi & sinkron</span>
          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
        </div>
      </Link>
    </div>
  )
}
