import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, ListTree, Workflow, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useObjectiveGraph } from "@/hooks/use-orchestrator"
import type { ObjectiveGraphNode } from "@/services/orchestrator"

function NodeStatus({ node }: { node: ObjectiveGraphNode }) {
  const isReview = node.statusLabel === "REVIEW" || node.statusLabel === "RETROSPECTIVE"
  const isDone = node.statusLabel === "DONE" || node.statusLabel === "COMPLETED"
  const isRunning = ["RUNNING", "EXECUTING", "IN_PROGRESS"].includes(node.statusLabel.toUpperCase())

  const badgeClass = isReview
    ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
    : isDone
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : isRunning
        ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
        : "border-slate-700 text-slate-300"

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeClass}`}>Status: {node.statusLabel}</span>
}

export function ObjectiveGraph({ objectiveId }: { objectiveId: string }) {
  const [page, setPage] = useState(1)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const graphQuery = useObjectiveGraph(objectiveId, page, 50)
  const graph = graphQuery.data

  useEffect(() => {
    setPage(1)
    setSelectedNodeId(null)
  }, [objectiveId])

  useEffect(() => {
    if (graph && selectedNodeId && !graph.nodes.some((node) => node.id === selectedNodeId)) setSelectedNodeId(null)
  }, [graph, selectedNodeId])

  if (graphQuery.isLoading) return <section aria-label="Objective graph" className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-400">Memuat objective graph…</section>
  if (graphQuery.error || !graph) return <section aria-label="Objective graph" className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm text-amber-200">Objective graph belum tersedia.</section>

  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId) ?? null
  return (
    <section aria-labelledby="objective-graph-title" className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2"><Workflow className="h-4 w-4 text-cyan-300" /><div><h2 id="objective-graph-title" className="text-sm font-semibold text-white">Objective graph</h2><p className="mt-1 text-xs text-slate-500">Dependency graph yang deterministik dan terisolasi.</p></div></div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300"><Badge variant="outline" className="border-slate-600 bg-slate-950/50 text-slate-200">{graph.summary.totalNodes} nodes</Badge><Badge variant="outline" className="border-slate-600 bg-slate-950/50 text-slate-200">{graph.summary.totalEdges} edges</Badge><span aria-label="Graph bounded status" className={`inline-flex items-center rounded-full border px-2.5 py-1 font-medium ${graph.bounded ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200" : "border-amber-500/30 bg-amber-500/10 text-amber-200"}`}>{graph.bounded ? "Bounded view" : "Unbounded view"}</span></div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3" role="list" aria-label="Objective graph nodes">
        {graph.nodes.map((node) => <div key={node.id} role="listitem"><button type="button" aria-pressed={selectedNodeId === node.id} onClick={() => setSelectedNodeId((current) => current === node.id ? null : node.id)} className={`w-full rounded-xl border p-4 text-left outline-none transition-all cursor-pointer ${selectedNodeId === node.id ? "border-cyan-400/80 bg-cyan-500/15 ring-1 ring-cyan-400/30" : "border-slate-800 bg-slate-950/50 hover:border-slate-600"}`}>
          <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs text-cyan-300 font-semibold">{node.id} · {node.type}</p><h3 className="mt-1 text-sm font-semibold text-white leading-snug">{node.title}</h3></div><NodeStatus node={node} /></div>
          <p className="mt-3 text-xs text-slate-400 font-mono">Project: {node.projectId} · Role: {node.role}</p>
          <p className="mt-2 text-xs text-slate-500">Dependencies: {node.dependsOn.length ? node.dependsOn.join(", ") : "None"}</p>
        </button></div>)}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"><div className="flex items-center gap-2"><ListTree className="h-4 w-4 text-indigo-300" /><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dependency edges</h3></div><div className="mt-3 space-y-2 text-xs">{graph.edges.length ? graph.edges.map((edge) => <div key={edge.id} className="rounded-lg border border-slate-800 p-2 font-mono text-slate-300"><span>{edge.source}</span><span className="mx-2 text-slate-600">→</span><span>{edge.target}</span><span className="ml-2 text-slate-500">({edge.label})</span></div>) : <p className="text-slate-500">No edges on this page.</p>}</div></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4" aria-live="polite">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected Node Detail</h3>
          {selectedNode ? (
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono font-semibold text-cyan-300">{selectedNode.id} · {selectedNode.type}</p>
                <NodeStatus node={selectedNode} />
              </div>
              <p className="text-sm font-semibold text-white">{selectedNode.title}</p>
              <p className="text-slate-400 leading-relaxed">{selectedNode.purpose}</p>
              <div className="pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <p className="text-slate-400 font-mono text-[11px]">
                  Project: <span className="text-slate-200">{selectedNode.projectId}</span> · Run: <span className="text-indigo-300">{selectedNode.runId ?? "—"}</span>
                </p>
                {selectedNode.runId && (
                  <Link
                    to={`/runs?runId=${encodeURIComponent(selectedNode.runId)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm"
                  >
                    <span>Buka Run & Review</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">Pilih salah satu node di atas untuk melihat detail lengkap dan akses link review.</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4"><p className="text-xs text-slate-500">Page {graph.summary.page} of {graph.summary.totalPages} · {graph.summary.pageSize} nodes/page maximum</p><div className="flex items-center gap-2"><Button type="button" variant="outline" size="sm" disabled={!graph.summary.hasPrevious} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous graph page"><ChevronLeft className="h-4 w-4" />Previous</Button><Button type="button" variant="outline" size="sm" disabled={!graph.summary.hasNext} onClick={() => setPage((current) => current + 1)} aria-label="Next graph page">Next<ChevronRight className="h-4 w-4" /></Button></div></div>
    </section>
  )
}
