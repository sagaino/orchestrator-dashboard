import { useState, type FormEvent } from "react"
import { useKnowledgeCandidates, useHarvestRuns, useKnowledgeHealth, usePromoteKnowledge, useRejectKnowledge } from "@/hooks/use-orchestrator"
import { toast } from "@/components/ui/toast"
import type { KnowledgeCandidate } from "@/services/orchestrator"
import type { UseKnowledgeReturn, KnowledgeSectionItem } from "../types"

const DEFAULT_KNOWLEDGE_SECTIONS: KnowledgeSectionItem[] = [
  { title: "Concepts", path: "01-Knowledge/concepts/", desc: "Konsep fundamental, state management, dan arsitektur." },
  { title: "Patterns", path: "01-Knowledge/patterns/", desc: "Standar implementasi frontend/backend yang dapat digunakan kembali." },
  { title: "Snippets", path: "01-Knowledge/snippets/", desc: "Potongan kode hooks, utilities, dan komponen reusable." },
  { title: "Decisions", path: "01-Knowledge/decisions/", desc: "Architectural Decision Records (ADR) dan roadmap produk." },
  { title: "Debugging", path: "01-Knowledge/debugging/", desc: "Catatan investigasi root-cause dan cara perbaikan bug." },
]

export const useKnowledge = (): UseKnowledgeReturn => {
  const { data: candidates = [], isLoading: candidatesLoading } = useKnowledgeCandidates()
  const { data: harvests = [], isLoading: harvestsLoading } = useHarvestRuns()
  const { data: health = null, isLoading: healthLoading, refetch: refetchHealth } = useKnowledgeHealth()
  const { mutateAsync: promoteKnowledge, isPending: promotePending } = usePromoteKnowledge()
  const { mutateAsync: rejectKnowledge, isPending: rejectPending } = useRejectKnowledge()

  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [selectedCandidateForPreview, setSelectedCandidateForPreview] = useState<KnowledgeCandidate | null>(null)

  const [promoteModalOpen, setPromoteModalOpen] = useState(false)
  const [selectedCandidateForPromote, setSelectedCandidateForPromote] = useState<KnowledgeCandidate | null>(null)
  const [promoteTargetPath, setPromoteTargetPath] = useState("")

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedCandidateForReject, setSelectedCandidateForReject] = useState<KnowledgeCandidate | null>(null)
  const [rejectReason, setRejectReason] = useState("Duplicate or not reusable")

  const loading = candidatesLoading || healthLoading
  const actionLoading = promotePending || rejectPending

  const handleOpenPreview = (candidate: KnowledgeCandidate) => {
    setSelectedCandidateForPreview(candidate)
    setPreviewModalOpen(true)
  }

  const handleOpenPromote = (candidate: KnowledgeCandidate) => {
    setSelectedCandidateForPromote(candidate)
    setPromoteTargetPath("")
    setPromoteModalOpen(true)
  }

  const handleConfirmPromote = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedCandidateForPromote) return
    try {
      await promoteKnowledge({
        selector: selectedCandidateForPromote.candidateId,
        targetPath: promoteTargetPath.trim() || undefined,
      })
      setPromoteModalOpen(false)
      if (selectedCandidateForPreview?.candidateId === selectedCandidateForPromote.candidateId) {
        setPreviewModalOpen(false)
      }
      toast.add({
        title: "Candidate Dipromosikan",
        description: `Candidate "${selectedCandidateForPromote.title}" berhasil dipromosikan ke 01-Knowledge/!`,
        type: "success",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Promosi",
        description: errorMessage,
        type: "error",
      })
    }
  }

  const handleOpenReject = (candidate: KnowledgeCandidate) => {
    setSelectedCandidateForReject(candidate)
    setRejectReason("Duplicate or not reusable")
    setRejectModalOpen(true)
  }

  const handleConfirmReject = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedCandidateForReject) return
    try {
      await rejectKnowledge({
        selector: selectedCandidateForReject.candidateId,
        reason: rejectReason.trim() || "Duplicate or not reusable",
      })
      setRejectModalOpen(false)
      if (selectedCandidateForPreview?.candidateId === selectedCandidateForReject.candidateId) {
        setPreviewModalOpen(false)
      }
      toast.add({
        title: "Candidate Ditolak",
        description: `Candidate "${selectedCandidateForReject.title}" berhasil ditolak dan diarsipkan.`,
        type: "info",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast.add({
        title: "Gagal Reject",
        description: errorMessage,
        type: "error",
      })
    }
  }

  return {
    candidates,
    harvests,
    harvestsLoading,
    health,
    loading: loading || harvestsLoading,
    actionLoading,
    previewModalOpen,
    setPreviewModalOpen,
    selectedCandidateForPreview,
    setSelectedCandidateForPreview,
    handleOpenPreview,
    promoteModalOpen,
    setPromoteModalOpen,
    selectedCandidateForPromote,
    promoteTargetPath,
    setPromoteTargetPath,
    rejectModalOpen,
    setRejectModalOpen,
    selectedCandidateForReject,
    rejectReason,
    setRejectReason,
    handleOpenPromote,
    handleOpenReject,
    handleConfirmPromote,
    handleConfirmReject,
    refetchHealth,
    knowledgeSections: DEFAULT_KNOWLEDGE_SECTIONS,
  }
}

