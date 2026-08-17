import React from "react"
import { Cpu, RefreshCw } from "lucide-react"
import type { LiveJobQueueProps } from "../types"

export const LiveJobQueue: React.FC<LiveJobQueueProps> = ({ jobs, onRefresh }) => {
  return (
    <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Cpu className="h-5 w-5 text-emerald-400" />
          Live Job Queue & Worker Pool
        </h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs text-slate-400 hover:text-slate-200 p-1 transition-colors"
            title="Refresh queue"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="p-8 text-center rounded-lg border border-dashed border-slate-800 text-slate-500 text-xs">
          Tidak ada background job yang sedang aktif.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {jobs.map((job) => {
            const isRunning = job.state === "RUNNING"
            const isDone = job.state === "DONE"
            const isFailed = job.state === "FAILED"
            return (
              <div
                key={job.jobId}
                className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{job.taskId}</span>
                    <span className="font-mono text-[10px] text-slate-400">({job.project})</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]">{job.jobId}</p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold uppercase ${
                    isRunning
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse"
                      : isDone
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : isFailed
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {job.state}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
