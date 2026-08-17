import React from "react"
import { FileText, Play, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import type { TaskIntakeFormProps } from "../types"

export const TaskIntakeForm: React.FC<TaskIntakeFormProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  prompt,
  onPromptChange,
  autoStart,
  onAutoStartChange,
  statusMessage,
  submitting,
  onSubmit,
}) => {
  return (
    <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-5">
      <h2 className="text-base font-semibold text-white flex items-center gap-2">
        <FileText className="h-5 w-5 text-indigo-400" />
        Canonical Task Intake Form
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Target Repository / Project
          </label>
          <select
            value={selectedProject}
            onChange={(e) => onSelectProject(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} ({p.repository})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Natural Language Instruction
          </label>
          <textarea
            rows={6}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Deskripsikan fitur, refactor, atau perbaikan bug yang diinginkan secara spesifik..."
            className="w-full px-3.5 py-3 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none font-sans"
          />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoStart"
              checked={autoStart}
              onChange={(e) => onAutoStartChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
            <label htmlFor="autoStart" className="text-xs text-slate-300">
              <span className="font-medium block text-slate-200">Auto-Start Execution</span>
              Langsung klaim dan jalankan di isolated git worktree setelah lolos readiness gate
            </label>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-lg text-xs flex items-center gap-2.5 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !prompt.trim()}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {submitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Submit & Queue Task</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
