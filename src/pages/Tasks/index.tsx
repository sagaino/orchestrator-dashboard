import React from "react"
import { useTasks } from "./hooks"
import { TaskIntakeForm, LiveJobQueue } from "./components"

export const TasksPage: React.FC = () => {
  const {
    projects,
    queueJobs,
    selectedProject,
    setSelectedProject,
    prompt,
    setPrompt,
    autoStart,
    setAutoStart,
    statusMessage,
    submitting,
    handleSubmit,
    refetchDaemon,
  } = useTasks()

  return (
    <div className="max-w-7xl mx-auto space-y-8">
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
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            prompt={prompt}
            onPromptChange={setPrompt}
            autoStart={autoStart}
            onAutoStartChange={setAutoStart}
            statusMessage={statusMessage}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Right Status: Live Queue & Pipeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <LiveJobQueue jobs={queueJobs} onRefresh={refetchDaemon} />
        </div>
      </div>
    </div>
  )
}

export default TasksPage
