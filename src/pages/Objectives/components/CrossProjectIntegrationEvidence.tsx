import type { ReactNode } from "react"
import { CheckCircle2, CircleAlert, GitBranch, GitCommitHorizontal, Server, ShieldCheck, TestTube2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { IntegrationEvidence, IntegrationRepositoryAcceptance, IntegrationVerificationResult, ObjectiveEvidenceNode } from "@/services/orchestrator"

function ResultBadge({ status }: { status: string | null | undefined }) {
  const value = status || "UNKNOWN"
  const tone = ["PASS", "PASSED", "DONE", "READY_FOR_ACCEPTANCE"].includes(value)
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
    : ["FAIL", "FAILED", "BLOCKED"].includes(value)
      ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
      : "border-slate-600 bg-slate-950/50 text-slate-200"
  return <Badge variant="outline" className={tone}>{value.replaceAll("_", " ")}</Badge>
}

function pathsForProject(integration: IntegrationEvidence, projectId: string) {
  return [...new Set((integration.sourceRuns ?? []).filter((run) => run.projectId === projectId).flatMap((run) => run.changedPaths ?? []))]
}

function runsForProject(integration: IntegrationEvidence, projectId: string) {
  return (integration.sourceRuns ?? []).filter((run) => run.projectId === projectId)
}

function RepositoryCard({ projectId, integration, acceptance }: { projectId: string; integration: IntegrationEvidence; acceptance?: IntegrationRepositoryAcceptance }) {
  const paths = pathsForProject(integration, projectId)
  const runs = runsForProject(integration, projectId)
  const baseline = integration.projectBaselines?.[projectId] ?? acceptance?.baseline ?? null
  const checks = acceptance?.checks ?? []
  return (
    <Card className="border-slate-800 bg-slate-950/40">
      <CardHeader className="border-b border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm text-white"><GitBranch className="h-4 w-4 text-indigo-300" />{projectId}</CardTitle>
            <p className="mt-1 text-xs text-slate-500">Repository inspected · {paths.length ? "changed" : "inspected only"}</p>
          </div>
          <ResultBadge status={acceptance?.acceptance.status ?? "MISSING"} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 text-xs">
        <div className="grid gap-3 sm:grid-cols-3">
          <div><p className="text-[10px] uppercase tracking-wider text-slate-500">Baseline</p><p className="mt-1 break-all font-mono text-slate-300">{baseline ?? "Not captured"}</p></div>
          <div><p className="text-[10px] uppercase tracking-wider text-slate-500">Runs</p><p className="mt-1 font-mono text-slate-300">{acceptance?.runIds.length ?? runs.filter((run) => run.runId).length}</p></div>
          <div><p className="text-[10px] uppercase tracking-wider text-slate-500">Changed paths</p><p className="mt-1 font-mono text-slate-300">{paths.length}</p></div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Diff</p>
          <div className="mt-2 space-y-1 rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-slate-300">
            {paths.length ? paths.map((path) => <p key={path} className="break-all font-mono">{path}</p>) : <p className="text-slate-500">No changed paths.</p>}
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Run evidence</p>
          <div className="mt-2 space-y-1">
            {(acceptance?.runIds.length ? acceptance.runIds : runs.map((run) => run.runId).filter(Boolean)).map((runId) => <p key={runId} className="flex items-center gap-2 break-all font-mono text-slate-300"><GitCommitHorizontal className="h-3.5 w-3.5 shrink-0 text-indigo-300" />{runId}</p>)}
            {!acceptance?.runIds.length && !runs.some((run) => run.runId) && <p className="text-slate-500">No run evidence.</p>}
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Repository checks</p>
          <div className="mt-2 space-y-1">
            {checks.length ? checks.map((check, index) => <div key={`${check.command ?? check.script ?? "check"}-${index}`} className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 p-2"><span className="break-all font-mono text-slate-300">{check.command ?? check.script ?? "Approved check"}</span><ResultBadge status={check.status} /></div>) : <p className="text-slate-500">No per-repository checks.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function VerificationGroup({ title, icon, results }: { title: string; icon: ReactNode; results: IntegrationVerificationResult[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{icon}{title}</div>
      <div className="mt-2 space-y-2">
        {results.length ? results.map((result, index) => <div key={`${result.projectId ?? "project"}-${result.script ?? result.command ?? "check"}-${index}`} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-xs text-slate-200">{result.projectId ?? "cross-project"} · {result.command ?? result.script ?? "approved check"}</span><ResultBadge status={result.status} /></div>
          {result.serviceUrls && Object.keys(result.serviceUrls).length > 0 && <p className="mt-2 break-all text-[11px] text-slate-500">Services: {Object.entries(result.serviceUrls).map(([projectId, url]) => `${projectId}=${url}`).join(" · ")}</p>}
          {typeof result.error === "string" && <p className="mt-2 text-[11px] text-rose-300">{result.error}</p>}
        </div>) : <p className="mt-2 text-xs text-slate-500">No results recorded.</p>}
      </div>
    </div>
  )
}

export function CrossProjectIntegrationEvidence({ integration, objectiveProjectIds, nodes, blockers, canAccept }: { integration: IntegrationEvidence; objectiveProjectIds: string[]; nodes: ObjectiveEvidenceNode[]; blockers: Array<{ id: string; kind: string; state?: string; message: string }>; canAccept: boolean }) {
  const acceptance = integration.repositoryAcceptance ?? []
  const results = integration.crossProjectVerification?.results ?? (integration.verification?.results ?? []).filter((result) => result.scope === "CROSS_PROJECT")
  const contractResults = results.filter((result) => /contract|schema|api/i.test(`${result.script ?? ""} ${result.command ?? ""}`))
  const e2eResults = results.filter((result) => !contractResults.includes(result) && /e2e|browser|playwright|cypress|visual/i.test(`${result.script ?? ""} ${result.command ?? ""}`))
  const otherResults = results.filter((result) => !contractResults.includes(result) && !e2eResults.includes(result))
  const changedProjects = objectiveProjectIds.filter((projectId) => pathsForProject(integration, projectId).length > 0)
  const diagnosisNodes = nodes.filter((node) => node.type === "DIAGNOSTIC" || node.role === "DIAGNOSTIC")
  const diagnosisOutcome = blockers.length ? "BLOCKED — review blockers before final action" : integration.crossProjectVerification?.status === "PASS" ? "READY — diagnosis and cross-project checks passed" : "REVIEW — evidence is incomplete"
  return (
    <section aria-labelledby="cross-project-review" className="space-y-4">
      <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /><div><h2 id="cross-project-review" className="text-sm font-semibold text-white">Cross-project result review</h2><p className="mt-1 text-xs text-slate-500">Satu ringkasan untuk diagnosis, repository, verification, blocker, dan final action.</p></div></div>
      <Card className="border-cyan-500/20 bg-cyan-500/5">
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div><p className="text-[10px] uppercase tracking-wider text-cyan-200/60">Diagnosis outcome</p><p className="mt-2 text-sm font-semibold text-white">{diagnosisOutcome}</p><p className="mt-2 text-xs text-slate-400">{diagnosisNodes.length ? `${diagnosisNodes.length} diagnosis node(s) inspected.` : "No separate diagnosis node recorded."}</p></div>
          <div><p className="text-[10px] uppercase tracking-wider text-cyan-200/60">Repositories</p><p className="mt-2 text-sm font-semibold text-white">{objectiveProjectIds.length} inspected · {changedProjects.length} changed</p><p className="mt-2 text-xs text-slate-400">{objectiveProjectIds.join(" · ")}</p></div>
          <div><p className="text-[10px] uppercase tracking-wider text-cyan-200/60">Final objective action</p><div className="mt-2 flex items-center gap-2">{canAccept ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <CircleAlert className="h-4 w-4 text-amber-300" />}<span className="text-sm font-semibold text-white">{canAccept ? "Acceptance available" : "Review required"}</span></div></div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">{objectiveProjectIds.map((projectId) => <RepositoryCard key={projectId} projectId={projectId} integration={integration} acceptance={acceptance.find((item) => item.projectId === projectId)} />)}</div>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm text-white"><TestTube2 className="h-4 w-4 text-violet-300" />Contract & E2E results <ResultBadge status={integration.crossProjectVerification?.status} /></CardTitle></CardHeader>
        <CardContent className="grid gap-5 pt-0 lg:grid-cols-2"><VerificationGroup title="Contract / API" icon={<ShieldCheck className="h-3.5 w-3.5" />} results={contractResults} /><VerificationGroup title="E2E / browser" icon={<Server className="h-3.5 w-3.5" />} results={[...e2eResults, ...otherResults]} /></CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm text-white"><CircleAlert className="h-4 w-4 text-amber-300" />Blockers & final action</CardTitle></CardHeader>
        <CardContent className="space-y-2 pt-0 text-xs">{blockers.length ? blockers.map((blocker) => <div key={blocker.id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"><span className="font-mono text-amber-200">{blocker.kind} · {blocker.id}</span><p className="mt-1 text-amber-100/80">{blocker.message}</p></div>) : <p className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="h-4 w-4" />No blockers. Final objective action is available from the page header.</p>}</CardContent>
      </Card>
    </section>
  )
}
