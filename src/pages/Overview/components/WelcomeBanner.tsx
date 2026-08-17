import React from "react"
import { Sparkles, Play } from "lucide-react"
import type { WelcomeBannerProps } from "../types/overview"

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onLaunchTask }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/70 border border-indigo-500/20 p-8 shadow-xl relative overflow-hidden">
      <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs tracking-wider uppercase">
            <Sparkles className="h-4 w-4" />
            <span>Personal Autonomous Engineering System</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Executive Status Overview</h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Mengontrol dan memantau agen otonom, git worktrees terisolasi, gerbang verifikasi ketat, dan sinkronisasi pengetahuan Wiki secara real-time.
          </p>
        </div>

        <button
          onClick={onLaunchTask}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
        >
          <Play className="h-4 w-4 fill-white" />
          <span>Launch Task Intake</span>
        </button>
      </div>
    </div>
  )
}
