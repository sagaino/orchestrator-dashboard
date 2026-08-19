import React from "react"
import { FileCode, Globe, Brain } from "lucide-react"
import { DiffViewer } from "@/components/diff/DiffViewer"
import { DevServerController } from "@/components/review/DevServerController"
import { RunActionToolbar } from "./RunActionToolbar"
import { RunOverviewTab } from "./RunOverviewTab"
import { RunExecutionTimeline } from "./RunExecutionTimeline"
import { RunRetrospectiveTab } from "./RunRetrospectiveTab"
import type { RunInspectorProps } from "../types"

export const RunInspector: React.FC<RunInspectorProps> = ({
  selectedRun,
  activeTab,
  onTabChange,
  actionLoading,
  diffData,
  diffLoading,
  inlineComments = [],
  onAddInlineComment,
  onRemoveInlineComment,
  onPreview,
  onStart,
  onRequestChanges,
  onAccept,
  onReject,
  onRecover,
  onRetry,
}) => {
  if (!selectedRun) {
    return (
      <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
        Pilih sebuah Run untuk melihat detail inspeksi.
      </div>
    )
  }

  return (
    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
      {/* Header Details */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white">{selectedRun.task.id}</h2>
            <span className="px-2.5 py-0.5 rounded-full font-mono text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
              {selectedRun.state}
            </span>
          </div>
          <p className="font-mono text-xs text-slate-400 mt-1">{selectedRun.runId}</p>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
          {selectedRun.project.id}
        </span>
      </div>

      {/* Action Toolbar for Human Review */}
      <RunActionToolbar
        selectedRun={selectedRun}
        actionLoading={actionLoading}
        onPreview={onPreview}
        onStart={onStart}
        onRequestChanges={onRequestChanges}
        onAccept={onAccept}
        onReject={onReject}
        onRecover={onRecover}
        onRetry={onRetry}
      />

      {/* Execution Timeline / State Stepper */}
      <RunExecutionTimeline
        history={selectedRun.history}
        currentState={selectedRun.state}
      />

      {/* Inspector Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs overflow-x-auto">
        <button
          onClick={() => onTabChange("OVERVIEW")}
          className={`pb-2.5 font-semibold px-2 border-b-2 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t whitespace-nowrap ${
            activeTab === "OVERVIEW"
              ? "text-indigo-400 border-indigo-500"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          Overview & Verification
        </button>
        <button
          onClick={() => onTabChange("DIFF")}
          className={`pb-2.5 font-semibold px-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t whitespace-nowrap ${
            activeTab === "DIFF"
              ? "text-indigo-400 border-indigo-500"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          <span>Code Changes (Diff)</span>
          {inlineComments.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
              {inlineComments.length}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange("QA")}
          className={`pb-2.5 font-semibold px-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t whitespace-nowrap ${
            activeTab === "QA"
              ? "text-indigo-400 border-indigo-500"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Visual QA Dev Server</span>
        </button>
        <button
          onClick={() => onTabChange("RETROSPECTIVE")}
          className={`pb-2.5 font-semibold px-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t whitespace-nowrap ${
            activeTab === "RETROSPECTIVE"
              ? "text-indigo-400 border-indigo-500"
              : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          <Brain className="h-3.5 w-3.5" />
          <span>Retrospective</span>
        </button>
      </div>

      {/* Tab 1: Overview & Verification */}
      {activeTab === "OVERVIEW" && <RunOverviewTab selectedRun={selectedRun} />}

      {/* Tab 2: Code Changes & Diff */}
      {activeTab === "DIFF" && (
        <div className="space-y-4">
          <DiffViewer
            diffData={diffData ?? null}
            loading={diffLoading}
            comments={inlineComments}
            onAddComment={onAddInlineComment}
            onRemoveComment={onRemoveInlineComment}
          />
        </div>
      )}

      {/* Tab 3: Visual QA Dev Server */}
      {activeTab === "QA" && (
        <div className="space-y-4">
          <DevServerController
            runId={selectedRun.runId}
            workspaceExists={diffData?.workspaceExists ?? true}
          />
        </div>
      )}

      {/* Tab 4: Retrospective & Knowledge Routing */}
      {activeTab === "RETROSPECTIVE" && (
        <RunRetrospectiveTab selectedRun={selectedRun} />
      )}
    </div>
  )
}
