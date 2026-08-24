import React from "react"
import { useDecisions } from "./hooks"
import {
  DecisionHeader,
  DecisionSummaryCards,
  DecisionList,
  ConfirmResolutionDialog,
} from "./components"

export const DecisionsPage: React.FC = () => {
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

  return (
    <div className="w-full space-y-6 pb-12">
      <DecisionHeader isFetching={isFetching} onRefresh={() => { void refetch() }} />
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
