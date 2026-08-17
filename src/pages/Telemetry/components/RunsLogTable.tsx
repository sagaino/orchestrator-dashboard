import React from "react"
import type { RunsLogTableProps } from "../types"

export const RunsLogTable: React.FC<RunsLogTableProps> = ({ runs }) => {
  return (
    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      <h2 className="text-base font-semibold text-white">Recorded Runs Log</h2>
      {runs.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">Belum ada data telemetry yang tercatat.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Task / Run ID</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Total Tokens</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Calls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {runs.map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{r.taskId || r.runId}</td>
                  <td className="py-3 px-4 text-slate-400">{r.projectId}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                      {r.state}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-indigo-300 font-semibold">{r.totalTokens?.toLocaleString() ?? "-"}</td>
                  <td className="py-3 px-4">{r.durationSeconds ? `${r.durationSeconds.toFixed(1)}s` : "-"}</td>
                  <td className="py-3 px-4 text-slate-400">{r.calls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
