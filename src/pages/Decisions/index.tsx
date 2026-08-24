import React from "react"
import { useDecisions } from "./hooks"
import { useOperationsReadiness } from "@/hooks/use-orchestrator"
import {
  DecisionHeader,
  DecisionSummaryCards,
  DecisionList,
  ConfirmResolutionDialog,
} from "./components"

export const DecisionsPage: React.FC = () => {
  const { data: operationsReadiness } = useOperationsReadiness()
  const {
    decisions,
    isLoading,
    isFetching,
    isError,
    isResolving,
    notice,
    pending,
    summary,
    refetch,
    handleSelectAction,
    handleCloseDialog,
    handleConfirmResolution,
  } = useDecisions()

  const finalAcceptOnly = operationsReadiness?.signals.runtimeConfig?.automation?.approvalMode === "FINAL_ACCEPT_ONLY"

  return (
      <div className="w-full space-y-6 pb-12">
      <DecisionHeader isFetching={isFetching} onRefresh={() => { void refetch() }} />
      {finalAcceptOnly && (
        <section className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 px-5 py-4 text-sm text-indigo-100">
          <p className="font-semibold">Autopilot aktif</p>
          <p className="mt-1 text-indigo-200/80">
            Retry, recovery, preview, dan certification rutin diproses otomatis. Halaman ini hanya menampilkan pengecualian yang
            memang membutuhkan keputusan operator, misalnya perubahan scope, permission, atau risiko yang tidak aman untuk dipaksa.
          </p>
        </section>
      )}
      <DecisionSummaryCards summary={summary} />
      <DecisionList
        decisions={decisions}
        isLoading={isLoading}
        isError={isError}
        notice={notice}
        onSelectAction={handleSelectAction}
      />
      <ConfirmResolutionDialog
        pending={pending}
        isPending={isResolving}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog()
        }}
        onConfirm={handleConfirmResolution}
      />
    </div>
  )
}

export default DecisionsPage
