import React from "react"
import { ArrowRight, Sparkles } from "lucide-react"
import type { QuickTaskIntakeProps } from "../types/overview"

export const QuickTaskIntake: React.FC<QuickTaskIntakeProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  prompt,
  onPromptChange,
  onSubmit,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-400" />
        Task Intake (Objective)
      </h2>

      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <p className="text-xs text-slate-400">
          Semua task baru diproses melalui Objective: buat plan, review, lalu jalankan dengan batas worker dan audit yang jelas.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="overview-task-project" className="block text-xs font-medium text-slate-300 mb-1.5">Target Project</label>
            <select
              id="overview-task-project"
              value={selectedProject}
              onChange={(e) => onSelectProject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="overview-task-prompt" className="block text-xs font-medium text-slate-300 mb-1.5">Natural Language Prompt</label>
            <textarea
              id="overview-task-prompt"
              rows={4}
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Contoh: Tambahkan tombol toggle dark mode pada Navbar dan pastikan typecheck lolos..."
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={!prompt.trim()}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <ArrowRight className="h-4 w-4" />
            <span>Buka Task Intake</span>
          </button>
        </form>
      </div>
    </div>
  )
}
