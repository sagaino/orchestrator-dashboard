import React from "react"
import { useRunsPage } from "./hooks"
import {
  RunsHeader,
  FilterTabs,
  RunsList,
  RunInspector,
  RequestChangesModal,
  AcceptRunModal,
  RejectRunModal,
} from "./components"

export const RunsPage: React.FC = () => {
  const {
    runsLoading,
    refetchRuns,
    filterState,
    setFilterState,
    searchQuery,
    setSearchQuery,
    selectedRun,
    setSelectedRun,
    activeTab,
    setActiveTab,
    revisionModalOpen,
    setRevisionModalOpen,
    revisionReason,
    setRevisionReason,
    inlineComments,
    handleAddInlineComment,
    handleRemoveInlineComment,
    visualAnnotations,
    handleAddVisualAnnotation,
    handleRemoveVisualAnnotation,
    acceptModalOpen,
    setAcceptModalOpen,
    rejectModalOpen,
    setRejectModalOpen,
    rejectReason,
    setRejectReason,
    diffData,
    diffLoading,
    actionLoading,
    filteredRuns,
    handleStart,
    handlePreview,
    handleAccept,
    handleReject,
    handleOpenRevisionModal,
    handleConfirmAccept,
    handleConfirmReject,
    handleRequestChangesSubmit,
    handleRecover,
    handleRetry,
  } = useRunsPage()

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <RunsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        runsLoading={runsLoading}
        onRefresh={refetchRuns}
      />

      {/* Filter Tabs */}
      <FilterTabs filterState={filterState} onFilterChange={setFilterState} />

      {/* 2-Column or Full-Width Inspector Layout */}
      <div className={`grid grid-cols-1 ${activeTab === "QA" ? "lg:grid-cols-1" : "lg:grid-cols-12"} gap-6`}>
        {/* Left: Runs List (Only show when not in full-width QA tab for maximum preview space) */}
        {activeTab !== "QA" && (
          <div className="lg:col-span-5 space-y-3">
            <RunsList
              runs={filteredRuns}
              selectedRun={selectedRun}
              onSelectRun={setSelectedRun}
            />
          </div>
        )}

        {/* Right: Selected Run Inspector */}
        <div className={activeTab === "QA" ? "w-full" : "lg:col-span-7"}>
          <RunInspector
            selectedRun={selectedRun}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            actionLoading={actionLoading}
            diffData={diffData}
            diffLoading={diffLoading}
            inlineComments={inlineComments}
            onAddInlineComment={handleAddInlineComment}
            onRemoveInlineComment={handleRemoveInlineComment}
            visualAnnotations={visualAnnotations}
            onAddVisualAnnotation={handleAddVisualAnnotation}
            onRemoveVisualAnnotation={handleRemoveVisualAnnotation}
            onPreview={handlePreview}
            onStart={handleStart}
            onRequestChanges={handleOpenRevisionModal}
            onAccept={handleAccept}
            onReject={handleReject}
            onRecover={handleRecover}
            onRetry={handleRetry}
          />
        </div>
      </div>

      {/* Request Changes Modal */}
      <RequestChangesModal
        isOpen={revisionModalOpen}
        reason={revisionReason}
        onReasonChange={setRevisionReason}
        actionLoading={actionLoading}
        onClose={() => setRevisionModalOpen(false)}
        onSubmit={handleRequestChangesSubmit}
        inlineComments={inlineComments}
        onRemoveComment={handleRemoveInlineComment}
        visualAnnotations={visualAnnotations}
        onRemoveVisualAnnotation={handleRemoveVisualAnnotation}
      />

      {/* Accept & Wiki Sync Confirmation Modal */}
      <AcceptRunModal
        isOpen={acceptModalOpen}
        run={selectedRun}
        actionLoading={actionLoading}
        onClose={() => setAcceptModalOpen(false)}
        onConfirm={handleConfirmAccept}
      />

      {/* Reject Run Modal */}
      <RejectRunModal
        isOpen={rejectModalOpen}
        run={selectedRun}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        actionLoading={actionLoading}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
      />
    </div>
  )
}

export default RunsPage

