import React, { useState } from "react"
import { Plus } from "lucide-react"
import { useKnowledge } from "./hooks"
import {
  KnowledgeHeader,
  VaultHealthCard,
  KnowledgeCandidatesList,
  KnowledgeArchitecture,
  PromoteCandidateModal,
  RejectCandidateModal,
  CandidatePreviewModal,
  KnowledgeIngestModal,
  HarvestRunsOverview,
} from "./components"

export const KnowledgePage: React.FC = () => {
  const [ingestModalOpen, setIngestModalOpen] = useState(false)
  const {
    candidates,
    harvests,
    harvestsLoading,
    health,
    loading,
    actionLoading,
    previewModalOpen,
    setPreviewModalOpen,
    selectedCandidateForPreview,
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
    refetchHarvests,
    refetchCandidates,
    knowledgeSections,
  } = useKnowledge()

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <KnowledgeHeader loading={loading} onRefresh={refetchHealth} />
        </div>
        <button
          type="button"
          onClick={() => setIngestModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Ingest Knowledge</span>
        </button>
      </div>

      {/* Vault Health Summary & Interactive Drill-Down */}
      <VaultHealthCard health={health} onRefresh={refetchHealth} />

      {/* Harvested Repositories & Discovered Patterns Overview */}
      <HarvestRunsOverview harvests={harvests} isLoading={harvestsLoading} />

      {/* 2-Column: Candidate Decisions & Vault Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Candidates Decision Center (7 cols) */}
        <div className="lg:col-span-7">
          <KnowledgeCandidatesList
            candidates={candidates}
            actionLoading={actionLoading}
            onPromote={handleOpenPromote}
            onReject={handleOpenReject}
            onPreview={handleOpenPreview}
          />
        </div>

        {/* Right: Wiki Architecture Structure (5 cols) */}
        <div className="lg:col-span-5">
          <KnowledgeArchitecture sections={knowledgeSections} />
        </div>
      </div>

      {/* Knowledge Ingest Studio Modal */}
      <KnowledgeIngestModal
        isOpen={ingestModalOpen}
        onClose={() => setIngestModalOpen(false)}
        onSuccess={() => {
          if (refetchHarvests) refetchHarvests()
          if (refetchCandidates) refetchCandidates()
          if (refetchHealth) refetchHealth()
        }}
      />

      {/* Candidate Markdown Previewer Modal */}
      <CandidatePreviewModal
        isOpen={previewModalOpen}
        candidate={selectedCandidateForPreview}
        actionLoading={actionLoading}
        onClose={() => setPreviewModalOpen(false)}
        onPromote={handleOpenPromote}
        onReject={handleOpenReject}
      />

      {/* Promote Candidate Modal */}
      <PromoteCandidateModal
        isOpen={promoteModalOpen}
        candidate={selectedCandidateForPromote}
        targetPath={promoteTargetPath}
        onTargetPathChange={setPromoteTargetPath}
        actionLoading={actionLoading}
        onClose={() => setPromoteModalOpen(false)}
        onConfirm={handleConfirmPromote}
      />

      {/* Reject Candidate Modal */}
      <RejectCandidateModal
        isOpen={rejectModalOpen}
        candidate={selectedCandidateForReject}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        actionLoading={actionLoading}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
      />
    </div>
  )
}

export default KnowledgePage
