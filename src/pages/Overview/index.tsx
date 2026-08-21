import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useOverview } from "./hooks"
import {
  WelcomeBanner,
  MetricsCards,
  RegisteredProjects,
  QuickTaskIntake,
} from "./components"
import { RemoveProjectModal } from "@/components/project/RemoveProjectModal"

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate()
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [targetProject, setTargetProject] = useState<{ id: string; repo?: string } | null>(null)

  const {
    daemon,
    projects,
    quickPrompt,
    setQuickPrompt,
    selectedProject,
    setSelectedProject,
    submitting,
    quickSuccess,
    reviewRuns,
    completedRuns,
    handleQuickSubmit,
  } = useOverview()

  const handleLaunchTask = () => {
    navigate("/tasks")
  }

  const handleSelectProjectAndNavigate = (projectId: string) => {
    setSelectedProject(projectId)
    navigate("/tasks")
  }

  const handleOpenRemoveModal = (projectId: string, repository?: string) => {
    setTargetProject({ id: projectId, repo: repository })
    setRemoveModalOpen(true)
  }

  return (
    <div className="w-full space-y-8">
      {/* Top Welcome Banner */}
      <WelcomeBanner onLaunchTask={handleLaunchTask} />

      {/* Metrics Row */}
      <MetricsCards
        daemon={daemon}
        reviewCount={reviewRuns.length}
        projectCount={projects.length}
        completedCount={completedRuns.length}
      />

      {/* Main Grid: Projects & Fast Intake */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Registered Projects */}
        <div className="lg:col-span-2">
          <RegisteredProjects
            projects={projects}
            onCreateTask={handleSelectProjectAndNavigate}
            onRemoveProject={handleOpenRemoveModal}
          />
        </div>

        {/* Right 1 Col: Quick Task Launcher */}
        <div>
          <QuickTaskIntake
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            prompt={quickPrompt}
            onPromptChange={setQuickPrompt}
            submitting={submitting}
            successMessage={quickSuccess}
            onSubmit={handleQuickSubmit}
          />
        </div>
      </div>

      {/* Remove / Purge Project Modal */}
      <RemoveProjectModal
        isOpen={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false)
          setTargetProject(null)
        }}
        projectId={targetProject?.id ?? null}
        projectRepo={targetProject?.repo}
      />
    </div>
  )
}

export default OverviewPage
