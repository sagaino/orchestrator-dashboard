import React from "react"
import { useTasks } from "./hooks"
import { TaskIntakeForm, LiveJobQueue, ClarificationModal, PlanReviewPanel } from "./components"

export const TasksPage: React.FC = () => {
  const {
    targetMode,
    setTargetMode,
    crossProjectEnabled,
    projects,
    queueJobs,
    selectedProject,
    setSelectedProject,
    projectRelationships,
    relationshipDiagnostics,
    linkedProjectIds,
    setLinkedProjectIds,
    relationshipsLoading,
    freshProjectId,
    setFreshProjectId,
    freshTargetDirectory,
    setFreshTargetDirectory,
    freshBlueprint,
    setFreshBlueprint,
    prompt,
    setPrompt,
    attachedAssets,
    handleAddAsset,
    handleRemoveAsset,
    isUploadingAsset,
    handleUploadFile,
    statusMessage,
    submitting,
    handleSubmit,
    handleRetryPlan,
    refetchDaemon,
    clarificationOpen,
    clarificationQuestion,
    clarificationAnswer,
    setClarificationAnswer,
    handleCloseClarification,
    handleSubmitClarification,
    pendingPrompt,
    planReviewOpen,
    planReviewObjective,
    planReview,
    planReviewDecisions,
    planReviewActionLoading,
    skillCatalog,
    handleAssignPlanSkills,
    handleClosePlanReview,
    handleApprovePlan,
    handleRequestPlanChanges,
    handleCancelObjective,
  } = useTasks()

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Task Intake & Live Execution</h1>
        <p className="text-sm text-slate-400">
          Kirim instruksi bahasa alami. Orchestrator akan menyusun spesifikasi, memverifikasi readiness gate, dan mengorkestrasi eksekusi agent.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Task Intake (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <TaskIntakeForm
            targetMode={targetMode}
            onTargetModeChange={setTargetMode}
            crossProjectEnabled={crossProjectEnabled}
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            projectRelationships={projectRelationships}
            relationshipDiagnostics={relationshipDiagnostics}
            linkedProjectIds={linkedProjectIds}
            onLinkedProjectIdsChange={setLinkedProjectIds}
            relationshipsLoading={relationshipsLoading}
            freshProjectId={freshProjectId}
            onFreshProjectIdChange={setFreshProjectId}
            freshTargetDirectory={freshTargetDirectory}
            onFreshTargetDirectoryChange={setFreshTargetDirectory}
            freshBlueprint={freshBlueprint}
            onFreshBlueprintChange={setFreshBlueprint}
            prompt={prompt}
            onPromptChange={setPrompt}
            attachedAssets={attachedAssets}
            onAddAsset={handleAddAsset}
            onRemoveAsset={handleRemoveAsset}
            isUploadingAsset={isUploadingAsset}
            onUploadFile={handleUploadFile}
            statusMessage={statusMessage}
            onRetryPlan={handleRetryPlan}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Right Status: Live Queue & Pipeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <LiveJobQueue jobs={queueJobs} onRefresh={refetchDaemon} />
        </div>
      </div>

      {/* Interactive Clarification Modal */}
      <ClarificationModal
        isOpen={clarificationOpen}
        question={clarificationQuestion}
        answer={clarificationAnswer}
        onAnswerChange={setClarificationAnswer}
        submitting={submitting}
        onClose={handleCloseClarification}
        onSubmit={handleSubmitClarification}
        originalPrompt={pendingPrompt || prompt}
      />

      <PlanReviewPanel
        isOpen={planReviewOpen}
        objective={planReviewObjective}
        plan={planReview}
        decisions={planReviewDecisions}
        actionLoading={planReviewActionLoading}
        skillCatalog={skillCatalog}
        onAssignSkills={handleAssignPlanSkills}
        onClose={handleClosePlanReview}
        onApprove={handleApprovePlan}
        onRequestChanges={handleRequestPlanChanges}
        onCancel={handleCancelObjective}
      />
    </div>
  )
}

export default TasksPage
