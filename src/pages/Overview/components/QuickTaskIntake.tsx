import React from "react"
import { Sparkles, CheckCircle2, Play } from "lucide-react"
import type { QuickTaskIntakeProps } from "../types/overview"

export const QuickTaskIntake: React.FC<QuickTaskIntakeProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  prompt,
  onPromptChange,
  submitting,
  successMessage,
  onSubmit,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-400" />
        Quick Task Intake
      </h2>

      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <p className="text-xs text-slate-400">
          Kirim instruksi fitur/bugfix dengan bahasa alami. Orchestrator akan merancang canonical task di Wiki dan menjalankannya secara otonom.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Project</label>
            <select
              value={selectedProject}
              onChange={(e) => onSelectProject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Natural Language Prompt</label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Contoh: Tambahkan tombol toggle dark mode pada Navbar dan pastikan typecheck lolos..."
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
            />
          </div>

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !prompt.trim()}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            {submitting ? (
              <span>Planning & Queuing...</span>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Dispatch Task to Agent</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
