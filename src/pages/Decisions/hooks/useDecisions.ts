import { useMemo, useState } from "react"
import { useDecisionInbox, useResolveDecision } from "@/hooks/use-orchestrator"
import type { DecisionInboxItem } from "@/services/orchestrator"
import type { PendingDecision, UseDecisionsReturn } from "../types"

export const useDecisions = (): UseDecisionsReturn => {
  const { data: decisions = [], isLoading, isFetching, isError, refetch } = useDecisionInbox()
  const resolve = useResolveDecision()
  const [pending, setPending] = useState<PendingDecision | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const summary = useMemo(() => ({
    high: decisions.filter((decision) => decision.risk === "HIGH").length,
    total: decisions.length,
  }), [decisions])

  const handleSelectAction = (decision: DecisionInboxItem, action: string) => {
    setPending({ decision, action })
  }

  const handleCloseDialog = () => {
    if (!resolve.isPending) {
      setPending(null)
    }
  }

  const handleConfirmResolution = async () => {
    if (!pending) return
    setNotice(null)
    try {
      const result = await resolve.mutateAsync({ decisionId: pending.decision.decisionId, action: pending.action })
      setNotice(result.alreadyResolved ? "Decision sudah diselesaikan sebelumnya; tampilan disegarkan tanpa perubahan kedua." : `Decision ${pending.decision.decisionId} diselesaikan dengan action ${pending.action}.`)
      setPending(null)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Decision gagal diselesaikan.")
    }
  }

  return {
    decisions,
    isLoading,
    isFetching,
    isError,
    isResolving: resolve.isPending,
    notice,
    pending,
    summary,
    refetch,
    handleSelectAction,
    handleCloseDialog,
    handleConfirmResolution,
  }
}
