import { useMemo, useState } from "react"
import { useSkillCatalog, useUpdateSkillEnabled } from "@/hooks/use-orchestrator"
import type { SkillCatalogEntry } from "@/services/orchestrator"
import type { SkillStatusFilter, SkillSummary, UseSkillsReturn } from "../types"

const EMPTY_SKILLS: SkillCatalogEntry[] = []

export const useSkills = (): UseSkillsReturn => {
  const { data: catalog, isLoading, isError, refetch } = useSkillCatalog()
  const updateSkill = useUpdateSkillEnabled()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<SkillStatusFilter>("ALL")
  const [confirm, setConfirm] = useState<SkillCatalogEntry | null>(null)

  const skills = catalog?.skills ?? EMPTY_SKILLS

  const filtered = useMemo(() => skills.filter((skill) => {
    const text = `${skill.skillId} ${skill.version} ${skill.purpose} ${skill.supportedRoles.join(" ")}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (status === "ALL" || (status === "ENABLED" ? skill.enabled : !skill.enabled))
  }), [query, skills, status])

  const selected = skills.find((skill) => `${skill.skillId}@${skill.version}` === selectedId) ?? filtered[0] ?? null

  const summary: SkillSummary = useMemo(() => {
    const totalInstalled = skills.length
    const totalEnabled = skills.filter((skill) => skill.enabled).length
    const totalAssignments = skills.reduce(
      (sum, skill) => sum + skill.usage.planAssignments + skill.usage.runAssignments,
      0
    )
    return {
      totalInstalled,
      totalEnabled,
      totalAssignments,
    }
  }, [skills])

  const handleSelectSkill = (skill: SkillCatalogEntry) => {
    setSelectedId(`${skill.skillId}@${skill.version}`)
  }

  const handleOpenToggleModal = (skill: SkillCatalogEntry) => {
    setConfirm(skill)
  }

  const handleCloseToggleModal = () => {
    if (!updateSkill.isPending) {
      setConfirm(null)
    }
  }

  const handleToggleSkill = async () => {
    if (!confirm) return
    try {
      await updateSkill.mutateAsync({
        skillId: confirm.skillId,
        version: confirm.version,
        enabled: !confirm.enabled,
      })
      setConfirm(null)
    } catch {
      // Mutation error is handled by React Query state; keep confirmation open for retry.
    }
  }

  const toggleErrorMessage = updateSkill.isError
    ? updateSkill.error instanceof Error
      ? updateSkill.error.message
      : "Perubahan status skill gagal."
    : null

  return {
    catalog,
    skills,
    filtered,
    selected,
    selectedId,
    query,
    status,
    confirm,
    isLoading,
    isError,
    isPendingToggle: updateSkill.isPending,
    isToggleError: updateSkill.isError,
    toggleErrorMessage,
    summary,
    setQuery,
    setStatus,
    setSelectedId,
    setConfirm,
    handleSelectSkill,
    handleOpenToggleModal,
    handleCloseToggleModal,
    handleToggleSkill,
    refetch,
  }
}
