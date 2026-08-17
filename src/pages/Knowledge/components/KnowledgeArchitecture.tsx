import React from "react"
import { FolderTree } from "lucide-react"
import type { KnowledgeArchitectureProps } from "../types"

export const KnowledgeArchitecture: React.FC<KnowledgeArchitectureProps> = ({ sections }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-white flex items-center gap-2">
        <FolderTree className="h-5 w-5 text-indigo-400" />
        01-Knowledge Architecture
      </h2>

      <div className="space-y-3">
        {sections.map((sec) => (
          <div
            key={sec.title}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-200">{sec.title}</span>
              <span className="font-mono text-[10px] text-slate-500">{sec.path}</span>
            </div>
            <p className="text-xs text-slate-400">{sec.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
