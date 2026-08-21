import React from "react"
import { FolderGit2, ArrowUpRight, Trash2 } from "lucide-react"
import type { RegisteredProjectsProps } from "../types/overview"

export const RegisteredProjects: React.FC<RegisteredProjectsProps> = ({
  projects,
  onCreateTask,
  onRemoveProject,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FolderGit2 className="h-5 w-5 text-indigo-400" />
          Registered Projects & Graphify Status
        </h2>
        <span className="text-xs font-mono text-slate-400">{projects.length} Repositories</span>
      </div>

      <div className="space-y-3">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h3 className="font-semibold text-base text-white">{proj.id}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  agent: {proj.agent}
                </span>
                {proj.graphOutputExists ? (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    Graphify Ready
                  </span>
                ) : (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Graphify Needed
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400 break-all">{proj.repository}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <span>Verification Defaults:</span>
                {proj.verificationDefaults.length > 0 ? (
                  proj.verificationDefaults.map((v) => (
                    <span key={v} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {v}
                    </span>
                  ))
                ) : (
                  <span className="italic">none</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onCreateTask(proj.id)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Create Task</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              {onRemoveProject && (
                <button
                  type="button"
                  onClick={() => onRemoveProject(proj.id, proj.repository)}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 transition-colors cursor-pointer"
                  title="Hapus / Archive Project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
