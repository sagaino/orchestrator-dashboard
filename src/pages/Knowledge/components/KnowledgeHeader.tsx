import React from "react"
import { RefreshCw } from "lucide-react"
import type { KnowledgeHeaderProps } from "../types"

export const KnowledgeHeader: React.FC<KnowledgeHeaderProps> = ({ loading, onRefresh }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Knowledge Center & Vault Governance</h1>
        <p className="text-sm text-slate-400">
          Persistent global knowledge layer di Obsidian Vault. Evaluasi calon pengetahuan (Candidates) dan pantau kesehatan link.
        </p>
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      )}
    </div>
  )
}
