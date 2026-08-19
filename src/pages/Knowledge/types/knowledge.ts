import type { FormEvent } from "react"
import type { KnowledgeCandidate, VaultHealth } from "@/services/orchestrator"

export interface KnowledgeSectionItem {
  title: string
  path: string
  desc: string
}

export interface KnowledgeHeaderProps {
  loading: boolean
  onRefresh?: () => void
}

export interface VaultHealthCardProps {
  health: VaultHealth | null
  onRefresh?: () => void
}

export interface CandidateCardProps {
  candidate: KnowledgeCandidate
  actionLoading: boolean
  onPromote: (candidate: KnowledgeCandidate) => void
  onReject: (candidate: KnowledgeCandidate) => void
  onPreview?: (candidate: KnowledgeCandidate) => void
}

export interface KnowledgeCandidatesListProps {
  candidates: KnowledgeCandidate[]
  actionLoading: boolean
  onPromote: (candidate: KnowledgeCandidate) => void
  onReject: (candidate: KnowledgeCandidate) => void
  onPreview?: (candidate: KnowledgeCandidate) => void
}

export interface CandidatePreviewModalProps {
  isOpen: boolean
  candidate: KnowledgeCandidate | null
  actionLoading: boolean
  onClose: () => void
  onPromote: (candidate: KnowledgeCandidate) => void
  onReject: (candidate: KnowledgeCandidate) => void
}

export interface PromoteCandidateModalProps {
  isOpen: boolean
  candidate: KnowledgeCandidate | null
  targetPath: string
  onTargetPathChange: (path: string) => void
  actionLoading: boolean
  onClose: () => void
  onConfirm: (e: FormEvent) => Promise<void>
}

export interface RejectCandidateModalProps {
  isOpen: boolean
  candidate: KnowledgeCandidate | null
  reason: string
  onReasonChange: (reason: string) => void
  actionLoading: boolean
  onClose: () => void
  onConfirm: (e: FormEvent) => Promise<void>
}

export interface KnowledgeArchitectureProps {
  sections: KnowledgeSectionItem[]
}

export interface UseKnowledgeReturn {
  candidates: KnowledgeCandidate[]
  harvests: import("@/services/orchestrator").HarvestRun[]
  harvestsLoading: boolean
  health: VaultHealth | null
  loading: boolean
  actionLoading: boolean
  previewModalOpen: boolean
  setPreviewModalOpen: (open: boolean) => void
  selectedCandidateForPreview: KnowledgeCandidate | null
  setSelectedCandidateForPreview: (candidate: KnowledgeCandidate | null) => void
  handleOpenPreview: (candidate: KnowledgeCandidate) => void
  promoteModalOpen: boolean
  setPromoteModalOpen: (open: boolean) => void
  selectedCandidateForPromote: KnowledgeCandidate | null
  promoteTargetPath: string
  setPromoteTargetPath: (path: string) => void
  rejectModalOpen: boolean
  setRejectModalOpen: (open: boolean) => void
  selectedCandidateForReject: KnowledgeCandidate | null
  rejectReason: string
  setRejectReason: (reason: string) => void
  handleOpenPromote: (candidate: KnowledgeCandidate) => void
  handleOpenReject: (candidate: KnowledgeCandidate) => void
  handleConfirmPromote: (e: FormEvent) => Promise<void>
  handleConfirmReject: (e: FormEvent) => Promise<void>
  refetchHealth?: () => void
  refetchHarvests?: () => void
  refetchCandidates?: () => void
  knowledgeSections: KnowledgeSectionItem[]
}

