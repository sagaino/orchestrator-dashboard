import React from "react"
import { Link } from "react-router-dom"
import { StatusBadge } from "./StatusBadge"
import { requestSections } from "./ObjectiveRequestHeading"
import type { SummaryListProps } from "../types"

export const SummaryList: React.FC<SummaryListProps> = ({ items }) => {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Objectives</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Objective evidence center</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Pilih objective untuk meninjau outcome node, diff, preview, verification, blocker, usage, dan final acceptance.
        </p>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
          Belum ada objective.
        </div>
      ) : (
        items.map((item) => {
          const { title, details } = requestSections(item.request)
          return (
            <Link
              key={item.objectiveId}
              to={`/objectives/${encodeURIComponent(item.objectiveId)}`}
              className="group block rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-indigo-500/40 hover:bg-slate-900 sm:p-6"
            >
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-indigo-300">{item.objectiveId}</p>
                  <h2 className="mt-2 line-clamp-2 max-w-4xl text-base font-semibold leading-snug text-white sm:text-lg">
                    {title}
                  </h2>
                  {details && (
                    <p className="mt-2 line-clamp-2 max-w-4xl text-sm leading-6 text-slate-400">
                      {details}
                    </p>
                  )}
                </div>
                <StatusBadge state={item.state} />
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Projects
                </span>
                {item.projectIds.map((projectId) => (
                  <span
                    key={projectId}
                    className="rounded-md border border-slate-700/80 bg-slate-950/40 px-2 py-1 text-xs text-slate-400"
                  >
                    {projectId}
                  </span>
                ))}
                <span className="ml-auto text-xs font-medium text-indigo-300 transition-colors group-hover:text-indigo-200">
                  Buka objective →
                </span>
              </div>
            </Link>
          )
        })
      )}
    </div>
  )
}
