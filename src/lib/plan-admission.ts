import type { ObjectivePlanReview } from "@/services/orchestrator"

export interface PlanAdmissionBlocker {
  code: string
  message: string
}

export interface PlanAdmissionResult {
  allowed: boolean
  blockers: PlanAdmissionBlocker[]
}

const scriptMatchesCapability = (capability: string, script?: string) => {
  const value = String(script ?? "").trim()
  if (!value) return false
  if (capability === "TYPECHECK") return /^(?:typecheck|type-check|check-types|tsc)(?::[\w.-]+)?$/i.test(value)
  if (capability === "LINT") return /^(?:lint|eslint|lint:all|golangci-lint)(?::[\w.-]+)?$/i.test(value)
  if (capability === "BUILD") return /^(?:build|build:prod|bundle)(?::[\w.-]+)?$/i.test(value)
  if (capability === "E2E") return /^(?:test:e2e|e2e|e2e:test|playwright|cypress)(?:[:.-][\w.-]+)?$/i.test(value)
  if (capability === "INTEGRATION") return /^(?:test:integration|integration|test:int)(?::[\w.-]+)?$/i.test(value)
  if (capability === "UNIT") return /^(?:test:unit|unit|test)(?::[\w.-]+)?$/i.test(value)
  return capability === "CUSTOM_APPROVED"
}

export const evaluatePlanAdmission = (plan: ObjectivePlanReview | null | undefined): PlanAdmissionResult => {
  const blockers: PlanAdmissionBlocker[] = []
  if (!plan) return { allowed: false, blockers: [{ code: "PLAN_MISSING", message: "Plan belum tersedia." }] }
  if (plan.schemaVersion !== 2) blockers.push({ code: "PLAN_V2_REQUIRED", message: "Plan historis tetap dapat dibaca, tetapi harus di-replan ke contract v2 sebelum dieksekusi." })
  if (!plan.planFingerprint || !/^[a-f0-9]{64}$/i.test(plan.planFingerprint)) blockers.push({ code: "PLAN_FINGERPRINT_MISSING", message: "Fingerprint SHA-256 plan belum tersedia atau tidak valid." })
  if (plan.clarificationNeeded) blockers.push({ code: "PLAN_CLARIFICATION_REQUIRED", message: "Plan masih membutuhkan klarifikasi." })

  const intent = plan.verificationIntent
  if (!intent) {
    blockers.push({ code: "VERIFICATION_INTENT_MISSING", message: "Verification intent belum tersedia." })
  } else {
    if (intent.contractVersion !== 2) blockers.push({ code: "VERIFICATION_INTENT_V2_REQUIRED", message: "Verification intent belum menggunakan contract v2." })
    if (!["RESOLVED", "RESOLVED_WITH_WAIVERS"].includes(intent.status)) blockers.push({ code: "VERIFICATION_INTENT_UNRESOLVED", message: `Verification intent masih ${intent.status}.` })
    if (!Array.isArray(intent.missing) || intent.missing.length > 0) blockers.push({ code: "VERIFICATION_REQUIREMENT_MISSING", message: "Masih ada verification requirement yang belum diselesaikan." })
    for (const item of intent.resolved ?? []) {
      if (item.script && !scriptMatchesCapability(item.capability, item.script)) blockers.push({ code: "VERIFICATION_CAPABILITY_MISMATCH", message: `${item.capability} tidak boleh dipenuhi oleh script ${item.script}.` })
      if (!item.script && !item.runner) blockers.push({ code: "VERIFICATION_TARGET_MISSING", message: `${item.projectId}:${item.capability} belum memiliki script atau runner.` })
      const plannedTargets = [
        ...plan.nodes.filter((node) => node.projectId === item.projectId).flatMap((node) => node.verification),
        ...plan.integration.projectVerification,
        ...plan.integration.crossProjectVerification,
      ]
      if ((item.script || item.runner) && !plannedTargets.some((target) => target === (item.script ?? item.runner) || target === `${item.projectId}:${item.script ?? item.runner}`)) {
        blockers.push({ code: "VERIFICATION_TARGET_NOT_PLANNED", message: `${item.projectId}:${item.script ?? item.runner} tidak ada di verification plan.` })
      }
    }
    for (const item of intent.waived ?? []) {
      if (!item.reason || !item.waivedBy || !item.waivedAt) blockers.push({ code: "VERIFICATION_WAIVER_INVALID", message: `${item.projectId}:${item.capability} memiliki waiver yang tidak lengkap.` })
    }
    for (const required of intent.required ?? []) {
      const matches = (item: typeof required) => item.projectId === required.projectId && item.capability === required.capability
      const resolutions = (intent.resolved ?? []).filter(matches).length + (intent.waived ?? []).filter(matches).length
      if (resolutions !== 1) blockers.push({ code: "VERIFICATION_REQUIREMENT_UNACCOUNTED", message: `${required.projectId}:${required.capability} harus memiliki tepat satu resolution atau waiver.` })
    }
  }

  for (const projectId of plan.projects) {
    const blueprint = plan.blueprints?.[projectId]
    if (!blueprint) blockers.push({ code: "BLUEPRINT_EVIDENCE_MISSING", message: `Blueprint evidence belum tersedia untuk ${projectId}.` })
    else if (!blueprint.valid || !blueprint.policyFingerprint || !/^[a-f0-9]{64}$/i.test(blueprint.policyFingerprint)) blockers.push({ code: "BLUEPRINT_EVIDENCE_INVALID", message: `Blueprint atau policy fingerprint ${projectId} belum valid.` })
  }
  return { allowed: blockers.length === 0, blockers }
}
