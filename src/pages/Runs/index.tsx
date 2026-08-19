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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <RunsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        runsLoading={runsLoading}
        onRefresh={refetchRuns}
      />

      {/* Filter Tabs */}
      <FilterTabs filterState={filterState} onFilterChange={setFilterState} />

      {/* 2-Column Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Runs List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <RunsList
            runs={filteredRuns}
            selectedRun={selectedRun}
            onSelectRun={setSelectedRun}
          />
        </div>

        {/* Right: Selected Run Inspector (7 cols) */}
        <div className="lg:col-span-7">
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

