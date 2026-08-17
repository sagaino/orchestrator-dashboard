import React from "react"
import { useKnowledge } from "./hooks"
import {
  KnowledgeHeader,
  VaultHealthCard,
  KnowledgeCandidatesList,
  KnowledgeArchitecture,
  PromoteCandidateModal,
  RejectCandidateModal,
  CandidatePreviewModal,
} from "./components"

export const KnowledgePage: React.FC = () => {
  const {
    candidates,
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
    knowledgeSections,
  } = useKnowledge()

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <KnowledgeHeader loading={loading} onRefresh={refetchHealth} />

      {/* Vault Health Summary & Interactive Drill-Down */}
      <VaultHealthCard health={health} onRefresh={refetchHealth} />

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
