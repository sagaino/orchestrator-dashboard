import { useMemo, useState } from "react"
import { useDecisionInbox, useResolveDecision } from "@/hooks/use-orchestrator"
import { toast } from "@/components/ui/toast"
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
      const message = result.alreadyResolved
        ? "Decision sudah diselesaikan sebelumnya; tampilan disegarkan."
        : `Decision ${pending.decision.decisionId} berhasil diselesaikan dengan action ${pending.action}.`
      setNotice(message)
      toast.add({
        title: "Decision Diselesaikan",
        description: message,
        type: "success",
      })
      setPending(null)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Decision gagal diselesaikan."
      setNotice(msg)
      toast.add({
        title: "Gagal Menyelesaikan Decision",
        description: msg,
        type: "error",
      })
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
