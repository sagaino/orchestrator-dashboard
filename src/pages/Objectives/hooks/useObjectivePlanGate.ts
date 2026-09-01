import { useState } from "react"
import { useApproveObjectivePlan, useMaterializeObjectivePlan } from "@/hooks/use-orchestrator"
import { evaluatePlanAdmission } from "@/lib/plan-admission"
import type { ObjectiveLifecycleDetail, UseObjectivePlanGateReturn } from "../types"

export const useObjectivePlanGate = (lifecycle: ObjectiveLifecycleDetail): UseObjectivePlanGateReturn => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const approve = useApproveObjectivePlan()
  const materialize = useMaterializeObjectivePlan()

  const plan = lifecycle.plan ?? null
  const admission = evaluatePlanAdmission(plan)
  const canApprove = plan?.state === "PENDING_APPROVAL" && admission.allowed
  const actionLabel = !admission.allowed ? "Approval blocked" : canApprove ? "Approve & Run" : "Materialize & Run"
  const busy = approve.isPending || materialize.isPending

  const run = async () => {
    if (!plan) return
    if (!admission.allowed) {
      setMessage(admission.blockers.map((blocker) => blocker.message).join(" "))
      return
    }
    try {
      setMessage(null)
      const approved = canApprove
        ? await approve.mutateAsync({ objectiveId: lifecycle.objectiveId, planFingerprint: plan.planFingerprint })
        : { objective: lifecycle, plan, planFingerprint: plan.planFingerprint }
      if ("automation" in approved && approved.automation?.started) {
        setMessage(`${approved.tasks?.length ?? 0} task berhasil dibuat dan orchestration otomatis dimulai.`)
        setOpen(false)
        return
      }
      const fingerprint = approved.planFingerprint ?? approved.plan.planFingerprint
      if (!fingerprint) throw new Error("Plan fingerprint tidak tersedia untuk materialization.")
      const result = await materialize.mutateAsync({
        objectiveId: lifecycle.objectiveId,
        planId: approved.plan.planId,
        planFingerprint: fingerprint,
      })
      setMessage(`${result.tasks.length} task berhasil dibuat dan orchestration ${result.orchestration.orchestrationId} dimulai.`)
      setOpen(false)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Plan tidak dapat disetujui dan dijalankan.")
    }
  }

  return {
    open,
    setOpen,
    message,
    plan,
    canApprove,
    actionLabel,
    busy,
    run,
  }
}
