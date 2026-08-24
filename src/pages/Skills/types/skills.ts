import type { SkillCatalog, SkillCatalogEntry } from "@/services/orchestrator"

export type SkillStatusFilter = "ALL" | "ENABLED" | "DISABLED"

export interface SkillSummary {
  totalInstalled: number
  totalEnabled: number
  totalAssignments: number
}

export interface SkillHeaderProps {
  registryState?: string
}

export interface SkillSummaryCardsProps {
  summary: SkillSummary
}

export interface SkillFiltersProps {
  query: string
  onQueryChange: (query: string) => void
  status: SkillStatusFilter
  onStatusChange: (status: SkillStatusFilter) => void
}

export interface SkillCardProps {
  skill: SkillCatalogEntry
  isSelected: boolean
  onSelect: (skill: SkillCatalogEntry) => void
}

export interface SkillListProps {
  skills: SkillCatalogEntry[]
  selectedSkill: SkillCatalogEntry | null
  onSelectSkill: (skill: SkillCatalogEntry) => void
}

export interface SkillDetailProps {
  skill: SkillCatalogEntry | null
  onToggle: (skill: SkillCatalogEntry) => void
  busy: boolean
}

export interface SkillConfirmationModalProps {
  confirm: SkillCatalogEntry | null
  isPending: boolean
  isError: boolean
  errorMessage?: string | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

export interface SkillOperatorNoticeProps {
  className?: string
}

export interface UseSkillsReturn {
  catalog: SkillCatalog | undefined
  skills: SkillCatalogEntry[]
  filtered: SkillCatalogEntry[]
  selected: SkillCatalogEntry | null
  selectedId: string | null
  query: string
  status: SkillStatusFilter
  confirm: SkillCatalogEntry | null
  isLoading: boolean
  isError: boolean
  isPendingToggle: boolean
  isToggleError: boolean
  toggleErrorMessage: string | null
  summary: SkillSummary
  setQuery: (query: string) => void
  setStatus: (status: SkillStatusFilter) => void
  setSelectedId: (id: string | null) => void
  setConfirm: (skill: SkillCatalogEntry | null) => void
  handleSelectSkill: (skill: SkillCatalogEntry) => void
  handleOpenToggleModal: (skill: SkillCatalogEntry) => void
  handleCloseToggleModal: () => void
  handleToggleSkill: () => Promise<void>
  refetch: () => Promise<unknown>
}
